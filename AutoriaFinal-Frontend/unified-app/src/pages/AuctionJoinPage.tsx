import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, ArrowLeft, Clock, Trophy, DollarSign } from 'lucide-react';
import { apiClient } from '../lib/api';
import { 
  AuctionGetDto, 
  AuctionCarDetailDto, 
  AuctionCarGetDto
} from '../types/api';
import { useSignalR } from '../hooks/useSignalR';
import { useToast } from '../components/ToastProvider';
import { MainCarousel } from '../components/MainCarousel';
import { LotInfoCard } from '../components/LotInfoCard';
import { BidPanel } from '../components/BidPanel';
import { UpcomingList } from '../components/UpcomingList';
import { WatchButton } from '../components/WatchButton';
import { LiveIndicator } from '../components/LiveIndicator';

const AuctionJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // State
  const [auction, setAuction] = useState<AuctionGetDto | null>(null);
  const [currentCar, setCurrentCar] = useState<AuctionCarDetailDto | null>(null);
  const [upcomingCars, setUpcomingCars] = useState<AuctionCarGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [winner] = useState<any>(null);
  const [finalPrice] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isAuctionLive, setIsAuctionLive] = useState(false);

  // SignalR connection
  const { isConnected, connect, disconnect } = useSignalR(
    {
      baseUrl: 'https://localhost:7249',
      token: localStorage.getItem('authToken') || localStorage.getItem('auth_token') || ''
    },
    {
      onPriceUpdated: ({ auctionCarId, newPrice, bidCount }) => {
        if (currentCar?.id === auctionCarId) {
          setCurrentCar(prev => prev ? { ...prev, currentPrice: newPrice, bidCount } : null);
        }
        // Update upcoming cars list
        setUpcomingCars(prev => 
          prev.map(car => 
            car.id === auctionCarId 
              ? { ...car, currentPrice: newPrice, bidCount }
              : car
          )
        );
      },
      onBidPlaced: ({ auctionCarId, bid }) => {
        if (currentCar?.id === auctionCarId) {
          setCurrentCar(prev => prev ? { ...prev, bidCount: (prev.bidCount || 0) + 1 } : null);
        }
        // Show confetti animation or flash effect
        addToast({
          type: 'success',
          title: 'New Bid Placed',
          message: `Bid of $${bid.amount.toLocaleString()} placed on lot ${bid.lotNumber || 'Unknown'}`
        });
      },
      onNewLiveBid: ({ auctionCarId, bid }) => {
        if (currentCar?.id === auctionCarId) {
          setCurrentCar(prev => prev ? { ...prev, currentPrice: bid.amount, bidCount: (prev.bidCount || 0) + 1 } : null);
        }
        addToast({
          type: 'success',
          title: 'New Live Bid',
          message: `Live bid of $${bid.amount.toLocaleString()} placed!`
        });
      },
      onPreBidPlaced: ({ auctionCarId, bid }) => {
        if (currentCar?.id === auctionCarId) {
          setCurrentCar(prev => prev ? { ...prev, currentPrice: bid.amount, bidCount: (prev.bidCount || 0) + 1 } : null);
        }
        addToast({
          type: 'success',
          title: 'Pre-Bid Placed',
          message: `Pre-bid of $${bid.amount.toLocaleString()} placed!`
        });
      },
      onHighestBidUpdated: ({ auctionCarId, highestBid }) => {
        if (currentCar?.id === auctionCarId) {
          setCurrentCar(prev => prev ? { ...prev, currentPrice: highestBid.amount } : null);
        }
        addToast({
          type: 'info',
          title: 'Highest Bid Updated',
          message: `New highest bid: $${highestBid.amount.toLocaleString()}`
        });
      },
      onCarMoved: ({ nextCarId, nextLot }) => {
        // Animate to next car
        loadAuctionCar(nextCarId);
        addToast({
          type: 'info',
          title: 'Lot Changed',
          message: `Now showing lot ${nextLot}`
        });
      },
      onTimerTick: ({ auctionCarId, remainingSeconds }) => {
        // Update countdown if needed
        setTimerSeconds(remainingSeconds);
        console.log(`Timer for ${auctionCarId}: ${remainingSeconds} seconds remaining`);
      },
      onAuctionTimerReset: ({ auctionCarId, newTimerSeconds }) => {
        if (currentCar?.id === auctionCarId) {
          setTimerSeconds(newTimerSeconds);
        }
        addToast({
          type: 'info',
          title: 'Timer Reset',
          message: 'Auction timer has been reset'
        });
      },
      onAuctionStarted: () => {
        setIsAuctionLive(true);
        addToast({
          type: 'success',
          title: 'Auction Started',
          message: 'The auction is now live!'
        });
      },
      onAuctionStopped: () => {
        setIsAuctionLive(false);
        setAuctionEnded(true);
        addToast({
          type: 'info',
          title: 'Auction Ended',
          message: 'The auction has ended.'
        });
      },
      onAuctionExtended: ({ extensionMinutes }) => {
        addToast({
          type: 'warning',
          title: 'Auction Extended',
          message: `Auction extended by ${extensionMinutes} minutes`
        });
      },
      onAuctionEnded: ({ winner, finalPrice }) => {
        setIsAuctionLive(false);
        setAuctionEnded(true);
        addToast({
          type: 'info',
          title: 'Auction Ended',
          message: `Auction ended. Winner: ${winner?.userName || 'Unknown'}, Final Price: $${finalPrice.toLocaleString()}`
        });
      }
    }
  );

  // Load auction data according to backend logic
  const loadAuction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Checking for ready-to-start auctions...');

      // Step 1: Check for ready-to-start auctions
      const readyToStartAuctions = await apiClient.getReadyToStartAuctions();
      
      console.log('API Response - Ready to start auctions:', readyToStartAuctions);
      
      if (!readyToStartAuctions || readyToStartAuctions.length === 0) {
        // No active auction available
        console.log('No active auction available');
        setAuction(null);
        setCurrentCar(null);
        setUpcomingCars([]);
        setLoading(false);
        return;
      }

      // Get the first ready-to-start auction
      const activeAuction = readyToStartAuctions[0];
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
      // Get full details for the auction car
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

  const handleCarClick = useCallback((car: AuctionCarGetDto) => {
    loadAuctionCar(car.id);
  }, [loadAuctionCar]);


  const handleBidPlaced = useCallback((bid: any) => {
    // Update current car with new bid info
    if (currentCar) {
      setCurrentCar(prev => prev ? {
        ...prev,
        currentPrice: bid.amount,
        bidCount: (prev.bidCount || 0) + 1
      } : null);
    }
  }, [currentCar]);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    loadAuction();
  }, []); // No dependencies to prevent infinite loops

  // Load data on mount only
  useEffect(() => {
    loadAuction();
  }, []); // Empty dependency array - only run on mount

  // Connect to SignalR when auction and car are loaded
  useEffect(() => {
    if (auction?.id && currentCar?.id) {
      console.log('Connecting to SignalR for auction:', auction.id, 'car:', currentCar.id);
      connect(auction.id, currentCar.id);
    }

    return () => {
      disconnect();
    };
  }, [auction?.id, currentCar?.id]); // Only depend on IDs, not full objects


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
            {winner && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Qalib</h3>
                <p className="text-green-200">{winner.userName || 'Unknown User'}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="text-green-200 font-bold text-xl">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
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
                  <LiveIndicator isLive={isAuctionLive} showText />
                  {auction?.locationName && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="h-4 w-4" />
                      {auction.locationName}
                    </div>
                  )}
                </div>
                {timerSeconds > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
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
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {isConnected && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carousel */}
            {currentCar && (
              <MainCarousel
                images={currentCar.car?.imageUrls || []}
                videos={[]}
                className="w-full"
                autoPlay={false}
              />
            )}

            {/* Lot Info */}
            {currentCar && (
              <LotInfoCard
                lotNumber={currentCar.lotNumber || 'Unknown'}
                itemNumber={0}
                vin={currentCar.car?.vin || 'Unknown'}
                odometer={currentCar.car?.odometer || 0}
                damageType={currentCar.car?.damageType || 'None'}
                estimatedValue={0}
                titleType="Clean"
                keysStatus="Available"
                condition={currentCar.car?.condition || 'Good'}
                color={currentCar.car?.color || 'Unknown'}
                engine={currentCar.car?.engine || 'Unknown'}
                transmission={currentCar.car?.transmission || 'Unknown'}
                driveType={currentCar.car?.driveType || 'Unknown'}
                fuelType={currentCar.car?.fuelType || 'Unknown'}
                cylinders={currentCar.car?.cylinders || 0}
                doors={currentCar.car?.doors || 0}
                bodyStyle={currentCar.car?.type || 'Unknown'}
              />
            )}
          </div>

          {/* Right Column - Bid Panel & Upcoming */}
          <div className="space-y-6">
            {/* Bid Panel */}
            {currentCar && (
              <BidPanel
                auctionCarId={currentCar.id}
                currentPrice={currentCar.currentPrice}
                minBidIncrement={25} // Default increment
                isActive={isAuctionLive}
                isReserveMet={currentCar.isReserveMet || false}
                reservePrice={currentCar.reservePrice}
                bidCount={currentCar.bidCount || 0}
                lastBidTime={currentCar.lastBidTime}
                onBidPlaced={handleBidPlaced}
              />
            )}

            {/* Watch Button */}
            {currentCar && (
              <div className="flex justify-center">
                <WatchButton
                  auctionCarId={currentCar.id}
                  size="lg"
                  variant="default"
                />
              </div>
            )}

            {/* Upcoming List */}
            <UpcomingList
              items={upcomingCars.map(car => ({
                id: car.id,
                lotNumber: car.lotNumber || 'Unknown',
                itemNumber: 0,
                carId: car.carId,
                currentPrice: car.currentPrice,
                bidCount: car.bidCount || 0,
                isActive: car.isActive,
                isReserveMet: car.isReserveMet || false,
                lastBidTime: car.lastBidTime,
                photoUrls: []
              }))}
              currentItemId={currentCar?.id}
              onItemClick={(item) => handleCarClick(upcomingCars.find(car => car.id === item.id)!)}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuctionJoinPage;
