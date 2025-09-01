import Stripe from 'stripe'
import { config, calculateStripeFees, calculatePlatformFees, calculateNetAmount } from '../config/config'

// Initialize Stripe only if enabled
let stripe: Stripe | null = null

if (config.stripe.enabled && config.stripe.secretKey !== 'sk_test_development_key') {
  stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2023-10-16',
  })
}

export interface PaymentIntentData {
  amount: number // in cents
  currency: string
  description?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

export class StripeService {
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult> {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured or enabled'
      }
    }

    try {
      const fees = calculateStripeFees(data.amount)
      const platformFees = calculatePlatformFees(data.amount)
      const totalAmount = data.amount + fees + platformFees

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: data.currency,
        description: data.description,
        metadata: {
          ...data.metadata,
          originalAmount: data.amount.toString(),
          stripeFees: fees.toString(),
          platformFees: platformFees.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
      }
    } catch (error: any) {
      console.error('Stripe payment intent creation failed:', error)
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      }
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured or enabled'
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        }
      } else {
        return {
          success: false,
          error: `Payment status: ${paymentIntent.status}`
        }
      }
    } catch (error: any) {
      console.error('Stripe payment confirmation failed:', error)
      return {
        success: false,
        error: error.message || 'Payment confirmation failed'
      }
    }
  }

  static async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured or enabled'
      }
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount, // If not provided, refunds the full amount
      })

      return {
        success: true,
        paymentIntentId: refund.payment_intent as string,
      }
    } catch (error: any) {
      console.error('Stripe refund failed:', error)
      return {
        success: false,
        error: error.message || 'Refund failed'
      }
    }
  }

  static calculateFees(amountCents: number) {
    return {
      stripeFees: calculateStripeFees(amountCents),
      platformFees: calculatePlatformFees(amountCents),
      netAmount: calculateNetAmount(amountCents),
      totalFees: calculateStripeFees(amountCents) + calculatePlatformFees(amountCents)
    }
  }

  static formatAmount(amountCents: number): string {
    return (amountCents / 100).toFixed(2)
  }

  static isEnabled(): boolean {
    return config.stripe.enabled && stripe !== null
  }
}

export default StripeService