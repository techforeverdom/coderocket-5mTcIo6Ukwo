import request from 'supertest';
import { app } from '../app';
import { StripeService } from '../services/stripe.service';
import { DonationService } from '../services/donation.service';
import { CampaignService } from '../services/campaign.service';

// Mock services
jest.mock('../services/stripe.service');
jest.mock('../services/donation.service');
jest.mock('../services/campaign.service');

const mockStripeService = StripeService as jest.Mocked<typeof StripeService>;
const mockDonationService = DonationService as jest.Mocked<typeof DonationService>;
const mockCampaignService = CampaignService as jest.Mocked<typeof CampaignService>;

describe('Donations Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /donations/checkout', () => {
    const validCheckoutData = {
      amountCents: 10000,
      campaignId: 'campaign-123',
      participantId: 'participant-456',
      donorEmail: 'donor@example.com',
      donorName: 'John Doe',
      message: 'Good luck with your fundraising!',
    };

    it('should create checkout session successfully', async () => {
      const mockCampaign = {
        id: 'campaign-123',
        status: 'active',
        title: 'Test Campaign',
      };

      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
        amount: 10000,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      const mockDonation = {
        id: 'donation-123',
        amount_cents: 10000,
        fee_cents: 1120,
        net_cents: 8880,
        status: 'pending',
      };

      mockCampaignService.findById.mockResolvedValue(mockCampaign as any);
      mockStripeService.calculateFees.mockReturnValue({
        amountCents: 10000,
        platformFeeCents: 800,
        stripeFeeCents: 320,
        totalFeeCents: 1120,
        netCents: 8880,
      });
      mockStripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent as any);
      mockDonationService.create.mockResolvedValue(mockDonation as any);

      const response = await request(app)
        .post('/donations/checkout')
        .send(validCheckoutData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentIntent.id).toBe('pi_test123');
      expect(response.body.data.donation.id).toBe('donation-123');
      expect(response.body.data.feeBreakdown.totalFeeCents).toBe(1120);

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith({
        amountCents: 10000,
        campaignId: 'campaign-123',
        participantId: 'participant-456',
        donorEmail: 'donor@example.com',
        donorName: 'John Doe',
        message: 'Good luck with your fundraising!',
        idempotencyKey: undefined,
      });
    });

    it('should reject donation below minimum amount', async () => {
      const invalidData = {
        ...validCheckoutData,
        amountCents: 49, // Below $0.50 minimum
      };

      const response = await request(app)
        .post('/donations/checkout')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.details[0].message).toBe('Minimum donation is $0.50');
    });

    it('should reject donation to inactive campaign', async () => {
      const mockCampaign = {
        id: 'campaign-123',
        status: 'ended',
        title: 'Test Campaign',
      };

      mockCampaignService.findById.mockResolvedValue(mockCampaign as any);

      const response = await request(app)
        .post('/donations/checkout')
        .send(validCheckoutData)
        .expect(400);

      expect(response.body.error).toBe('Campaign is not active');
    });

    it('should handle idempotency key', async () => {
      const mockCampaign = {
        id: 'campaign-123',
        status: 'active',
        title: 'Test Campaign',
      };

      mockCampaignService.findById.mockResolvedValue(mockCampaign as any);
      mockStripeService.calculateFees.mockReturnValue({
        amountCents: 10000,
        platformFeeCents: 800,
        stripeFeeCents: 320,
        totalFeeCents: 1120,
        netCents: 8880,
      });
      mockStripeService.createPaymentIntent.mockResolvedValue({} as any);
      mockDonationService.create.mockResolvedValue({} as any);

      const idempotencyKey = 'test-idempotency-key';

      await request(app)
        .post('/donations/checkout')
        .set('idempotency-key', idempotencyKey)
        .send(validCheckoutData)
        .expect(201);

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey,
        })
      );
    });
  });

  describe('POST /donations/confirm', () => {
    it('should confirm payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        status: 'succeeded',
        amount: 10000,
      };

      const mockDonation = {
        id: 'donation-123',
        stripe_payment_intent_id: 'pi_test123',
        status: 'pending',
      };

      const mockUpdatedDonation = {
        ...mockDonation,
        status: 'succeeded',
      };

      mockStripeService.getPaymentIntent.mockResolvedValue(mockPaymentIntent as any);
      mockDonationService.findByStripePaymentIntentId.mockResolvedValue(mockDonation as any);
      mockDonationService.updateStatus.mockResolvedValue(mockUpdatedDonation as any);

      const response = await request(app)
        .post('/donations/confirm')
        .send({ paymentIntentId: 'pi_test123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.donation.status).toBe('succeeded');
      expect(mockDonationService.updateStatus).toHaveBeenCalledWith('donation-123', 'succeeded');
    });

    it('should handle failed payment', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        status: 'payment_failed',
        amount: 10000,
      };

      const mockDonation = {
        id: 'donation-123',
        stripe_payment_intent_id: 'pi_test123',
        status: 'pending',
      };

      mockStripeService.getPaymentIntent.mockResolvedValue(mockPaymentIntent as any);
      mockDonationService.findByStripePaymentIntentId.mockResolvedValue(mockDonation as any);
      mockDonationService.updateStatus.mockResolvedValue({ ...mockDonation, status: 'failed' } as any);

      const response = await request(app)
        .post('/donations/confirm')
        .send({ paymentIntentId: 'pi_test123' })
        .expect(200);

      expect(mockDonationService.updateStatus).toHaveBeenCalledWith('donation-123', 'failed');
    });
  });
});