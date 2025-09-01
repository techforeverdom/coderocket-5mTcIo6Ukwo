import { Router } from 'express';
import { DonationsController } from '../controllers/donations.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.post('/checkout', DonationsController.createCheckout);
router.post('/confirm', DonationsController.confirmPayment);

// Protected routes
router.get('/:id', authenticateToken, DonationsController.getDonation);
router.post('/:id/refund', authenticateToken, DonationsController.createRefund);

export { router as donationsRouter };