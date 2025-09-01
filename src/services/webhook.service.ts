import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import Stripe from 'stripe'
import { config } from '../config/config'

export interface WebhookEvent {
  id: string
  type: string
  data: any
  timestamp: Date
  processed: boolean
}

export class WebhookService {
  private static events: Map<string, WebhookEvent> = new Map()

  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string
    
    if (!sig) {
      res.status(400).send('Missing stripe-signature header')
      return
    }

    try {
      // In development, we'll simulate webhook processing
      if (config.app.environment === 'development') {
        const event = this.simulateWebhookEvent(req.body)
        await this.processWebhookEvent(event)
        res.json({ received: true, eventId: event.id })
        return
      }

      // Production webhook verification would go here
      const event = req.body as Stripe.Event
      const webhookEvent = this.createWebhookEvent(event)
      
      await this.processWebhookEvent(webhookEvent)
      res.json({ received: true, eventId: webhookEvent.id })

    } catch (error: any) {
      console.error('Webhook processing failed:', error)
      res.status(400).send(`Webhook Error: ${error.message}`)
    }
  }

  private static simulateWebhookEvent(body: any): WebhookEvent {
    return {
      id: uuidv4(),
      type: body.type || 'payment_intent.succeeded',
      data: body.data || {},
      timestamp: new Date(),
      processed: false
    }
  }

  private static createWebhookEvent(stripeEvent: Stripe.Event): WebhookEvent {
    return {
      id: stripeEvent.id,
      type: stripeEvent.type,
      data: stripeEvent.data,
      timestamp: new Date(stripeEvent.created * 1000),
      processed: false
    }
  }

  private static async processWebhookEvent(event: WebhookEvent): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`)

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event)
          break
        case 'charge.dispute.created':
          await this.handleChargeDispute(event)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      event.processed = true
      this.events.set(event.id, event)

    } catch (error) {
      console.error(`Failed to process webhook event ${event.id}:`, error)
      throw error
    }
  }

  private static async handlePaymentSucceeded(event: WebhookEvent): Promise<void> {
    const paymentIntent = event.data.object
    console.log(`Payment succeeded: ${paymentIntent.id}`)
    
    // Here you would typically:
    // 1. Update campaign funding amount
    // 2. Send confirmation email
    // 3. Update user's donation history
    // 4. Trigger any post-payment workflows
  }

  private static async handlePaymentFailed(event: WebhookEvent): Promise<void> {
    const paymentIntent = event.data.object
    console.log(`Payment failed: ${paymentIntent.id}`)
    
    // Here you would typically:
    // 1. Log the failure
    // 2. Send failure notification
    // 3. Update payment status
  }

  private static async handleChargeDispute(event: WebhookEvent): Promise<void> {
    const dispute = event.data.object
    console.log(`Charge dispute created: ${dispute.id}`)
    
    // Here you would typically:
    // 1. Alert administrators
    // 2. Gather evidence
    // 3. Update dispute status
  }

  static getEvent(eventId: string): WebhookEvent | undefined {
    return this.events.get(eventId)
  }

  static getAllEvents(): WebhookEvent[] {
    return Array.from(this.events.values())
  }

  static getEventsByType(type: string): WebhookEvent[] {
    return Array.from(this.events.values()).filter(event => event.type === type)
  }
}

export default WebhookService