import request from 'supertest';
import { app } from '../app';
import { StripeService } from '../services/stripe.service';
import { WebhookService } from '../services/webhook.service';
import { DonationService } from '../services/donation.service';

// Mock services
jest.mock('../services/stripe.service');
jest.mock('../services/webhook.service');
jest.mock('../services/donation.service');

const mockStripeService = StripeService as jest.Mocked<typeof StripeService>;
const mockWebhookService = WebhookService as jest.Mocked<typeof WebhookService>;
const mockDonationService = DonationService as jest.Mocked<typeof DonationService>;

describe('Webhooks Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /webhooks/stripe', () => {
    const validSignature = 'valid_signature';
    const mockEvent = {
      id: 'evt_test123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test123',
          amount: 10000,
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            campaign_id: 'campaign-123',
            participant_id: 'participant-456',
            donor_email: 'donor@example.com',
          },
          receipt_email: 'donor@example.com',
        },
      },
    };

    it('should process valid webhook successfully', async () => {
      mockStripeService.verifyWebhookSignature.mockReturnValue(mockEvent as any);
      mockWebhookService.logEvent.mockResolvedValue({} as any);
      mockWebhookService.markAsProcessed.mockResolvedValue({} as any);
      mockDonationService.findByStripePaymentIntentId.mockResolvedValue({
        id: 'donation-123',
        stripe_payment_intent_id: 'pi_test123',
        status: 'pending',
      } as any);
      mockDonationService.update.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', validSignature)
        .send(JSON.stringify(mockEvent))
        .expect(200);

      expect(response.body).toEqual({ received: true });
      expect(mockStripeService.verifyWebhookSignature).toHaveBeenCalled();
      expect(mockWebhookService.logEvent).toHaveBeenCalledWith({
        source: 'stripe',
        eventType: 'payment_intent.succeeded',
        payload: mockEvent,
        receivedAt: expect.any(Date),
      });
      expect(mockWebhookService.markAsProcessed).toHaveBeenCalledWith('evt_test123');
    });

    it('should reject webhook with invalid signature', async () => {
      mockStripeService.verifyWebhookSignature.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send(JSON.stringify(mockEvent))
        .expect(400);

      expect(response.body.error).toBe('Webhook processing failed');
      expect(mockWebhookService.logEvent).toHaveBeenCalledWith({
        source: 'stripe',
        eventType: 'webhook.error',
        payload: { error: 'Invalid signature' },
        receivedAt: expect.any(Date),
        processed: false,
      });
    });

    it('should reject webhook without signature header', async () => {
      const response = await request(app)
        .post('/webhooks/stripe')
        .send(JSON.stringify(mockEvent))
        .expect(400);

      expect(response.body.error).toBe('Missing stripe-signature header');
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const failedEvent = {
        ...mockEvent,
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            ...mockEvent.data.object,
            status: 'payment_failed',
          },
        },
      };

      mockStripeService.verifyWebhookSignature.mockReturnValue(failedEvent as any);
      mockWebhookService.logEvent.mockResolvedValue({} as any);
      mockWebhookService.markAsProcessed.mockResolvedValue({} as any);
      mockDonationService.findByStripePaymentIntentId.mockResolvedValue({
        id: 'donation-123',
        stripe_payment_intent_id: 'pi_test123',
        status: 'pending',
      } as any);
      mockDonationService.updateStatus.mockResolvedValue({} as any);

      await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', validSignature)
        .send(JSON.stringify(failedEvent))
        .expect(200);

      expect(mockDonationService.updateStatus).toHaveBeenCalledWith('donation-123', 'failed');
    });

    it('should handle unknown event types gracefully', async () => {
      const unknownEvent = {
        ...mockEvent,
        type: 'unknown.event.type',
      };

      mockStripeService.verifyWebhookSignature.mockReturnValue(unknownEvent as any);
      mockWebhookService.logEvent.mockResolvedValue({} as any);
      mockWebhookService.markAsProcessed.mockResolvedValue({} as any);

      await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', validSignature)
        .send(JSON.stringify(unknownEvent))
        .expect(200);

      expect(mockWebhookService.markAsProcessed).toHaveBeenCalledWith('evt_test123');
    });
  });
});