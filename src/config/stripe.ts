import Stripe from 'stripe';
import { config } from './config';

if (!config.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'] as Stripe.PaymentIntentCreateParams.PaymentMethodType[],
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
} as const;