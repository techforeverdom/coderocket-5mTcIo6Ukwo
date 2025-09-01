import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import { rawBodyMiddleware } from '../middleware/rawBody.middleware';

const router = Router();

// Stripe webhook endpoint (requires raw body)
router.post('/stripe', rawBodyMiddleware, WebhooksController.handleStripeWebhook);

export { router as webhooksRouter };