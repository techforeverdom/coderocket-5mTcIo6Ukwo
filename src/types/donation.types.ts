export type DonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Donation {
  id: string;
  campaign_id: string;
  participant_id?: string;
  donor_id?: string;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  stripe_payment_intent_id: string;
  status: DonationStatus;
  message?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface DonationWithDetails extends Donation {
  donor_email?: string;
  donor_first_name?: string;
  donor_last_name?: string;
  campaign_title?: string;
  participant_slug?: string;
}

export interface DonationStats {
  total_donations: number;
  unique_donors: number;
  total_raised_cents: number;
  total_net_cents: number;
  total_fee_cents: number;
  avg_donation_cents: number;
}

export interface CreateDonationRequest {
  amountCents: number;
  campaignId: string;
  participantId?: string;
  donorEmail?: string;
  donorName?: string;
  message?: string;
}

export interface DonationResponse {
  success: boolean;
  data: {
    paymentIntent: {
      id: string;
      clientSecret: string;
      amount: number;
      currency: string;
      status: string;
    };
    donation: {
      id: string;
      amountCents: number;
      feeCents: number;
      netCents: number;
      status: DonationStatus;
    };
    feeBreakdown: {
      amountCents: number;
      platformFeeCents: number;
      stripeFeeCents: number;
      totalFeeCents: number;
      netCents: number;
    };
  };
}