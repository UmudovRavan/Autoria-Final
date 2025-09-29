import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CarPhotos from '../components/CarPhotos';
import { 
  Search, 
  Download, 
  Clock, 
  MapPin, 
  Car, 
  Users, 
  Eye, 
  Trash2,
  X,
  Phone,
  Mail,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface WatchlistVehicle {
  id: string;
  auctionCarId: string;
  carId: string;
  auctionId: string;
  lotNumber?: string;
  year: number;
  make?: string;
  model?: string;
  image?: string;
  odometer: number;
  damage?: string;
  estimatedRetailValue: number;
  currentBid: number;
  bidCount: number;
  reservePrice: number;
  isReserveMet: boolean;
  auctionStartTime: string;
  auctionEndTime: string;
  isLive: boolean;
  location: {
    city: string;
    region: string;
    address: string;
    phone: string;
    email: string;
    username: string;
    auctionJoinDate: string;
  };
  condition: {
    titleType: string;
    keysStatus: 'Available' | 'Not Available';
  };
  addedToWatchlistAt: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: WatchlistVehicle['location'];
  lotNumber: string;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location, lotNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Lot #{lotNumber}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{location.city}, {location.region}</p>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">{location.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">{location.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">{location.username}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">Joined: {new Date(location.auctionJoinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Watchlist: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<WatchlistVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField] = useState<keyof WatchlistVehicle>('addedToWatchlistAt');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState<WatchlistVehicle['location'] | null>(null);
  const [selectedLotNumber, setSelectedLotNumber] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Role-based access control
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const roles = user?.user?.roles;
    const isMember = roles && roles.includes('Member');
    const isSeller = roles && roles.includes('Seller');
    
    if (!isMember && !isSeller) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && (user?.user?.roles?.includes('Member') || user?.user?.roles?.includes('Seller'))) {
      loadWatchlistData();
    }
  }, [isAuthenticated, user]);

  // Refresh watchlist when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadWatchlistData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadWatchlistData = () => {
    setLoading(true);
    try {
      // Load watchlist data from localStorage
      const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
      if (savedWatchlistData) {
        const watchlistData: WatchlistVehicle[] = JSON.parse(savedWatchlistData);
        setVehicles(watchlistData);
        console.log('Watchlist loaded from localStorage:', watchlistData);
      } else {
        setVehicles([]);
        console.log('No watchlist data found in localStorage');
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (vehicleId: string) => {
    try {
      // Remove from detailed data
      const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
      if (savedWatchlistData) {
        const watchlistData: WatchlistVehicle[] = JSON.parse(savedWatchlistData);
        const filteredData = watchlistData.filter(item => item.id !== vehicleId);
        localStorage.setItem('vehicleWatchlistData', JSON.stringify(filteredData));
      }

      // Remove from IDs list
      const savedWatchlist = localStorage.getItem('vehicleWatchlist');
      if (savedWatchlist) {
        const watchlistArray: string[] = JSON.parse(savedWatchlist);
        const filteredIds = watchlistArray.filter(id => id !== vehicleId);
        localStorage.setItem('vehicleWatchlist', JSON.stringify(filteredIds));
      }

      // Update local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      console.log(`Vehicle ${vehicleId} removed from watchlist`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = (vehicleId: string) => {
    removeFromWatchlist(vehicleId);
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatOdometer = (odometer: number) => {
    return new Intl.NumberFormat('en-US').format(odometer) + ' mi';
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { text: 'Auction Ended', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { text: `${minutes}m`, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  const getSaleStatus = (auctionStartTime: string, auctionEndTime: string, isLive: boolean) => {
    const now = new Date();
    const start = new Date(auctionStartTime);
    const end = new Date(auctionEndTime);
    
    if (now < start) {
      return { text: 'Upcoming', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    } else if (now >= start && now <= end && isLive) {
      return { text: 'Live', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else {
      return { text: 'Ended', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const handleLocationClick = (location: WatchlistVehicle['location'], lotNumber: string) => {
    setSelectedLocation(location);
    setSelectedLotNumber(lotNumber);
    setShowLocationModal(true);
  };

  const handleBidNow = (vehicle: WatchlistVehicle) => {
    // TODO: Implement bid functionality
    console.log('Bid now for vehicle:', vehicle.lotNumber || 'N/A');
  };


  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export watchlist to CSV/Excel');
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      (vehicle.make?.toLowerCase() || '').includes(query) ||
      (vehicle.model?.toLowerCase() || '').includes(query) ||
      (vehicle.lotNumber?.toLowerCase() || '').includes(query)
    );
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const paginatedVehicles = sortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">My Watchlist</h1>
            <p className="text-xs text-gray-600">Track your favorite vehicles and bid on them</p>
          </div>
          <button
            onClick={loadWatchlistData}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by make, model or lot number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 pl-8 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lot #
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Make
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sale Date
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Odometer
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Damage
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Est. Value
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Bid
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedVehicles.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-2 py-8 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Eye className="h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-600">No vehicles in your watchlist</p>
                                <p className="text-xs text-gray-500">Add vehicles from the Vehicle Finder to get started</p>
                                <Link 
                                  to="/vehicle-finder"
                                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                >
                                  Browse Vehicles
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedVehicles.map((vehicle) => {
                          const timeRemaining = getTimeRemaining(vehicle.auctionEndTime);
                          const saleStatus = getSaleStatus(vehicle.auctionStartTime, vehicle.auctionEndTime, vehicle.isLive);
                          
                          return (
                            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="relative w-12 h-8 rounded overflow-hidden">
                                  <CarPhotos 
                                    carId={vehicle.carId} 
                                    showMultiple={false}
                                    className="w-full h-full"
                                  />
                                  <div className="absolute top-0.5 left-0.5">
                                    <span className="px-1 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                                      Watch
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                {vehicle.lotNumber || 'N/A'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {vehicle.year || 'N/A'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {vehicle.make || 'Unknown'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {vehicle.model || 'Unknown'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleLocationClick(vehicle.location, vehicle.lotNumber || 'N/A')}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                  <MapPin className="h-2 w-2" />
                                  {vehicle.location.city}-{vehicle.location.region}
                                </button>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <div className="text-xs text-gray-900">
                                    {new Date(vehicle.auctionStartTime).toLocaleDateString()}
                                  </div>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${saleStatus.bgColor} ${saleStatus.color}`}>
                                    {saleStatus.text}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {formatOdometer(vehicle.odometer)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {vehicle.damage || 'None'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                {formatPrice(vehicle.estimatedRetailValue)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-blue-600">
                                    {formatPrice(vehicle.currentBid)}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-2 w-2" />
                                    {vehicle.bidCount}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                                      vehicle.isReserveMet 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {vehicle.isReserveMet ? 'Met' : 'Not Met'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-2 w-2" />
                                    <span className={`text-xs font-medium ${timeRemaining.color}`}>
                                      {timeRemaining.text}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => handleBidNow(vehicle)}
                                    className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                                  >
                                    Bid
                                  </button>
                                  <Link
                                    to={`/auctions/${vehicle.auctionId}/cars/${vehicle.carId}`}
                                    className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors text-center"
                                  >
                                    Details
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveFromWatchlist(vehicle.id)}
                                    className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Trash2 className="h-2 w-2" />
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white px-2 py-1.5 flex items-center justify-between border-t border-gray-200 sm:px-3">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="ml-1 relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-gray-700">
                            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                            {'-'}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, filteredVehicles.length)}
                            </span>
                            {' of '}
                            <span className="font-medium">{filteredVehicles.length}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded shadow-sm -space-x-px">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-1.5 py-1 rounded-l border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Prev
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`relative inline-flex items-center px-2 py-1 border text-xs font-medium ${
                                    currentPage === pageNum
                                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-1.5 py-1 rounded-r border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* About Watchlist Panel */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-3 w-3 text-blue-600" />
                <h3 className="text-xs font-semibold text-gray-900">About Watchlist</h3>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <p>
                  Track vehicles and never miss bidding opportunities. 
                  Real-time updates on prices and auction status.
                </p>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-xs">Features:</h4>
                  <ul className="space-y-0.5 text-xs">
                    <li>• Real-time updates</li>
                    <li>• Live bid tracking</li>
                    <li>• Reserve status</li>
                    <li>• Easy management</li>
                    <li>• Export data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-xs">Colors:</h4>
                  <ul className="space-y-0.5 text-xs">
                    <li>• <span className="text-green-600">Green:</span> Met</li>
                    <li>• <span className="text-red-600">Red:</span> Not Met</li>
                    <li>• <span className="text-orange-600">Orange:</span> Time</li>
                    <li>• <span className="text-blue-600">Blue:</span> Upcoming</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Modal */}
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          location={selectedLocation!}
          lotNumber={selectedLotNumber}
        />
      </div>
    </div>
  );
};

export default Watchlist;
