import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Info,
  ArrowRight,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { useAuth } from '../hooks/useAuth';


interface AuctionSale {
  id: string;
  saleTime: string;
  saleName: string;
  region: string;
  saleType: string;
  saleHighlights: string[];
  currentSale: string;
  nextSale: string;
  futureSaleStatus: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  location: string;
  totalCars: number;
  soldCars: number;
  totalRevenue: number;
  isLive: boolean;
}

interface SalesListFilters {
  searchQuery: string;
  region: string;
  status: 'all' | 'live' | 'upcoming';
}

type SortField = 'saleTime' | 'saleName' | 'region' | 'saleType' | 'currentSale';
type SortDirection = 'asc' | 'desc';

const SalesList: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionSale[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SalesListFilters>({
    searchQuery: '',
    region: '',
    status: 'all'
  });
  const [sortField, setSortField] = useState<SortField>('saleTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && (user?.user?.roles?.includes('Member') || user?.user?.roles?.includes('Seller'))) {
      loadSalesData();
    }
  }, [isAuthenticated, user]);

  // Reload data when status filter changes
  useEffect(() => {
    loadSalesData();
  }, [filters.status]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      console.log('Loading sales data with filter:', filters.status);
      
      let salesData: any[] = [];
      
      // Load data based on status filter
      switch (filters.status) {
        case 'live':
          salesData = await apiClient.getLiveSalesList();
          break;
        case 'upcoming':
          salesData = await apiClient.getUpcomingSalesList();
          break;
        case 'all':
        default:
          salesData = await apiClient.getSalesList();
          break;
      }
      
      setAuctions(salesData);

      // Load regions
      const regionsData = await apiClient.getRegions();
      setRegions(regionsData);

      console.log(`Loaded ${salesData.length} auctions for status: ${filters.status}`);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setAuctions([]);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };



  const handleFilterChange = (field: keyof SalesListFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Live': return 'bg-red-100 text-red-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesRegion = !filters.region || auction.region === filters.region;
    const matchesSearch = !filters.searchQuery || 
      auction.saleName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      auction.location.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      auction.region.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesRegion && matchesSearch;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'saleTime' || sortField === 'currentSale') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = aValue?.toString().toLowerCase() || '';
      bValue = bValue?.toString().toLowerCase() || '';
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedAuctions = sortedAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);

  const handleAuctionClick = (auction: AuctionSale) => {
    navigate(`/auction/${auction.id}`);
  };

  const handleCurrentSaleClick = (auction: AuctionSale) => {
    navigate(`/auction/${auction.id}/cars`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {filters.status === 'live' ? 'Live Auctions' : 
             filters.status === 'upcoming' ? 'Upcoming Auctions' : 
             'All Auctions'}
          </h1>
          <p className="text-sm text-gray-600">
            {filters.status === 'live' ? 'Browse and join live auctions' : 
             filters.status === 'upcoming' ? 'Browse and filter upcoming auctions' : 
             'Browse and filter all auctions (live and upcoming)'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value as 'all' | 'live' | 'upcoming')}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Auctions</option>
                    <option value="live">Live Auctions</option>
                    <option value="upcoming">Upcoming Auctions</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Regions</option>
                    {regions.map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Box */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by location or region..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 pl-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
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
                          <th 
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('saleTime')}
                          >
                            <div className="flex items-center gap-1">
                              Sale Time
                              {sortField === 'saleTime' && (
                                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('saleName')}
                          >
                            <div className="flex items-center gap-1">
                              Sale Name
                              {sortField === 'saleName' && (
                                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('region')}
                          >
                            <div className="flex items-center gap-1">
                              Region
                              {sortField === 'region' && (
                                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Highlights
                          </th>
                          <th 
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('currentSale')}
                          >
                            <div className="flex items-center gap-1">
                              Current Sale
                              {sortField === 'currentSale' && (
                                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Next Sale
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedAuctions.map((auction, index) => (
                          <tr 
                            key={auction.id}
                            className={`hover:bg-blue-50 cursor-pointer transition-colors duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                            onClick={() => handleAuctionClick(auction)}
                          >
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <div>
                                  <div className="font-medium text-xs">{formatDate(auction.saleTime)}</div>
                                  <div className="text-gray-500 text-xs">{formatTime(auction.saleTime)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">{auction.saleName}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-2 w-2" />
                                {auction.location}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                              {auction.region}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {auction.saleHighlights.slice(0, 2).map((highlight, idx) => (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {highlight}
                                  </span>
                                ))}
                                {auction.saleHighlights.length > 2 && (
                                  <span className="text-xs text-gray-500">+{auction.saleHighlights.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCurrentSaleClick(auction);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                              >
                                {formatDate(auction.currentSale)}
                                <ExternalLink className="h-2 w-2" />
                              </button>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                              {formatDate(auction.nextSale)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auction.futureSaleStatus)}`}>
                                {auction.futureSaleStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200 sm:px-4">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-gray-700">
                            Showing{' '}
                            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, filteredAuctions.length)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{filteredAuctions.length}</span>
                            {' '}results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`relative inline-flex items-center px-3 py-1.5 border text-xs font-medium ${
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
                              className="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* About Sales List Panel */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  {filters.status === 'live' ? 'About Live Auctions' : 
                   filters.status === 'upcoming' ? 'About Upcoming Auctions' : 
                   'About All Auctions'}
                </h3>
              </div>
              
              <div className="space-y-3 text-xs text-gray-600">
                <p>
                  {filters.status === 'live' ? 'Shows all currently live auctions that you can join and bid on.' : 
                   filters.status === 'upcoming' ? 'Shows all future auctions scheduled to take place.' : 
                   'Shows all auctions including live and upcoming. Filter by status, region and search by location.'}
                </p>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-xs">What You'll See:</h4>
                  <ul className="space-y-0.5 text-xs">
                    <li>• <strong>Sale Time:</strong> When auction starts</li>
                    <li>• <strong>Sale Name:</strong> Auction name and location</li>
                    <li>• <strong>Region:</strong> Geographic region</li>
                    <li>• <strong>Highlights:</strong> Special features</li>
                    <li>• <strong>Current Sale:</strong> Click to view cars</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-xs">Features:</h4>
                  <ul className="space-y-0.5 text-xs">
                    <li>• {filters.status === 'live' ? 'Live auctions only' : 
                         filters.status === 'upcoming' ? 'Upcoming auctions only' : 
                         'All auctions (live & upcoming)'}</li>
                    <li>• Status filtering (Live/Upcoming/All)</li>
                    <li>• Region filtering</li>
                    <li>• Search by location</li>
                    <li>• Sortable columns</li>
                    <li>• Mobile-responsive</li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-1 text-xs">Quick Links:</h4>
                  <div className="space-y-1">
                    <Link 
                      to="/vehicle-finder" 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Vehicle Finder
                    </Link>
                    <Link 
                      to="/todays-auctions" 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Today's Auctions
                    </Link>
                    <Link 
                      to="/auctions/calendar" 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Auction Calendar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesList;
