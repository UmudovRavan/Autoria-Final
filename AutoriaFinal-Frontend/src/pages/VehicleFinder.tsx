import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, MapPin, Gauge, Car, Eye } from 'lucide-react';
import { apiClient } from '../lib/api';
import { VehicleSearchParams, VehicleSearchResult, VehicleSearchItem, VehicleFilters } from '../types/api';

const VehicleFinder: React.FC = () => {
  const [searchParams, setSearchParams] = useState<VehicleSearchParams>({
    page: 1,
    pageSize: 12
  });
  const [searchResults, setSearchResults] = useState<VehicleSearchResult | null>(null);
  const [filters, setFilters] = useState<VehicleFilters | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load filters on component mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (searchParams.make) {
      loadModels(searchParams.make);
    } else {
      setModels([]);
    }
  }, [searchParams.make]);

  const loadFilters = async () => {
    try {
      const filtersData = await apiClient.getVehicleFilters();
      setFilters(filtersData);
    } catch (error) {
      console.error('Error loading filters:', error);
      // Show error message to user
      alert('Failed to load vehicle filters. Please refresh the page.');
    }
  };

  const loadModels = async (make: string) => {
    try {
      const modelsData = await apiClient.getVehicleModels(make);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
      setModels([]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await apiClient.searchVehicles(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      // Show error message to user
      alert('Failed to search vehicles. Please check your connection and try again.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VehicleSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };


  const VehicleCard: React.FC<{ vehicle: VehicleSearchItem; viewMode: 'grid' | 'list' }> = ({ vehicle, viewMode }) => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex">
            <div className="relative w-48 h-32 flex-shrink-0">
              <img 
                src={vehicle.carImage || '/placeholder-car.jpg'} 
                alt={`${vehicle.carMake} ${vehicle.carModel}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-car.jpg';
                }}
              />
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  vehicle.isActive 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {vehicle.isActive ? 'Live Auction' : 'Upcoming'}
                </span>
              </div>
              {/* Lot Number */}
              <div className="absolute top-2 right-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                  #{vehicle.lotNumber}
                </span>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vehicle.carYear} {vehicle.carMake} {vehicle.carModel}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {vehicle.carOdometer && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        {vehicle.carOdometer.toLocaleString()} miles
                      </span>
                    )}
                    {vehicle.carDamageType && vehicle.carDamageType !== 'None' && (
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {vehicle.carDamageType}
                      </span>
                    )}
                    {vehicle.carLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {vehicle.carLocation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 mb-1">{formatPrice(vehicle.currentPrice)}</p>
                  <p className="text-sm text-gray-600">{vehicle.bidCount} bids</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {vehicle.carCondition && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.carCondition === 'Used' ? 'bg-blue-100 text-blue-700' : 
                      vehicle.carCondition === 'Salvage' ? 'bg-red-100 text-red-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {vehicle.carCondition}
                    </span>
                  )}
                  {vehicle.carType && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {vehicle.carType}
                    </span>
                  )}
                </div>
                <Link 
                  to={`/car/${vehicle.id}`}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img 
            src={vehicle.carImage || '/placeholder-car.jpg'} 
            alt={`${vehicle.carMake} ${vehicle.carModel}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-car.jpg';
            }}
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              vehicle.isActive 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {vehicle.isActive ? 'Live Auction' : 'Upcoming'}
            </span>
          </div>
          {/* Lot Number */}
          <div className="absolute top-3 right-3">
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
              #{vehicle.lotNumber}
            </span>
          </div>
          {/* Current Price */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
              {formatPrice(vehicle.currentPrice)}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {vehicle.carYear} {vehicle.carMake} {vehicle.carModel}
          </h3>
          <div className="space-y-2 mb-4">
            {vehicle.carOdometer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Gauge className="h-4 w-4" />
                <span>{vehicle.carOdometer.toLocaleString()} miles</span>
              </div>
            )}
            {vehicle.carDamageType && vehicle.carDamageType !== 'None' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Car className="h-4 w-4" />
                <span>{vehicle.carDamageType}</span>
              </div>
            )}
            {vehicle.carLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{vehicle.carLocation}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {vehicle.carCondition && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.carCondition === 'Used' ? 'bg-blue-100 text-blue-700' : 
                  vehicle.carCondition === 'Salvage' ? 'bg-red-100 text-red-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {vehicle.carCondition}
                </span>
              )}
              {vehicle.carType && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  {vehicle.carType}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600 font-medium">{vehicle.bidCount} bids</span>
          </div>
          <Link 
            to={`/car/${vehicle.id}`}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Finder</h1>
          <p className="text-gray-600">Search and filter vehicles from our auction inventory</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search Filters Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="relative overflow-hidden rounded-xl p-6 sticky top-8 shadow-lg" style={{
              background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Search Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Condition</label>
                  <div className="flex gap-2">
                    {filters?.conditions.map((condition) => (
                      <button
                        key={condition}
                        onClick={() => handleInputChange('condition', condition === 'All' ? undefined : condition)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                          searchParams.condition === condition || (condition === 'All' && !searchParams.condition)
                            ? 'bg-white text-blue-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Vehicle Type</label>
                  <select
                    value={searchParams.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value || undefined)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300 custom-dropdown"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>All Types</option>
                    {filters?.types.map((type) => (
                      <option key={type} value={type} style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Year Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="From"
                      value={searchParams.minYear || ''}
                      onChange={(e) => handleInputChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300"
                    />
                    <input
                      type="number"
                      placeholder="To"
                      value={searchParams.maxYear || ''}
                      onChange={(e) => handleInputChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Odometer Range */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Mileage Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={searchParams.minOdometer || ''}
                      onChange={(e) => handleInputChange('minOdometer', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={searchParams.maxOdometer || ''}
                      onChange={(e) => handleInputChange('maxOdometer', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Damage Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Damage Type</label>
                  <select
                    value={searchParams.damageType || ''}
                    onChange={(e) => handleInputChange('damageType', e.target.value || undefined)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300 custom-dropdown"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>All Damage Types</option>
                    {filters?.damageTypes.map((damage) => (
                      <option key={damage} value={damage} style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>{damage}</option>
                    ))}
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Make</label>
                  <select
                    value={searchParams.make || ''}
                    onChange={(e) => handleInputChange('make', e.target.value || undefined)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300 custom-dropdown"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>All Makes</option>
                    {filters?.makes.map((make) => (
                      <option key={make} value={make} style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>{make}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Model</label>
                  <select
                    value={searchParams.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value || undefined)}
                    disabled={!searchParams.make}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300 disabled:opacity-50"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>All Models</option>
                    {models.map((model) => (
                      <option key={model} value={model} style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Location</label>
                  <select
                    value={searchParams.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value || undefined)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300 custom-dropdown"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>All Locations</option>
                    {filters?.locations.map((location) => (
                      <option key={location} value={location} style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* VIN / Lot Number */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">VIN / Lot Number</label>
                  <input
                    type="text"
                    placeholder="Enter VIN or Lot #"
                    value={searchParams.vin || searchParams.lotNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.match(/^[A-Z0-9]{17}$/)) {
                        handleInputChange('vin', value);
                        handleInputChange('lotNumber', undefined);
                      } else {
                        handleInputChange('lotNumber', value);
                        handleInputChange('vin', undefined);
                      }
                    }}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Search className="h-5 w-5" />
                  {loading ? 'Searching...' : 'Search Vehicles'}
                </button>
              </div>
            </div>
          </div>

          {/* Search Results Panel */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="relative overflow-hidden rounded-xl p-6 shadow-lg" style={{
                background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Search Results</h2>
                  {searchResults && (
                    <p className="text-white/80 text-sm">
                      {searchResults.totalCount} vehicles found
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : searchResults ? (
                <>
                  {searchResults.vehicles.length > 0 ? (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                      : 'space-y-4'
                    }>
                      {searchResults.vehicles.map((vehicle) => (
                        <VehicleCard 
                          key={vehicle.id} 
                          vehicle={vehicle} 
                          viewMode={viewMode} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 text-white/60 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No vehicles found</h3>
                      <p className="text-white/80">Try adjusting your search filters</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-white/60 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Start your search</h3>
                  <p className="text-white/80">Use the filters on the left to find vehicles</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFinder;
