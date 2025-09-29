import { apiClient } from '../lib/api';

export interface CreateBidRequest {
  auctionCarId: string;
  amount: number;
  isProxy?: boolean;
}

export interface CreateBidResponse {
  id: string;
  auctionCarId: string;
  amount: number;
  isProxy: boolean;
  placedAt: string;
  success: boolean;
  message?: string;
}

export interface BidHistory {
  id: string;
  auctionCarId: string;
  userId: string;
  amount: number;
  isProxy: boolean;
  placedAt: string;
  userName?: string;
}

export const bidApi = {
  // Place a bid
  createBid: async (bidData: CreateBidRequest): Promise<CreateBidResponse> => {
    console.log('Creating bid with data:', bidData);
    try {
      let response;
      if (bidData.isProxy) {
        response = await apiClient.placeProxyBid({
          auctionCarId: bidData.auctionCarId,
          maxAmount: bidData.amount,
          incrementAmount: 100 // Default increment
        });
      } else {
        response = await apiClient.placeLiveBid({
          auctionCarId: bidData.auctionCarId,
          amount: bidData.amount
        });
      }
      console.log('Bid created successfully:', response);
      return {
        id: response.id || '',
        auctionCarId: bidData.auctionCarId,
        amount: bidData.amount,
        isProxy: bidData.isProxy || false,
        placedAt: response.timestamp || new Date().toISOString(),
        success: true,
        message: 'Bid placed successfully'
      };
    } catch (error) {
      console.error('Failed to create bid:', error);
      throw error;
    }
  },

  // Get bid history for an auction car
  getBidHistory: async (auctionCarId: string): Promise<BidHistory[]> => {
    console.log('Getting bid history for auction car:', auctionCarId);
    try {
      const response = await apiClient.getBidHistory(auctionCarId, 50);
      console.log('Bid history retrieved:', response);
      return response || [];
    } catch (error) {
      console.error('Failed to get bid history:', error);
      return [];
    }
  },

  // Get user's bids for an auction
  getUserBids: async (auctionId: string): Promise<BidHistory[]> => {
    console.log('Getting user bids for auction:', auctionId);
    try {
      const response = await apiClient.getMyBidSummary(auctionId);
      console.log('User bids retrieved:', response);
      return response || [];
    } catch (error) {
      console.error('Failed to get user bids:', error);
      return [];
    }
  }
};
