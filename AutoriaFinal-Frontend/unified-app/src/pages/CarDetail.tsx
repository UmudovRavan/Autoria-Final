import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { AuctionCarDetailDto, BidGetDto, PlaceLiveBidRequest, PlacePreBidRequest } from '../types/api';
import BidCard from '../components/BidCard';
import CountdownTimer from '../components/CountdownTimer';
import { 
  ArrowLeft, 
  Car, 
  DollarSign, 
  Clock, 
  Award,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Hammer
} from 'lucide-react';

export default function CarDetail() {
  const { auctionId, carId } = useParams<{ auctionId: string; carId: string }>();
  const [car, setCar] = useState<AuctionCarDetailDto | null>(null);
  const [recentBids, setRecentBids] = useState<BidGetDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidType, setBidType] = useState<'live' | 'pre'>('live');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  useEffect(() => {
    if (carId) {
      loadCarData();
    }
  }, [carId]);

  useEffect(() => {
    if (car) {
      const interval = setInterval(loadRecentBids, 5000);
      return () => clearInterval(interval);
    }
  }, [car]);

  const loadCarData = async () => {
    if (!carId) return;
    
    try {
      const carData = await apiClient.getAuctionCar(carId);
      setCar(carData);
      await loadRecentBids();
    } catch (error) {
      console.error('Error loading car data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentBids = async () => {
    if (!carId) return;
    
    try {
      const bids = await apiClient.getRecentBids(carId, 10);
      setRecentBids(bids);
    } catch (error) {
      console.error('Error loading recent bids:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !bidAmount) return;

    setBidError('');
    setBidSuccess('');
    setIsSubmitting(true);

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      if (bidType === 'live') {
        const request: PlaceLiveBidRequest = {
          auctionCarId: car.id,
          amount: amount
        };
        await apiClient.placeLiveBid(request);
      } else {
        const request: PlacePreBidRequest = {
          auctionCarId: car.id,
          amount: amount
        };
        await apiClient.placePreBid(request);
      }

      setBidSuccess('Bid placed successfully!');
      setBidAmount('');
      setShowBidModal(false);
      await loadCarData();
    } catch (error: any) {
      setBidError(error.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextMinimumBid = () => {
    if (!car) return 0;
    return car.currentPrice + 100; // Simple increment logic
  };

  if (isLoading || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-lg mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const carInfo = `${car.carYear || ''} ${car.carMake || ''} ${car.carModel || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/auctions" className="hover:text-blue-600 transition-colors">
            Auctions
          </Link>
          <span>•</span>
          <Link 
            to={`/auctions/${auctionId}`} 
            className="hover:text-blue-600 transition-colors"
          >
            Auction Details
          </Link>
          <span>•</span>
          <span className="text-gray-900 font-medium">Lot #{car.lotNumber}</span>
        </div>

        {/* Back Button */}
        <Link
          to={`/auctions/${auctionId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auction
        </Link>

        {/* Success/Error Messages */}
        {bidSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm text-green-800">{bidSuccess}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Car Image Placeholder */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {carInfo || 'Vehicle Details'}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Lot #{car.lotNumber}
                    </span>
                    {car.carVin && (
                      <span className="text-sm text-gray-600">
                        VIN: {car.carVin}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {car.isActive && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      LIVE
                    </span>
                  )}
                  {car.isReserveMet && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      RESERVE MET
                    </span>
                  )}
                </div>
              </div>

              {/* Car Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {car.totalBidsCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Bids</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {car.preBidsCount}
                  </div>
                  <div className="text-sm text-gray-600">Pre-Bids</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(car.highestBidAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Highest Bid</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatCurrency(car.highestPreBidAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Highest Pre-Bid</div>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Recent Bids
                </h2>
                <span className="text-sm text-gray-500">
                  Last {recentBids.length} bids
                </span>
              </div>

              {recentBids.length > 0 ? (
                <div className="space-y-4">
                  {recentBids.map(bid => (
                    <BidCard key={bid.id} bid={bid} showCarInfo={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
                  <p className="text-gray-600">Be the first to place a bid on this item</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Bidding
              </h2>

              {/* Current Price */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Current Price</div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(car.currentPrice)}
                </div>
                {car.reservePrice && (
                  <div className="text-sm text-gray-600">
                    Reserve: {formatCurrency(car.reservePrice)}
                  </div>
                )}
              </div>

              {/* Timer */}
              {car.isActive && car.remainingTimeSeconds > 0 && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-800 mb-2">Time Remaining</div>
                  <CountdownTimer
                    targetDate={new Date(Date.now() + car.remainingTimeSeconds * 1000).toISOString()}
                    size="medium"
                  />
                </div>
              )}

              {/* Bid Button */}
              <button
                onClick={() => setShowBidModal(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={car.isTimeExpired}
              >
                <Hammer className="h-5 w-5 mr-2" />
                Place Bid
              </button>

              {/* Next Minimum Bid */}
              <div className="mt-4 text-sm text-gray-600 text-center">
                Next minimum bid: {formatCurrency(getNextMinimumBid())}
              </div>
            </div>

            {/* Car Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
              
              <dl className="space-y-3">
                {car.carYear && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Year</dt>
                    <dd className="text-sm font-medium text-gray-900">{car.carYear}</dd>
                  </div>
                )}
                {car.carMake && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Make</dt>
                    <dd className="text-sm font-medium text-gray-900">{car.carMake}</dd>
                  </div>
                )}
                {car.carModel && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Model</dt>
                    <dd className="text-sm font-medium text-gray-900">{car.carModel}</dd>
                  </div>
                )}
                {car.carVin && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">VIN</dt>
                    <dd className="text-xs font-mono text-gray-900">{car.carVin}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Minimum Pre-Bid</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(car.minPreBid)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Bid Modal */}
        {showBidModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Place Your Bid</h3>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleBidSubmit}>
                {bidError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                      <span className="text-sm text-red-800">{bidError}</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBidType('live')}
                      className={`p-3 rounded-lg border text-sm font-medium ${
                        bidType === 'live'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Live Bid
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidType('pre')}
                      className={`p-3 rounded-lg border text-sm font-medium ${
                        bidType === 'pre'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Pre-Bid
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min={getNextMinimumBid()}
                      step="1"
                      required
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Minimum: {formatCurrency(getNextMinimumBid())}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBidModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isSubmitting ? 'Placing...' : 'Place Bid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}