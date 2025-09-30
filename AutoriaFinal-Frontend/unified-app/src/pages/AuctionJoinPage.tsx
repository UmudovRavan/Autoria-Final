import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  RefreshCw, 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { apiClient as adminApiClient } from '../admin/services/apiClient';
import { 
  AuctionGetDto, 
  AuctionCarDetailDto, 
  AuctionCarGetDto
} from '../types/api';
import { useBidHub } from '../hooks/useBidHub';
import { useToast } from '../components/ToastProvider';
import { AuctionOverview } from '../components/AuctionOverview';
import { VehicleCarousel } from '../components/VehicleCarousel';
import { LiveBiddingPanel } from '../components/LiveBiddingPanel';
import { BidHistory } from '../components/BidHistory';
import { AddVehicleModal } from '../components/AddVehicleModal';

const AuctionJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // State
  const [auction, setAuction] = useState<AuctionGetDto | null>(null);
  const [currentCar, setCurrentCar] = useState<AuctionCarDetailDto | null>(null);
  const [upcomingCars, setUpcomingCars] = useState<AuctionCarGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctionEnded] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isAuctionLive, setIsAuctionLive] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [bidStats, setBidStats] = useState({
    totalBids: 0,
    bidCount: 0,
    averageBid: 0,
    soldCount: 0,
    totalSalesAmount: 0
  });
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [currentUserId] = useState<string>('');

  // BidHub integration
  const { 
    connectionState, 
    connect, 
    disconnect, 
    joinAuctionCar, 
    leaveAuctionCar,
    placeLiveBid,
    placePreBid,
    placeProxyBid,
    cancelProxyBid,
    getMyBids
  } = useBidHub(
    {
      baseUrl: 'https://localhost:7249',
      token: localStorage.getItem('authToken') || localStorage.getItem('auth_token') || ''
    },
    {
      onJoinedAuctionCar: (data) => {
        console.log('Joined auction car:', data);
        setBidStats(data.stats);
        setCurrentCar(prev => prev ? {
          ...prev,
          currentPrice: data.highestBid,
          bidCount: data.stats.bidCount,
          lastBidTime: data.lastBidTime
        } : null);
      },
      onNewLiveBid: (data) => {
        console.log('New live bid:', data);
        setBidHistory(prev => [data, ...prev]);
        if (currentCar?.id === data.auctionCarId) {
          setCurrentCar(prev => prev ? {
            ...prev,
            currentPrice: data.amount,
            bidCount: (prev.bidCount || 0) + 1,
            lastBidTime: data.placedAtUtc
          } : null);
        }
        addToast({
          type: 'success',
          title: 'New Live Bid',
          message: `${data.userName} bid $${data.amount.toLocaleString()}`
        });
      },
      onPreBidPlaced: (data) => {
        console.log('Pre-bid placed:', data);
        setBidHistory(prev => [data, ...prev]);
        addToast({
          type: 'info',
          title: 'Pre-Bid Placed',
          message: `${data.userName} placed a pre-bid of $${data.amount.toLocaleString()}`
        });
      },
      onHighestBidUpdated: (data) => {
        console.log('Highest bid updated:', data);
        if (currentCar?.id === data.auctionCarId) {
          setCurrentCar(prev => prev ? {
            ...prev,
            currentPrice: data.amount
          } : null);
        }
      },
      onAuctionTimerReset: (data) => {
        console.log('Auction timer reset:', data);
        if (currentCar?.id === data.auctionCarId) {
          setTimerSeconds(data.secondsRemaining);
        }
      },
      onBidStatsUpdated: (data) => {
        console.log('Bid stats updated:', data);
        setBidStats(data.stats);
      },
      onBidValidationError: (data) => {
        console.log('Bid validation error:', data);
        addToast({
          type: 'error',
          title: 'Bid Validation Error',
          message: data.errors.join(', ')
        });
      },
      onBidError: (error) => {
        console.log('Bid error:', error);
        addToast({
          type: 'error',
          title: 'Bid Error',
          message: error
        });
      },
      onConnectionStateChanged: (isConnected, error) => {
        console.log('BidHub connection state changed:', isConnected, error);
        if (!isConnected && error) {
          addToast({
            type: 'warning',
            title: 'Connection Lost',
            message: 'Lost connection to auction. Attempting to reconnect...'
          });
        }
      }
    }
  );

  // Load auction data
  const loadAuction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Checking for active auctions...');

      // Step 1: Check for ready-to-start auctions first
      let activeAuctions: AuctionGetDto[] = [];
      
      try {
        const readyToStartAuctions = await apiClient.getReadyToStartAuctions();
        console.log('API Response - Ready to start auctions:', readyToStartAuctions);
        activeAuctions = readyToStartAuctions || [];
      } catch (error) {
        console.log('Ready-to-start endpoint failed, trying active auctions:', error);
      }

      // Step 2: If no ready-to-start auctions, check for active/live auctions
      if (activeAuctions.length === 0) {
        try {
          const activeAuctionsResponse = await apiClient.getActiveAuctions();
          console.log('API Response - Active auctions:', activeAuctionsResponse);
          activeAuctions = activeAuctionsResponse || [];
        } catch (error) {
          console.log('Active auctions endpoint failed:', error);
        }
      }

      // Step 3: If still no auctions, try getting all auctions and filter for live ones
      if (activeAuctions.length === 0) {
        try {
          console.log('Trying to get all auctions and filter for live ones...');
          const allAuctions = await adminApiClient.getAuctions({ limit: 100 });
          console.log('All auctions from admin API:', allAuctions);
          
          // Filter for live/active auctions
          const liveAuctions = allAuctions.filter(auction => 
            auction.status === 'Live' || 
            auction.status === 'Active' || 
            auction.isLive === true ||
            auction.status === 'Started'
          );
          
          console.log('Filtered live auctions:', liveAuctions);
          activeAuctions = liveAuctions;
        } catch (error) {
          console.log('All auctions endpoint failed:', error);
        }
      }
      
      if (activeAuctions.length === 0) {
        console.log('No active auction available');
        setAuction(null);
        setCurrentCar(null);
        setUpcomingCars([]);
        setLoading(false);
        return;
      }

      // Get the first active auction
      const activeAuction = activeAuctions[0];
      setAuction(activeAuction);
      setIsAuctionLive(activeAuction.isLive);

      console.log('Active auction found:', activeAuction);

      // Step 2: Get current active auction car
      try {
        const activeCar = await apiClient.getActiveAuctionCar(activeAuction.id);
        console.log('Active car API response:', activeCar);
        
        if (activeCar && activeCar.id) {
          setCurrentCar(activeCar);
          console.log('Active car set:', activeCar);
        } else {
          console.log('No active car returned from API');
          setCurrentCar(null);
        }
      } catch (error) {
        console.log('No active car found, getting auction cars list:', error);
        // If no active car, get all cars for the auction
        try {
          const auctionCars = await apiClient.getAuctionCars(activeAuction.id);
          console.log('Auction cars API response:', auctionCars);
          setUpcomingCars(auctionCars);
          
          if (auctionCars && auctionCars.length > 0) {
            // Load first car details
            await loadAuctionCar(auctionCars[0].id);
          } else {
            setCurrentCar(null);
          }
        } catch (carError) {
          console.error('Failed to get auction cars:', carError);
          setCurrentCar(null);
          setUpcomingCars([]);
        }
      }

      // Step 3: Get auction timer info
      try {
        const timerInfo = await apiClient.getAuctionTimer(activeAuction.id);
        setTimerSeconds(timerInfo.timerSeconds);
        console.log('Timer info:', timerInfo);
      } catch (error) {
        console.error('Failed to get timer info:', error);
        setTimerSeconds(0);
      }

    } catch (error) {
      console.error('Failed to load auction:', error);
      setError(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check if the backend server is running on https://localhost:7249`);
      setAuction(null);
      setCurrentCar(null);
      setUpcomingCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuctionCar = useCallback(async (auctionCarId: string) => {
    if (!auctionCarId) return;
    
    try {
      console.log('Loading auction car details for ID:', auctionCarId);
      const carData = await apiClient.getAuctionCarFullDetails(auctionCarId);
      console.log('Loaded auction car details:', carData);
      
      if (carData && carData.id) {
        setCurrentCar(carData);
      } else {
        console.log('Invalid car data received');
        setCurrentCar(null);
      }
    } catch (error) {
      console.error('Failed to load auction car:', error);
      setCurrentCar(null);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load vehicle details'
      });
    }
  }, [addToast]);

  // const handleCarClick = useCallback((car: AuctionCarGetDto) => {
  //   loadAuctionCar(car.id);
  // }, [loadAuctionCar]);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    loadAuction();
  }, [loadAuction]);

  const handleVehicleAdded = useCallback(() => {
    console.log('Vehicle added successfully');
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Vehicle added to auction successfully'
    });
    // Refresh auction data
    loadAuction();
  }, [addToast, loadAuction]);

  // Bid placement handlers
  const handlePlaceLiveBid = useCallback(async (amount: number): Promise<boolean> => {
    if (!currentCar?.id) return false;
    return await placeLiveBid(currentCar.id, amount);
  }, [currentCar?.id, placeLiveBid]);

  const handlePlacePreBid = useCallback(async (amount: number): Promise<boolean> => {
    if (!currentCar?.id) return false;
    return await placePreBid(currentCar.id, amount);
  }, [currentCar?.id, placePreBid]);

  const handlePlaceProxyBid = useCallback(async (startAmount: number, maxAmount: number): Promise<boolean> => {
    if (!currentCar?.id) return false;
    return await placeProxyBid(currentCar.id, startAmount, maxAmount);
  }, [currentCar?.id, placeProxyBid]);

  const handleCancelProxyBid = useCallback(async (): Promise<boolean> => {
    if (!currentCar?.id) return false;
    return await cancelProxyBid(currentCar.id);
  }, [currentCar?.id, cancelProxyBid]);

  const handleRefreshBidHistory = useCallback(async () => {
    if (!currentCar?.id) return;
    
    try {
      const bids = await getMyBids(currentCar.id);
      setBidHistory(bids);
    } catch (error) {
      console.error('Failed to refresh bid history:', error);
    }
  }, [currentCar?.id, getMyBids]);

  // Load data on mount
  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  // Connect to BidHub when auction and car are loaded
  useEffect(() => {
    if (auction?.id && currentCar?.id) {
      console.log('Connecting to BidHub for auction:', auction.id, 'car:', currentCar.id);
      connect();
      
      // Join the specific auction car
      joinAuctionCar(currentCar.id);
    }

    return () => {
      if (currentCar?.id) {
        leaveAuctionCar(currentCar.id);
      }
      disconnect();
    };
  }, [auction?.id, currentCar?.id, connect, disconnect, joinAuctionCar, leaveAuctionCar]);

  // Show empty state if no active auctions
  if (!loading && !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
            <Clock className="h-16 w-16 text-white/60 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Hazırda aktiv hərrac yoxdur</h2>
            <p className="text-white/80 mb-6">
              Hal-hazırda başlamağa hazır olan hərrac tapılmadı. Tezliklə yeni hərraclar başlayacaq.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <h3 className="text-yellow-400 font-semibold mb-2">Debug Information:</h3>
                <p className="text-yellow-200 text-sm mb-2">
                  Check browser console for detailed API responses and auction status information.
                </p>
                <p className="text-yellow-200 text-sm">
                  Make sure your auction status is set to "Live", "Active", or "Started" in the admin panel.
                </p>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yenidən yoxla
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading auction...</p>
        </div>
      </div>
    );
  }

  // Show auction ended state
  if (auctionEnded && auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Hərrac Bitdi</h2>
            <p className="text-white/80 mb-6">
              {auction.name} hərracı başa çatdı.
            </p>
            <button
              onClick={() => navigate('/todays-auctions')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Digər Hərraclar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">API Connection Error</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <div className="text-sm text-red-300 space-y-2">
              <p>• Make sure your backend server is running on https://localhost:7249</p>
              <p>• Check if the API endpoints are accessible</p>
              <p>• Verify CORS settings if needed</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{auction?.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isAuctionLive ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isAuctionLive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></div>
                    {isAuctionLive ? 'Live' : 'Scheduled'}
                  </div>
                  {auction?.locationName && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="h-4 w-4" />
                      {auction.locationName}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/80">
                    {connectionState.isConnected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm">
                      {connectionState.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                {timerSeconds > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-mono">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                {error && (
                  <div className="mt-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Overview */}
          <div className="lg:col-span-1 space-y-6">
            {auction && (
              <AuctionOverview
                auctionId={auction.id || ''}
                auctionName={auction.name || ''}
                startTimeUtc={auction.startTimeUtc}
                endTimeUtc={auction.endTimeUtc}
                locationId={auction.locationId}
                currency="USD"
                isLive={isAuctionLive}
                stats={{
                  totalVehicles: upcomingCars.length,
                  totalRevenue: bidStats.totalSalesAmount,
                  vehiclesSold: bidStats.soldCount,
                  successRate: upcomingCars.length > 0 ? (bidStats.soldCount / upcomingCars.length) * 100 : 0,
                  averagePrice: bidStats.averageBid,
                  totalBids: bidStats.totalBids
                }}
                onRefresh={handleRefresh}
                isRefreshing={loading}
              />
            )}
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Carousel */}
            {currentCar && (
              <VehicleCarousel
                carId={currentCar.carId || currentCar.id}
                photos={[]}
                className="w-full"
                autoPlay={false}
                showThumbnails={true}
                showControls={true}
              />
            )}

            {/* Vehicle Info */}
            {currentCar && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {currentCar.car?.year} {currentCar.car?.make} {currentCar.car?.model}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Lot Number</div>
                    <div className="font-semibold">{currentCar.lotNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">VIN</div>
                    <div className="font-semibold font-mono text-sm">{currentCar.car?.vin || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Mileage</div>
                    <div className="font-semibold">{currentCar.car?.odometer?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Condition</div>
                    <div className="font-semibold">{currentCar.car?.condition || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Bidding & History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Bidding Panel */}
            {currentCar && (
              <LiveBiddingPanel
                auctionCarId={currentCar.id}
                currentPrice={currentCar.currentPrice || 0}
                reservePrice={currentCar.reservePrice}
                minimumBid={(currentCar.currentPrice || 0) + 25}
                suggestedAmount={(currentCar.currentPrice || 0) + 100}
                bidCount={currentCar.bidCount || 0}
                isActive={isAuctionLive}
                isReserveMet={currentCar.isReserveMet || false}
                lastBidTime={currentCar.lastBidTime}
                stats={bidStats}
                onPlaceLiveBid={handlePlaceLiveBid}
                onPlacePreBid={handlePlacePreBid}
                onPlaceProxyBid={handlePlaceProxyBid}
                onCancelProxyBid={handleCancelProxyBid}
                isConnected={connectionState.isConnected}
              />
            )}

            {/* Bid History */}
            {currentCar && (
              <BidHistory
                auctionCarId={currentCar.id}
                bids={bidHistory}
                onRefresh={handleRefreshBidHistory}
                isRefreshing={false}
                isConnected={connectionState.isConnected}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        auctionId={auction?.id || ''}
        onSuccess={handleVehicleAdded}
      />
    </div>
  );
};

export default AuctionJoinPage;