import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { WebhookService } from '../services/webhook.service';
import { DonationService } from '../services/donation.service';
import { DonorService } from '../services/donor.service';
import Stripe from 'stripe';

export class WebhooksController {
  /**
   * POST /webhooks/stripe
   * Handle Stripe webhook events
   */
  static async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      // Verify webhook signature
      const event = StripeService.verifyWebhookSignature(req.body, signature);

      // Log webhook event
      await WebhookService.logEvent({
        source: 'stripe',
        eventType: event.type,
        payload: event,
        receivedAt: new Date(),
      });

      // Process the event
      await WebhooksController.processStripeEvent(event);

      // Mark webhook as processed
      await WebhookService.markAsProcessed(event.id);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      
      // Log failed webhook
      await WebhookService.logEvent({
        source: 'stripe',
        eventType: 'webhook.error',
        payload: { error: error instanceof Error ? error.message : 'Unknown error' },
        receivedAt: new Date(),
        processed: false,
      });

      res.status(400).json({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Process different types of Stripe events
   */
  private static async processStripeEvent(event: Stripe.Event) {
    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await WebhooksController.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await WebhooksController.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await WebhooksController.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.dispute.created':
        await WebhooksController.handleChargeDispute(event.data.object as Stripe.Dispute);
        break;

      case 'invoice.payment_succeeded':
        // Handle subscription payments if needed
        console.log('Invoice payment succeeded:', event.data.object);
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellations if needed
        console.log('Subscription deleted:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful payment intent
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const donation = await DonationService.findByStripePaymentIntentId(paymentIntent.id);
      if (!donation) {
        console.error(`Donation not found for PaymentIntent: ${paymentIntent.id}`);
        return;
      }

      // Extract metadata
      const metadata = paymentIntent.metadata;
      const donorEmail = metadata.donor_email || paymentIntent.receipt_email;
      const donorName = metadata.donor_name;

      // Upsert donor if email is available
      let donorId = donation.donor_id;
      if (donorEmail) {
        const donor = await DonorService.upsertByEmail({
          email: donorEmail,
          firstName: donorName?.split(' ')[0] || 'Anonymous',
          lastName: donorName?.split(' ').slice(1).join(' ') || 'Donor',
          phone: null, // Could be extracted from payment method if available
        });
        donorId = donor.id;
      }

      // Update donation status and donor
      await DonationService.update(donation.id, {
        status: 'succeeded',
        donorId,
        stripePaymentIntentId: paymentIntent.id,
      });

      console.log(`Donation ${donation.id} marked as succeeded`);
    } catch (error) {
      console.error('Error handling payment_intent.succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent
   */
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const donation = await DonationService.findByStripePaymentIntentId(paymentIntent.id);
      if (!donation) {
        console.error(`Donation not found for PaymentIntent: ${paymentIntent.id}`);
        return;
      }

      // Update donation status
      await DonationService.updateStatus(donation.id, 'failed');

      console.log(`Donation ${donation.id} marked as failed`);
    } catch (error) {
      console.error('Error handling payment_intent.payment_failed:', error);
      throw error;
    }
  }

  /**
   * Handle canceled payment intent
   */
  private static async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      const donation = await DonationService.findByStripePaymentIntentId(paymentIntent.id);
      if (!donation) {
        console.error(`Donation not found for PaymentIntent: ${paymentIntent.id}`);
        return;
      }

      // Update donation status
      await DonationService.updateStatus(donation.id, 'failed');

      console.log(`Donation ${donation.id} marked as failed (canceled)`);
    } catch (error) {
      console.error('Error handling payment_intent.canceled:', error);
      throw error;
    }
  }

  /**
   * Handle charge disputes
   */
  private static async handleChargeDispute(dispute: Stripe.Dispute) {
    try {
      console.log(`Charge dispute created: ${dispute.id} for charge: ${dispute.charge}`);
      
      // You might want to:
      // 1. Find the related donation
      // 2. Mark it as disputed
      // 3. Send notifications to admins
      // 4. Potentially pause payouts
      
      // For now, just log it
      console.log('Dispute details:', {
        id: dispute.id,
        amount: dispute.amount,
        reason: dispute.reason,
        status: dispute.status,
      });
    } catch (error) {
      console.error('Error handling charge.dispute.created:', error);
      throw error;
    }
  }
}