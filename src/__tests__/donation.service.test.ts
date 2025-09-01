import { DonationService } from '../services/donation.service';

// Mock database
const mockDb = {
  query: jest.fn(),
};

jest.mock('../config/database', () => ({
  db: mockDb,
}));

describe('DonationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a donation successfully', async () => {
      const mockDonation = {
        id: 'donation-123',
        campaign_id: 'campaign-123',
        amount_cents: 10000,
        status: 'pending',
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'donor-123' }] }) // Donor upsert
        .mockResolvedValueOnce({ rows: [mockDonation] }); // Donation insert

      const params = {
        campaignId: 'campaign-123',
        amountCents: 10000,
        feeCents: 1120,
        netCents: 8880,
        stripePaymentIntentId: 'pi_test123',
        status: 'pending' as const,
        donorEmail: 'donor@example.com',
        donorName: 'John Doe',
      };

      const result = await DonationService.create(params);

      expect(result).toEqual(mockDonation);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should create donation without donor email', async () => {
      const mockDonation = {
        id: 'donation-123',
        campaign_id: 'campaign-123',
        amount_cents: 10000,
        status: 'pending',
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockDonation] });

      const params = {
        campaignId: 'campaign-123',
        amountCents: 10000,
        feeCents: 1120,
        netCents: 8880,
        stripePaymentIntentId: 'pi_test123',
        status: 'pending' as const,
      };

      const result = await DonationService.create(params);

      expect(result).toEqual(mockDonation);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update donation successfully', async () => {
      const mockUpdatedDonation = {
        id: 'donation-123',
        status: 'succeeded',
        donor_id: 'donor-123',
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUpdatedDonation] });

      const result = await DonationService.update('donation-123', {
        status: 'succeeded',
        donorId: 'donor-123',
      });

      expect(result).toEqual(mockUpdatedDonation);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE donations'),
        expect.arrayContaining(['succeeded', 'donor-123', 'donation-123'])
      );
    });

    it('should throw error when no fields to update', async () => {
      await expect(
        DonationService.update('donation-123', {})
      ).rejects.toThrow('No fields to update');
    });
  });

  describe('findById', () => {
    it('should find donation by id', async () => {
      const mockDonation = {
        id: 'donation-123',
        campaign_id: 'campaign-123',
        donor_email: 'donor@example.com',
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockDonation] });

      const result = await DonationService.findById('donation-123');

      expect(result).toEqual(mockDonation);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT d.*'),
        ['donation-123']
      );
    });

    it('should return null when donation not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await DonationService.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCampaignStats', () => {
    it('should return campaign statistics', async () => {
      const mockStats = {
        total_donations: 25,
        unique_donors: 20,
        total_raised_cents: 50000,
        total_net_cents: 45000,
        total_fee_cents: 5000,
        avg_donation_cents: 2000,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await DonationService.getCampaignStats('campaign-123');

      expect(result).toEqual(mockStats);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_donations'),
        ['campaign-123']
      );
    });
  });

  describe('searchDonations', () => {
    it('should search donations by donor name', async () => {
      const mockDonations = [
        { id: 'donation-1', donor_first_name: 'John', donor_last_name: 'Doe' },
        { id: 'donation-2', donor_first_name: 'Jane', donor_last_name: 'Doe' },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockDonations });

      const result = await DonationService.searchDonations('Doe', 50, 0);

      expect(result).toEqual(mockDonations);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE $1'),
        expect.arrayContaining(['%Doe%', 50, 0])
      );
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update donation statuses', async () => {
      const mockUpdatedDonations = [
        { id: 'donation-1', status: 'succeeded' },
        { id: 'donation-2', status: 'succeeded' },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockUpdatedDonations });

      const result = await DonationService.bulkUpdateStatus(
        ['donation-1', 'donation-2'],
        'succeeded'
      );

      expect(result).toEqual(mockUpdatedDonations);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id IN ($2,$3)'),
        ['succeeded', 'donation-1', 'donation-2']
      );
    });

    it('should return empty array for empty donation ids', async () => {
      const result = await DonationService.bulkUpdateStatus([], 'succeeded');

      expect(result).toEqual([]);
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });
});