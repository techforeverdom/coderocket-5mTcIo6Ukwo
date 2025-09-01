import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Donor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDonorParams {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export class DonorService {
  /**
   * Find donor by email
   */
  static async findByEmail(email: string): Promise<Donor | null> {
    const result = await db.query(
      'SELECT * FROM donors WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Create or update donor by email
   */
  static async upsertByEmail(params: CreateDonorParams): Promise<Donor> {
    const { email, firstName, lastName, phone } = params;

    const result = await db.query(
      `INSERT INTO donors (id, email, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         first_name = COALESCE(EXCLUDED.first_name, donors.first_name),
         last_name = COALESCE(EXCLUDED.last_name, donors.last_name),
         phone = COALESCE(EXCLUDED.phone, donors.phone),
         updated_at = NOW()
       RETURNING *`,
      [uuidv4(), email, firstName, lastName, phone]
    );

    return result.rows[0];
  }

  /**
   * Find donor by ID
   */
  static async findById(id: string): Promise<Donor | null> {
    const result = await db.query(
      'SELECT * FROM donors WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Get donor donation history
   */
  static async getDonationHistory(donorId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, c.title as campaign_title, c.hero_image_url
       FROM donations d
       JOIN campaigns c ON d.campaign_id = c.id
       WHERE d.donor_id = $1 AND d.status = 'succeeded'
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [donorId, limit, offset]
    );

    return result.rows;
  }
}