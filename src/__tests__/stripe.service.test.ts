import { StripeService } from '../services/stripe.service';
import { config } from '../config/config';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe');
const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('../config/stripe', () => ({
  stripe: mockStripe,
  STRIPE_CONFIG: {
    currency: 'usd',
    paymentMethodTypes: ['card'],
    captureMethod: 'automatic',
    confirmationMethod: 'automatic',
  },
}));

describe('StripeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly', () => {
      const amountCents = 10000; // $100
      const result = StripeService.calculateFees(amountCents);

      expect(result.amountCents).toBe(10000);
      expect(result.platformFeeCents).toBe(800); // 8% of $100
      expect(result.stripeFeeCents).toBe(320); // 2.9% + $0.30
      expect(result.totalFeeCents).toBe(1120);
      expect(result.netCents).toBe(8880);
    });

    it('should handle small amounts correctly', () => {
      const amountCents = 100; // $1
      const result = StripeService.calculateFees(amountCents);

      expect(result.amountCents).toBe(100);
      expect(result.platformFeeCents).toBe(8); // 8% of $1
      expect(result.stripeFeeCents).toBe(33); // 2.9% + $0.30
      expect(result.totalFeeCents).toBe(41);
      expect(result.netCents).toBe(59);
    });

    it('should ensure non-negative net amount', () => {
      const amountCents = 30; // $0.30 (less than Stripe fee)
      const result = StripeService.calculateFees(amountCents);

      expect(result.netCents).toBe(0); // Should not be negative
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent with correct parameters', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
        amount: 10000,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const params = {
        amountCents: 10000,
        campaignId: 'campaign-123',
        participantId: 'participant-456',
        donorEmail: 'donor@example.com',
        donorName: 'John Doe',
        message: 'Good luck!',
      };

      const result = await StripeService.createPaymentIntent(params);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: 'usd',
          metadata: expect.objectContaining({
            campaign_id: 'campaign-123',
            participant_id: 'participant-456',
            donor_email: 'donor@example.com',
            donor_name: 'John Doe',
            message: 'Good luck!',
          }),
          receipt_email: 'donor@example.com',
        }),
        expect.objectContaining({
          idempotencyKey: expect.any(String),
        })
      );

      expect(result).toEqual(mockPaymentIntent);
    });

    it('should reject amounts below minimum', async () => {
      const params = {
        amountCents: 49, // Below $0.50 minimum
        campaignId: 'campaign-123',
      };

      await expect(StripeService.createPaymentIntent(params)).rejects.toThrow(
        'Donation amount must be at least $0.50'
      );
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const payload = JSON.stringify({ test: 'data' });
      const signature = 'test_signature';
      const secret = 'test_secret';

      const result = StripeService.verifyWebhookSignature(payload, signature, secret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        secret
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw error for invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const payload = JSON.stringify({ test: 'data' });
      const signature = 'invalid_signature';

      expect(() => {
        StripeService.verifyWebhookSignature(payload, signature);
      }).toThrow('Invalid webhook signature');
    });
  });

  describe('createRefund', () => {
    it('should create refund successfully', async () => {
      const mockRefund = {
        id: 're_test123',
        amount: 5000,
        status: 'succeeded',
        payment_intent: 'pi_test123',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund);

      const result = await StripeService.createRefund('pi_test123', 5000, 'requested_by_customer');

      expect(mockStripe.refunds.create).toHaveBeenCalledWith(
        {
          payment_intent: 'pi_test123',
          amount: 5000,
          reason: 'requested_by_customer',
        },
        expect.objectContaining({
          idempotencyKey: expect.any(String),
        })
      );

      expect(result).toEqual(mockRefund);
    });
  });
});