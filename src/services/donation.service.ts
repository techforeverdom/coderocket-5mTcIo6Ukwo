import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateDonationParams {
  id?: string;
  campaignId: string;
  participantId?: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  message?: string;
  donorEmail?: string;
  donorName?: string;
}

export interface UpdateDonationParams {
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  donorId?: string;
  stripePaymentIntentId?: string;
  feeCents?: number;
  netCents?: number;
}

export class DonationService {
  /**
   * Create a new donation record
   */
  static async create(params: CreateDonationParams) {
    const {
      id = uuidv4(),
      campaignId,
      participantId,
      amountCents,
      feeCents,
      netCents,
      stripePaymentIntentId,
      status,
      message,
      donorEmail,
      donorName,
    } = params;

    // Create temporary donor if email provided
    let donorId: string | null = null;
    if (donorEmail) {
      const donor = await db.query(
        `INSERT INTO donors (email, first_name, last_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET
           first_name = COALESCE(EXCLUDED.first_name, donors.first_name),
           last_name = COALESCE(EXCLUDED.last_name, donors.last_name),
           updated_at = NOW()
         RETURNING id`,
        [
          donorEmail,
          donorName?.split(' ')[0] || 'Anonymous',
          donorName?.split(' ').slice(1).join(' ') || 'Donor',
        ]
      );
      donorId = donor.rows[0].id;
    }

    const result = await db.query(
      `INSERT INTO donations (
         id, campaign_id, participant_id, donor_id, amount_cents, 
         fee_cents, net_cents, stripe_payment_intent_id, status, message
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        campaignId,
        participantId,
        donorId,
        amountCents,
        feeCents,
        netCents,
        stripePaymentIntentId,
        status,
        message,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find donation by ID
   */
  static async findById(id: string) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name,
              c.title as campaign_title,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find donation by Stripe PaymentIntent ID
   */
  static async findByStripePaymentIntentId(paymentIntentId: string) {
    const result = await db.query(
      'SELECT * FROM donations WHERE stripe_payment_intent_id = $1',
      [paymentIntentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update donation
   */
  static async update(id: string, params: UpdateDonationParams) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE donations 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Update donation status
   */
  static async updateStatus(id: string, status: 'pending' | 'succeeded' | 'failed' | 'refunded') {
    const result = await db.query(
      `UPDATE donations 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  /**
   * Get donations for a campaign
   */
  static async findByCampaignId(campaignId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.campaign_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [campaignId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get donations for a participant
   */
  static async findByParticipantId(participantId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       WHERE d.participant_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [participantId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get campaign donation statistics
   */
  static async getCampaignStats(campaignId: string) {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_donations,
         COUNT(DISTINCT donor_id) as unique_donors,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) as total_raised_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN net_cents ELSE 0 END), 0) as total_net_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN fee_cents ELSE 0 END), 0) as total_fee_cents,
         COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount_cents ELSE NULL END), 0) as avg_donation_cents
       FROM donations 
       WHERE campaign_id = $1`,
      [campaignId]
    );

    return result.rows[0];
  }
}