import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amountCents: number;
  campaignId: string;
  participantId?: string;
  donorEmail?: string;
  donorName?: string;
  message?: string;
  idempotencyKey?: string;
}

export interface FeeCalculation {
  amountCents: number;
  platformFeeCents: number;
  stripeFeeCents: number;
  totalFeeCents: number;
  netCents: number;
}

export class StripeService {
  /**
   * Calculate fees for a donation amount
   */
  static calculateFees(amountCents: number): FeeCalculation {
    // Platform fee (configurable 6-10%)
    const platformFeeCents = Math.round(
      (amountCents * config.fees.platformFeePercentage) / 100
    );
    
    // Stripe fee (2.9% + $0.30)
    const stripeFeeCents = Math.round(
      (amountCents * config.fees.stripeFeePercentage) / 100 + config.fees.stripeFeeFixed
    );
    
    const totalFeeCents = platformFeeCents + stripeFeeCents;
    const netCents = amountCents - totalFeeCents;
    
    return {
      amountCents,
      platformFeeCents,
      stripeFeeCents,
      totalFeeCents,
      netCents: Math.max(0, netCents), // Ensure non-negative
    };
  }

  /**
   * Create a PaymentIntent for donation checkout
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const {
      amountCents,
      campaignId,
      participantId,
      donorEmail,
      donorName,
      message,
      idempotencyKey = uuidv4(),
    } = params;

    // Validate minimum amount (Stripe requires at least $0.50)
    if (amountCents < 50) {
      throw new Error('Donation amount must be at least $0.50');
    }

    const feeCalculation = this.calculateFees(amountCents);

    const metadata: Record<string, string> = {
      campaign_id: campaignId,
      amount_cents: amountCents.toString(),
      platform_fee_cents: feeCalculation.platformFeeCents.toString(),
      stripe_fee_cents: feeCalculation.stripeFeeCents.toString(),
      total_fee_cents: feeCalculation.totalFeeCents.toString(),
      net_cents: feeCalculation.netCents.toString(),
    };

    if (participantId) {
      metadata.participant_id = participantId;
    }

    if (donorEmail) {
      metadata.donor_email = donorEmail;
    }

    if (donorName) {
      metadata.donor_name = donorName;
    }

    if (message) {
      metadata.message = message.substring(0, 500); // Stripe metadata limit
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountCents,
          currency: STRIPE_CONFIG.currency,
          payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
          capture_method: STRIPE_CONFIG.captureMethod,
          confirmation_method: STRIPE_CONFIG.confirmationMethod,
          metadata,
          description: `Donation to campaign ${campaignId}`,
          receipt_email: donorEmail,
        },
        {
          idempotencyKey,
        }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Retrieve a PaymentIntent by ID
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving PaymentIntent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Create a refund for a PaymentIntent
   */
  static async createRefund(
    paymentIntentId: string,
    amountCents?: number,
    reason?: Stripe.RefundCreateParams.Reason,
    idempotencyKey?: string
  ): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer',
      };

      if (amountCents) {
        refundParams.amount = amountCents;
      }

      return await stripe.refunds.create(refundParams, {
        idempotencyKey: idempotencyKey || uuidv4(),
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string = config.stripe.webhookSecret
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Create a customer (optional, for recurring donors)
   */
  static async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      return await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * List payment methods for a customer
   */
  static async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw new Error('Failed to list payment methods');
    }
  }
}