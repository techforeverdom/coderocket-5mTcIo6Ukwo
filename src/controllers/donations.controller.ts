import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { DonationService } from '../services/donation.service';
import { CampaignService } from '../services/campaign.service';
import { ParticipantService } from '../services/participant.service';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  amountCents: z.number().min(50, 'Minimum donation is $0.50'),
  campaignId: z.string().uuid('Invalid campaign ID'),
  participantId: z.string().uuid('Invalid participant ID').optional(),
  donorEmail: z.string().email('Invalid email address').optional(),
  donorName: z.string().min(1, 'Donor name is required').optional(),
  message: z.string().max(500, 'Message too long').optional(),
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

export class DonationsController {
  /**
   * POST /donations/checkout
   * Create a PaymentIntent for donation checkout
   */
  static async createCheckout(req: Request, res: Response) {
    try {
      const validatedData = createCheckoutSchema.parse(req.body);
      const { amountCents, campaignId, participantId, donorEmail, donorName, message } = validatedData;

      // Verify campaign exists and is active
      const campaign = await CampaignService.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      if (campaign.status !== 'active') {
        return res.status(400).json({ error: 'Campaign is not active' });
      }

      // Verify participant exists if provided
      if (participantId) {
        const participant = await ParticipantService.findById(participantId);
        if (!participant || participant.campaign_id !== campaignId) {
          return res.status(404).json({ error: 'Participant not found or not in this campaign' });
        }
      }

      // Calculate fees
      const feeCalculation = StripeService.calculateFees(amountCents);

      // Generate idempotency key from request headers or create new one
      const idempotencyKey = req.headers['idempotency-key'] as string;

      // Create PaymentIntent
      const paymentIntent = await StripeService.createPaymentIntent({
        amountCents,
        campaignId,
        participantId,
        donorEmail,
        donorName,
        message,
        idempotencyKey,
      });

      // Create pending donation record
      const donation = await DonationService.create({
        id: paymentIntent.id.replace('pi_', 'don_'), // Generate donation ID from PI ID
        campaignId,
        participantId,
        amountCents,
        feeCents: feeCalculation.totalFeeCents,
        netCents: feeCalculation.netCents,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        message,
        donorEmail,
        donorName,
      });

      res.status(201).json({
        success: true,
        data: {
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
          donation: {
            id: donation.id,
            amountCents: donation.amount_cents,
            feeCents: donation.fee_cents,
            netCents: donation.net_cents,
            status: donation.status,
          },
          feeBreakdown: feeCalculation,
        },
      });
    } catch (error) {
      console.error('Error creating checkout:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(500).json({
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /donations/confirm
   * Confirm a PaymentIntent and update donation status
   */
  static async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentIntentId } = confirmPaymentSchema.parse(req.body);

      // Retrieve PaymentIntent from Stripe
      const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId);

      // Find corresponding donation
      const donation = await DonationService.findByStripePaymentIntentId(paymentIntentId);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      // Update donation status based on PaymentIntent status
      let status: 'pending' | 'succeeded' | 'failed';
      switch (paymentIntent.status) {
        case 'succeeded':
          status = 'succeeded';
          break;
        case 'canceled':
        case 'payment_failed':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }

      const updatedDonation = await DonationService.updateStatus(donation.id, status);

      res.json({
        success: true,
        data: {
          donation: updatedDonation,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
          },
        },
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(500).json({
        error: 'Failed to confirm payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /donations/:id
   * Get donation details
   */
  static async getDonation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const donation = await DonationService.findById(id);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      res.json({
        success: true,
        data: donation,
      });
    } catch (error) {
      console.error('Error getting donation:', error);
      res.status(500).json({
        error: 'Failed to get donation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /donations/:id/refund
   * Create a refund for a donation
   */
  static async createRefund(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amountCents, reason } = req.body;

      const donation = await DonationService.findById(id);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      if (donation.status !== 'succeeded') {
        return res.status(400).json({ error: 'Can only refund succeeded donations' });
      }

      // Generate idempotency key
      const idempotencyKey = req.headers['idempotency-key'] as string;

      // Create refund in Stripe
      const refund = await StripeService.createRefund(
        donation.stripe_payment_intent_id,
        amountCents,
        reason,
        idempotencyKey
      );

      // Update donation status
      const updatedDonation = await DonationService.updateStatus(donation.id, 'refunded');

      res.json({
        success: true,
        data: {
          refund: {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
            reason: refund.reason,
          },
          donation: updatedDonation,
        },
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      res.status(500).json({
        error: 'Failed to create refund',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}