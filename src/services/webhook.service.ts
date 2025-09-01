import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface LogWebhookEventParams {
  source: 'stripe' | 'twilio' | 'mailchimp';
  eventType: string;
  payload: any;
  receivedAt: Date;
  processed?: boolean;
}

export class WebhookService {
  /**
   * Log a webhook event
   */
  static async logEvent(params: LogWebhookEventParams) {
    const { source, eventType, payload, receivedAt, processed = false } = params;

    const result = await db.query(
      `INSERT INTO webhook_events (
         id, source, event_type, payload, received_at, processed
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), source, eventType, JSON.stringify(payload), receivedAt, processed]
    );

    return result.rows[0];
  }

  /**
   * Mark webhook event as processed
   */
  static async markAsProcessed(eventId: string) {
    const result = await db.query(
      `UPDATE webhook_events 
       SET processed = true, updated_at = NOW()
       WHERE payload->>'id' = $1 OR id = $1
       RETURNING *`,
      [eventId]
    );

    return result.rows[0];
  }

  /**
   * Get unprocessed webhook events
   */
  static async getUnprocessedEvents(source?: 'stripe' | 'twilio' | 'mailchimp', limit = 100) {
    let query = `
      SELECT * FROM webhook_events 
      WHERE processed = false
    `;
    const params = [];

    if (source) {
      query += ` AND source = $1`;
      params.push(source);
    }

    query += ` ORDER BY received_at ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Retry failed webhook processing
   */
  static async retryFailedEvents(source?: 'stripe' | 'twilio' | 'mailchimp') {
    // This would implement retry logic for failed webhook events
    // For now, just return unprocessed events
    return this.getUnprocessedEvents(source);
  }

  /**
   * Clean up old webhook events
   */
  static async cleanupOldEvents(daysOld = 30) {
    const result = await db.query(
      `DELETE FROM webhook_events 
       WHERE created_at < NOW() - INTERVAL '${daysOld} days'
       AND processed = true
       RETURNING COUNT(*)`,
      []
    );

    return result.rows[0];
  }
}