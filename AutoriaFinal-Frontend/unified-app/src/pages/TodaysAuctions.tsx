import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  MapPin, 
  Calendar, 
  List, 
  Eye, 
  X,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  RefreshCw,
  Play
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { AuctionGetDto, LocationDto } from '../types/api';

interface AuctionWithDetails extends AuctionGetDto {
  locationName?: string;
  carCount?: number;
  isLive: boolean;
  isUpcoming?: boolean;
  type?: string;
  description?: string;
}

interface AuctionDetails {
  id: string;
  name: string;
  description?: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: string;
  location: {
    name: string;
    city: string;
    region: string;
    address: string;
    phone: string;
    email: string;
  };
  totalCars: number;
  soldCars: number;
  totalRevenue: number;
  type: string;
}

const TodaysAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionWithDetails[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaleType, setSelectedSaleType] = useState('All');
  const [saleTypes, setSaleTypes] = useState<string[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<AuctionDetails | null>(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadAuctions();
    loadLocations();
    loadSaleTypes();
  }, []);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      console.log('Loading auctions and locations...');
      const [auctionsData, locationsData] = await Promise.all([
        apiClient.getAuctions(),
        apiClient.getLocations()
      ]);
      
      console.log('Auctions loaded:', auctionsData);
      console.log('Locations loaded:', locationsData);
      
      setLocations(locationsData);
      
      // Filter today's auctions and add location details
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysAuctions = auctionsData
        .filter(auction => {
          const auctionDate = new Date(auction.startTimeUtc);
          return auctionDate >= today && auctionDate < tomorrow;
        })
        .map(auction => {
          const location = locationsData.find(loc => loc.id === auction.locationId);
          const now = new Date();
          const startTime = new Date(auction.startTimeUtc);
          const endTime = new Date(auction.endTimeUtc);
          
          return {
            ...auction,
            locationName: location ? `${location.city}-${location.state || location.country}` : 'Unknown Location',
            isLive: now >= startTime && now <= endTime,
            isUpcoming: now < startTime
          };
        });
      
      console.log('Today\'s auctions:', todaysAuctions);
      setAuctions(todaysAuctions);
    } catch (error) {
      console.error('Error loading auctions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Failed to load auctions: ${errorMessage}`);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      console.log('Loading locations...');
      const locationsData = await apiClient.getLocations();
      console.log('Locations loaded successfully:', locationsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Failed to load locations: ${errorMessage}`);
    }
  };

  const loadSaleTypes = async () => {
    try {
      console.log('Loading sale types...');
      const saleTypesData = await apiClient.getSaleTypes();
      console.log('Sale types loaded successfully:', saleTypesData);
      const types = saleTypesData.map(type => type.name);
      setSaleTypes(['All', ...types]);
    } catch (error) {
      console.error('Error loading sale types:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Failed to load sale types: ${errorMessage}`);
      setSaleTypes(['All', 'Copart US', 'Dealer', 'Bank', 'Government', 'Fleet']);
    }
  };

  const loadAuctionCarCount = async (auctionId: string) => {
    try {
      console.log(`Loading auction car count for auction: ${auctionId}`);
      const auctionCars = await apiClient.getAuctionCars(auctionId);
      console.log(`Auction cars loaded for ${auctionId}:`, auctionCars);
      return auctionCars.length;
    } catch (error) {
      console.error('Error loading auction car count:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Failed to load auction car count: ${errorMessage}`);
      return 0;
    }
  };

  const handleAuctionClick = async (auction: AuctionWithDetails) => {
    try {
      const carCount = await loadAuctionCarCount(auction.id);
      const location = locations.find(loc => loc.id === auction.locationId);
      
      const auctionDetails: AuctionDetails = {
        id: auction.id,
        name: auction.name || 'Auction',
        description: auction.description,
        startTimeUtc: auction.startTimeUtc,
        endTimeUtc: auction.endTimeUtc,
        status: auction.status || 'Unknown',
        location: {
          name: location?.name || 'Unknown',
          city: location?.city || 'Unknown',
          region: location?.state || location?.country || 'Unknown',
          address: location?.address || 'Address not available',
          phone: location?.phone || 'Phone not available',
          email: location?.email || 'Email not available'
        },
        totalCars: carCount,
        soldCars: auction.soldCarsCount || 0,
        totalRevenue: auction.totalRevenue || 0,
        type: auction.type || 'Unknown'
      };
      
      setSelectedAuction(auctionDetails);
      setShowAuctionModal(true);
    } catch (error) {
      console.error('Error loading auction details:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = searchQuery === '' || 
      auction.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.locationName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSaleType = selectedSaleType === 'All' || 
      auction.type === selectedSaleType;
    
    return matchesSearch && matchesSaleType;
  });

  const liveAuctions = filteredAuctions.filter(auction => auction.isLive);
  const upcomingAuctions = filteredAuctions.filter(auction => auction.isUpcoming);

  const paginatedLiveAuctions = liveAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedUpcomingAuctions = upcomingAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading today's auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Today's Auctions</h1>
              <p className="text-gray-600 mt-2">Live and upcoming auctions for today</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white">
                <List className="h-4 w-4 mr-2 inline" />
                List
              </div>
              <Link
                to="/auctions/calendar"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <CalendarIcon className="h-4 w-4" />
                Auction Calendar
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Auctions
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sale Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Type
                </label>
                <select
                  value={selectedSaleType}
                  onChange={(e) => setSelectedSaleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {saleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Live Auctions</span>
                  <span className="text-sm font-medium text-red-600">{liveAuctions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="text-sm font-medium text-green-600">{upcomingAuctions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Total Today</span>
                  <span className="text-sm font-medium text-gray-900">{filteredAuctions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions today</h3>
                <p className="text-gray-600">There are no auctions scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Live Auctions Table */}
                {liveAuctions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      Live Auctions ({liveAuctions.length})
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Damage Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedLiveAuctions.map((auction) => (
                              <tr key={auction.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {formatTime(auction.startTimeUtc)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatDate(auction.startTimeUtc)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleAuctionClick(auction)}
                                    className="text-left hover:text-blue-600 transition-colors"
                                  >
                                    <div className="text-sm font-bold text-gray-900 hover:text-blue-600">
                                      {auction.name || 'Auction'}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {auction.locationName}
                                    </div>
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {auction.type || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Mixed
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{auction.carCount || 0}</span>
                                    <span className="text-gray-500">vehicles</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/auctions/${auction.id}/cars`}
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View List
                                    </Link>
                                    <Link
                                      to={`/auctions/${auction.id}/join`}
                                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Join Auction
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Auctions Table */}
                {upcomingAuctions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      Upcoming Auctions ({upcomingAuctions.length})
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Damage Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedUpcomingAuctions.map((auction) => (
                              <tr key={auction.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {formatTime(auction.startTimeUtc)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatDate(auction.startTimeUtc)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleAuctionClick(auction)}
                                    className="text-left hover:text-blue-600 transition-colors"
                                  >
                                    <div className="text-sm font-bold text-gray-900 hover:text-blue-600">
                                      {auction.name || 'Auction'}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {auction.locationName}
                                    </div>
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {auction.type || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Mixed
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{auction.carCount || 0}</span>
                                    <span className="text-gray-500">vehicles</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/auctions/${auction.id}/cars`}
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View List
                                    </Link>
                                    <Link
                                      to={`/auctions/${auction.id}/join`}
                                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Join Auction
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filteredAuctions.length)}
                          </span>{' '}
                          of <span className="font-medium">{filteredAuctions.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - About Section */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Today's Auctions</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Today's auctions feature live and upcoming vehicle sales from various locations. 
                  Live auctions are currently in progress and accepting bids.
                </p>
                <p>
                  Upcoming auctions are scheduled to start later today. You can view the vehicle 
                  inventory for each auction by clicking "View List".
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Features:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Real-time auction status</li>
                    <li>• Live bid tracking</li>
                    <li>• Vehicle inventory preview</li>
                    <li>• Location-based filtering</li>
                    <li>• Sale type categorization</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/vehicle-finder"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Browse All Vehicles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auction Details Modal */}
        {showAuctionModal && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{selectedAuction.name}</h3>
                  <button
                    onClick={() => setShowAuctionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Auction Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Time</label>
                      <p className="text-sm text-gray-900">{formatTime(selectedAuction.startTimeUtc)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Time</label>
                      <p className="text-sm text-gray-900">{formatTime(selectedAuction.endTimeUtc)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-sm text-gray-900">{selectedAuction.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-sm text-gray-900">{selectedAuction.type}</p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedAuction.location.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedAuction.location.city}, {selectedAuction.location.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedAuction.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedAuction.location.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedAuction.location.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auction Stats */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Auction Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedAuction.totalCars}</div>
                        <div className="text-xs text-gray-600">Total Vehicles</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedAuction.soldCars}</div>
                        <div className="text-xs text-gray-600">Sold</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">${selectedAuction.totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Link
                      to={`/auctions/${selectedAuction.id}/cars`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Vehicle List
                    </Link>
                    <button
                      onClick={() => setShowAuctionModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysAuctions;
