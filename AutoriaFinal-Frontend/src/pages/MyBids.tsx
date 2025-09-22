import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { BidGetDto } from '../types/api';
import BidCard from '../components/BidCard';
import { TrendingUp, Award, Clock, X, Filter, Search } from 'lucide-react';

type BidFilter = 'all' | 'active' | 'winning' | 'outbid' | 'expired';

export default function MyBids() {
  const [bids, setBids] = useState<any[]>([]);
  const [filteredBids, setFilteredBids] = useState<BidGetDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BidFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = [
    { key: 'all', label: 'All Bids', icon: TrendingUp },
    { key: 'active', label: 'Active', icon: Clock },
    { key: 'winning', label: 'Winning', icon: Award },
    { key: 'outbid', label: 'Outbid', icon: X },
  ] as const;

  useEffect(() => {
    loadMyBids();
  }, []);

  useEffect(() => {
    filterBids();
  }, [bids, activeFilter, searchTerm]);

  const loadMyBids = async () => {
    try {
      const myBids = await apiClient.getMyBids();
      const safeBids = Array.isArray(myBids) ? myBids : [];
      setBids(safeBids);
      setError(null);
    } catch (error) {
      console.error('Error loading my bids:', error);
      setBids([]);
      setError('Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBids = () => {
    const sourceBids = Array.isArray(bids) ? bids : [];
    let filtered = [...sourceBids];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(bid => {
        switch (activeFilter) {
          case 'active':
            return bid.isActive;
          case 'winning':
            return bid.isWinning;
          case 'outbid':
            return bid.status?.toLowerCase() === 'outbid';
          case 'expired':
            return bid.isExpired;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bid =>
        bid.auctionCarLotNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBids(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const sourceBids = Array.isArray(bids) ? bids : [];
    const totalBids = sourceBids.length;
    const activeBids = sourceBids.filter(bid => bid?.isActive).length;
    const winningBids = sourceBids.filter(bid => bid?.isWinning).length;
    const totalAmount = sourceBids.reduce((sum, bid) => sum + (Number(bid?.amount) || 0), 0);

    return { totalBids, activeBids, winningBids, totalAmount };
  };

  const stats = getStats();
  const safeBids = Array.isArray(bids) ? bids : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
          <p className="text-gray-600">Track all your bidding activity across auctions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalBids}</span>
            </div>
            <div className="text-sm text-gray-600">Total Bids</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.activeBids}</span>
            </div>
            <div className="text-sm text-gray-600">Active Bids</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.winningBids}</span>
            </div>
            <div className="text-sm text-gray-600">Winning Bids</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-600 font-bold text-lg">$</div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Bid Amount</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by lot number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.key;
              const sourceBids = Array.isArray(bids) ? bids : [];
              const count = filter.key === 'all' ? sourceBids.length : sourceBids.filter(bid => {
                switch (filter.key) {
                  case 'active':
                    return bid?.isActive;
                  case 'winning':
                    return bid?.isWinning;
                  case 'outbid':
                    return bid?.status?.toLowerCase() === 'outbid';
                  default:
                    return false;
                }
              }).length;

              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {filter.label}
                  <span className="ml-2 bg-white px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredBids.length} bid{filteredBids.length !== 1 ? 's' : ''} found
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Results for "<span className="font-medium">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} showCarInfo={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No bids match your search "${searchTerm}"`
                : `No bids match the selected filter "${filters.find(f => f.key === activeFilter)?.label}"`
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}