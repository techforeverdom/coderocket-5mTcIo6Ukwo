import { db } from '../config/database';

export interface Campaign {
  id: string;
  team_id: string;
  title: string;
  description: string;
  goal_cents: number;
  starts_at: Date;
  ends_at: Date;
  status: 'draft' | 'active' | 'paused' | 'ended';
  hero_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class CampaignService {
  /**
   * Find campaign by ID
   */
  static async findById(id: string): Promise<Campaign | null> {
    const result = await db.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find active campaigns
   */
  static async findActive(limit = 50, offset = 0): Promise<Campaign[]> {
    const result = await db.query(
      `SELECT * FROM campaigns 
       WHERE status = 'active' 
       AND starts_at <= NOW() 
       AND ends_at > NOW()
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Update campaign status
   */
  static async updateStatus(id: string, status: Campaign['status']): Promise<Campaign | null> {
    const result = await db.query(
      `UPDATE campaigns 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0] || null;
  }
}