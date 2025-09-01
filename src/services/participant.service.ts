import { db } from '../config/database';

export interface Participant {
  id: string;
  campaign_id: string;
  user_id: string;
  personal_goal_cents?: number;
  share_link_slug: string;
  created_at: Date;
  updated_at: Date;
}

export class ParticipantService {
  /**
   * Find participant by ID
   */
  static async findById(id: string): Promise<Participant | null> {
    const result = await db.query(
      'SELECT * FROM participants WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find participants by campaign ID
   */
  static async findByCampaignId(campaignId: string): Promise<Participant[]> {
    const result = await db.query(
      'SELECT * FROM participants WHERE campaign_id = $1',
      [campaignId]
    );

    return result.rows;
  }

  /**
   * Find participant by share link slug
   */
  static async findByShareLinkSlug(slug: string): Promise<Participant | null> {
    const result = await db.query(
      'SELECT * FROM participants WHERE share_link_slug = $1',
      [slug]
    );

    return result.rows[0] || null;
  }
}