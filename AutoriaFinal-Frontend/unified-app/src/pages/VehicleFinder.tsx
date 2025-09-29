import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, MapPin, Gauge, Car, Eye, Heart, Plus, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../lib/api';
import { VehicleSearchParams, VehicleSearchResult, VehicleFilters, CarData } from '../types/api';
import CarPhotos from '../components/CarPhotos';
import { useAuth } from '../hooks/useAuth';

const VehicleFinder: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState<VehicleSearchParams>({
    page: 1,
    pageSize: 12
  });
  const [searchResults, setSearchResults] = useState<VehicleSearchResult | null>(null);
  const [filters, setFilters] = useState<VehicleFilters | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Load filters and watchlist on component mount
  useEffect(() => {
    if (isAuthenticated && (user?.user?.roles?.includes('Member') || user?.user?.roles?.includes('Seller'))) {
    loadFilters();
    loadWatchlist();
    }
  }, [isAuthenticated, user]);

  // Handle URL search parameters
  useEffect(() => {
    const searchQuery = urlSearchParams.get('search');
    if (searchQuery) {
      // Set search parameters based on URL query
      setSearchParams(prev => ({
        ...prev,
        make: searchQuery,
        page: 1
      }));
    }
  }, [urlSearchParams]);

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
      console.log('Loading vehicle filters from API endpoints...');
      // Load all filter data in parallel for better performance
      const [makes, conditions, damageTypes, types, locations] = await Promise.all([
        apiClient.getVehicleMakes(),
        apiClient.getVehicleConditions(),
        apiClient.getVehicleDamageTypes(),
        apiClient.getVehicleTypes(),
        apiClient.getLocations()
      ]);

      // Extract location names from location objects
      const locationNames = locations.map((location: any) => 
        location.name || location.city || location.id || 'Unknown Location'
      );

      const filtersData = {
        conditions: ['All', ...conditions],
        types: ['All', ...types],
        damageTypes: ['All', ...damageTypes],
        makes: ['All', ...makes],
        models: ['All'], // Models will be loaded dynamically when make is selected
        locations: ['All', ...locationNames]
      };

      console.log('Filters loaded successfully:', filtersData);
      setFilters(filtersData);
    } catch (error) {
      console.error('Error loading filters:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showAlert(`Failed to load filters: ${errorMessage}. Using default options.`, 'error');
      // Set default filters
      setFilters({
        conditions: ['All', 'Used', 'Salvage', 'Excellent', 'Good', 'Fair'],
        types: ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Wagon'],
        damageTypes: ['All', 'None', 'Front End', 'Rear End', 'Side', 'All Over', 'Water/Flood', 'Hail', 'Vandalism'],
        makes: ['All', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Toyota', 'Honda', 'Nissan', 'Hyundai'],
        models: ['All'],
        locations: ['All', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Miami', 'Dallas', 'Atlanta', 'Denver', 'Seattle']
      });
    }
  };

  const loadModels = async (make: string) => {
    try {
      console.log(`Loading models for make: ${make}`);
      const modelsData = await apiClient.getVehicleModels(make);
      console.log('Models loaded successfully:', modelsData);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Failed to load models: ${errorMessage}`);
      setModels([]);
    }
  };

  const loadWatchlist = () => {
    try {
      console.log('Loading watchlist from localStorage...');
      const savedWatchlist = localStorage.getItem('vehicleWatchlist');
      if (savedWatchlist) {
        const watchlistArray: string[] = JSON.parse(savedWatchlist);
        const watchlistIds = new Set<string>(watchlistArray);
        console.log('Watchlist loaded from localStorage:', watchlistIds);
        setWatchlist(watchlistIds);
      } else {
        console.log('No watchlist found in localStorage, starting with empty watchlist');
        setWatchlist(new Set<string>());
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
      setWatchlist(new Set<string>());
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('Loading all vehicles from GET /api/car...');
      
      // Get all vehicles from GET /api/car endpoint
      const allVehicles: CarData[] = await apiClient.getCars();
      console.log('All vehicles from API:', allVehicles);
      
      // Apply client-side filtering
      const filteredVehicles = applyClientSideFilters(allVehicles, searchParams);
      console.log('Filtered vehicles:', filteredVehicles);
      
      // Apply pagination
      const page = searchParams.page || 1;
      const pageSize = searchParams.pageSize || 12;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
      
      const results = {
        vehicles: paginatedVehicles,
        totalCount: filteredVehicles.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredVehicles.length / pageSize)
      };
      
      console.log('Final search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showAlert(`Failed to load vehicles: ${errorMessage}. Please check your connection and try again.`, 'error');
      setSearchResults({
        vehicles: [],
        totalCount: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const applyClientSideFilters = (vehicles: CarData[], params: VehicleSearchParams) => {
    if (!vehicles || vehicles.length === 0) return [];
    
    return vehicles.filter(vehicle => {
      // Make filter
      if (params.make && params.make !== 'All' && vehicle.make?.toLowerCase() !== params.make.toLowerCase()) {
        return false;
      }
      
      // Model filter
      if (params.model && params.model !== 'All' && vehicle.model?.toLowerCase() !== params.model.toLowerCase()) {
        return false;
      }
      
      // Year range filter
      if (params.yearFrom && vehicle.year < params.yearFrom) {
        return false;
      }
      if (params.yearTo && vehicle.year > params.yearTo) {
        return false;
      }
      
      // Price range filter
      if (params.priceFrom && vehicle.estimatedRetailValue && vehicle.estimatedRetailValue < params.priceFrom) {
        return false;
      }
      if (params.priceTo && vehicle.estimatedRetailValue && vehicle.estimatedRetailValue > params.priceTo) {
        return false;
      }
      
      // Mileage filter
      if (params.mileageFrom && vehicle.odometer && vehicle.odometer < params.mileageFrom) {
        return false;
      }
      if (params.mileageTo && vehicle.odometer && vehicle.odometer > params.mileageTo) {
        return false;
      }
      
      // Condition filter
      if (params.condition && params.condition !== 'All' && vehicle.condition?.toLowerCase() !== params.condition.toLowerCase()) {
        return false;
      }
      
      // Damage type filter
      if (params.damageType && params.damageType !== 'All' && vehicle.primaryDamage?.toLowerCase() !== params.damageType.toLowerCase()) {
        return false;
      }
      
      // Type filter
      if (params.type && params.type !== 'All' && vehicle.type?.toLowerCase() !== params.type.toLowerCase()) {
        return false;
      }
      
      // Location filter
      if (params.location && params.location !== 'All') {
        // This would need location data to be loaded and matched
        // For now, we'll skip location filtering or implement it based on available data
      }
      
      // Text search filter
      if (params.searchQuery) {
        const searchTerm = params.searchQuery.toLowerCase();
        const searchableFields = [
          vehicle.make,
          vehicle.model,
          vehicle.vin,
          vehicle.color,
          vehicle.bodyStyle,
          vehicle.fuelType,
          vehicle.transmission
        ].filter(Boolean).map(field => field?.toLowerCase() || '');
        
        const matchesSearch = searchableFields.some(field => field.includes(searchTerm));
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Enhanced search with debouncing
  const debouncedSearch = React.useCallback(
    debounce(() => {
      if (filters) {
        handleSearch();
      }
    }, 500),
    [filters]
  );

  // Debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Auto-search when filters change with debouncing
  useEffect(() => {
    if (filters) {
      debouncedSearch();
    }
  }, [searchParams, filters, debouncedSearch]);

  // Load all vehicles on component mount
  useEffect(() => {
    if (isAuthenticated && (user?.user?.roles?.includes('Member') || user?.user?.roles?.includes('Seller'))) {
      handleSearch();
    }
  }, [isAuthenticated, user]);

  // Reload watchlist when component becomes visible (handles page refresh)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadWatchlist();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleInputChange = (field: keyof VehicleSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Enhanced search input handler with better logic
  const handleSearchInputChange = (value: string) => {
    if (value.match(/^[A-Z0-9]{17}$/)) {
      // VIN pattern (17 alphanumeric characters)
      handleInputChange('vin', value);
      handleInputChange('lotNumber', undefined);
      handleInputChange('make', undefined);
      handleInputChange('model', undefined);
    } else if (value.match(/^LOT-/i)) {
      // Lot number pattern
      handleInputChange('lotNumber', value);
      handleInputChange('vin', undefined);
      handleInputChange('make', undefined);
      handleInputChange('model', undefined);
    } else if (value.length > 0) {
      // General search - try to match make first, then model
      const words = value.split(' ');
      if (words.length === 1) {
        // Single word - likely a make
        handleInputChange('make', value);
        handleInputChange('model', undefined);
        handleInputChange('vin', undefined);
        handleInputChange('lotNumber', undefined);
      } else {
        // Multiple words - first word is make, rest is model
        handleInputChange('make', words[0]);
        handleInputChange('model', words.slice(1).join(' '));
        handleInputChange('vin', undefined);
        handleInputChange('lotNumber', undefined);
      }
    } else {
      // Clear all search fields
      handleInputChange('make', undefined);
      handleInputChange('model', undefined);
      handleInputChange('vin', undefined);
      handleInputChange('lotNumber', undefined);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      pageSize: 12
    });
  };

  const clearWatchlist = () => {
    try {
      setWatchlist(new Set<string>());
      localStorage.removeItem('watchlist');
      localStorage.removeItem('vehicleWatchlist');
      localStorage.removeItem('vehicleWatchlistData');
      showAlert('Watchlist cleared successfully', 'success');
      console.log('Watchlist cleared');
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      showAlert('Error clearing watchlist. Please try again.', 'error');
    }
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };


  const VehicleCard: React.FC<{ vehicle: CarData; viewMode: 'grid' | 'list' }> = ({ vehicle, viewMode }) => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex">
            <div className="relative w-48 h-32 flex-shrink-0">
              <CarPhotos 
                carId={vehicle.id} 
                showMultiple={false}
                className="w-full h-full"
              />
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Available
                </span>
              </div>
              {/* VIN */}
              <div className="absolute top-2 right-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                  {vehicle.vin ? vehicle.vin.substring(0, 8) + '...' : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {vehicle.odometer && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        {vehicle.odometer.toLocaleString()} {vehicle.odometerUnit || 'km'}
                      </span>
                    )}
                    {vehicle.primaryDamage && vehicle.primaryDamage !== 'None' && (
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {vehicle.primaryDamage}
                      </span>
                    )}
                    {vehicle.locationName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {vehicle.locationName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {vehicle.estimatedRetailValue ? formatPrice(vehicle.estimatedRetailValue) : 'Contact for Price'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vehicle.color || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {vehicle.condition && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.condition === 'Used' ? 'bg-blue-100 text-blue-700' : 
                      vehicle.condition === 'Salvage' ? 'bg-red-100 text-red-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {vehicle.condition}
                    </span>
                  )}
                  {vehicle.type && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {vehicle.type}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newWatchlist = new Set(watchlist);
                      if (watchlist.has(vehicle.id)) {
                        // Remove from watchlist
                        newWatchlist.delete(vehicle.id);
                        setWatchlist(newWatchlist);
                        
                        // Remove from localStorage IDs
                        localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
                        
                        // Remove from localStorage detailed data
                        const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
                        if (savedWatchlistData) {
                          const watchlistData: any[] = JSON.parse(savedWatchlistData);
                          const filteredData = watchlistData.filter(item => item.id !== vehicle.id);
                          localStorage.setItem('vehicleWatchlistData', JSON.stringify(filteredData));
                        }
                        
                        // Also remove from vehicleWatchlist (for compatibility)
                        const savedVehicleWatchlist = localStorage.getItem('vehicleWatchlist');
                        if (savedVehicleWatchlist) {
                          const vehicleWatchlistArray: string[] = JSON.parse(savedVehicleWatchlist);
                          const filteredIds = vehicleWatchlistArray.filter(id => id !== vehicle.id);
                          localStorage.setItem('vehicleWatchlist', JSON.stringify(filteredIds));
                        }
                      } else {
                        // Add to watchlist
                        newWatchlist.add(vehicle.id);
                        setWatchlist(newWatchlist);
                        
                        // Save IDs to localStorage
                        localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
                        
                        // Save detailed vehicle data to localStorage
                        const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
                        const watchlistData: any[] = savedWatchlistData ? JSON.parse(savedWatchlistData) : [];
                        
                        const detailedVehicleData = {
                          id: vehicle.id,
                          auctionCarId: vehicle.id,
                          carId: vehicle.id,
                          auctionId: 'unknown',
                          lotNumber: `LOT-${vehicle.id.slice(-4)}`,
                          year: vehicle.year || 2020,
                          make: vehicle.make || 'Unknown',
                          model: vehicle.model || 'Unknown',
                          image: vehicle.photoUrls?.[0] || '/placeholder-car.jpg',
                          odometer: vehicle.odometer || 0,
                          damage: vehicle.primaryDamage || 'None',
                          estimatedRetailValue: vehicle.estimatedRetailValue || 0,
                          currentBid: vehicle.estimatedRetailValue || 0,
                          bidCount: 0,
                          reservePrice: vehicle.estimatedRetailValue || 0,
                          isReserveMet: false,
                          auctionStartTime: new Date().toISOString(),
                          auctionEndTime: new Date().toISOString(),
                          isLive: false,
                          location: {
                            city: vehicle.locationCity || 'Unknown',
                            region: 'North America',
                            address: vehicle.locationAddress || 'Unknown',
                            phone: '+1-555-0123',
                            email: 'auction@example.com',
                            username: 'AuctionHouse',
                            auctionJoinDate: new Date().toISOString()
                          },
                          condition: {
                            titleType: vehicle.condition === 'Salvage' ? 'Salvage' : 'Clean',
                            keysStatus: 'Available' as const
                          },
                          addedToWatchlistAt: new Date().toISOString()
                        };
                        
                        // Check if vehicle already exists in detailed data
                        const existingIndex = watchlistData.findIndex(item => item.id === vehicle.id);
                        if (existingIndex === -1) {
                          watchlistData.push(detailedVehicleData);
                          localStorage.setItem('vehicleWatchlistData', JSON.stringify(watchlistData));
                        }
                        
                        // Also save to vehicleWatchlist (for compatibility)
                        const savedVehicleWatchlist = localStorage.getItem('vehicleWatchlist');
                        const vehicleWatchlistArray: string[] = savedVehicleWatchlist ? JSON.parse(savedVehicleWatchlist) : [];
                        if (!vehicleWatchlistArray.includes(vehicle.id)) {
                          vehicleWatchlistArray.push(vehicle.id);
                          localStorage.setItem('vehicleWatchlist', JSON.stringify(vehicleWatchlistArray));
                        }
                      }
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium ${
                      watchlist.has(vehicle.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {watchlist.has(vehicle.id) ? (
                      <>
                        <Heart className="h-3 w-3 fill-current" />
                        Watched
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Watch
                      </>
                    )}
                  </button>
                  <Link 
                    to={`/car/${vehicle.id}`}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
                  >
                    <Eye className="h-3 w-3" />
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <CarPhotos 
            carId={vehicle.id} 
            showMultiple={false}
            className="w-full h-full"
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Available
            </span>
          </div>
          {/* VIN */}
          <div className="absolute top-3 right-3">
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
              {vehicle.vin ? vehicle.vin.substring(0, 8) + '...' : 'N/A'}
            </span>
          </div>
          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
              {vehicle.estimatedRetailValue ? formatPrice(vehicle.estimatedRetailValue) : 'Contact'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="space-y-2 mb-4">
            {vehicle.odometer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Gauge className="h-4 w-4" />
                <span>{vehicle.odometer.toLocaleString()} {vehicle.odometerUnit || 'km'}</span>
              </div>
            )}
            {vehicle.primaryDamage && vehicle.primaryDamage !== 'None' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Car className="h-4 w-4" />
                <span>{vehicle.primaryDamage}</span>
              </div>
            )}
            {vehicle.locationName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{vehicle.locationName}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {vehicle.condition && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.condition === 'Used' ? 'bg-blue-100 text-blue-700' : 
                  vehicle.condition === 'Salvage' ? 'bg-red-100 text-red-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {vehicle.condition}
                </span>
              )}
              {vehicle.type && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  {vehicle.type}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {vehicle.color || 'N/A'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newWatchlist = new Set(watchlist);
                if (watchlist.has(vehicle.id)) {
                  // Remove from watchlist
                  newWatchlist.delete(vehicle.id);
                  setWatchlist(newWatchlist);
                  
                  // Remove from localStorage IDs
                  localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
                  
                  // Remove from localStorage detailed data
                  const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
                  if (savedWatchlistData) {
                    const watchlistData: any[] = JSON.parse(savedWatchlistData);
                    const filteredData = watchlistData.filter(item => item.id !== vehicle.id);
                    localStorage.setItem('vehicleWatchlistData', JSON.stringify(filteredData));
                  }
                  
                  // Also remove from vehicleWatchlist (for compatibility)
                  const savedVehicleWatchlist = localStorage.getItem('vehicleWatchlist');
                  if (savedVehicleWatchlist) {
                    const vehicleWatchlistArray: string[] = JSON.parse(savedVehicleWatchlist);
                    const filteredIds = vehicleWatchlistArray.filter(id => id !== vehicle.id);
                    localStorage.setItem('vehicleWatchlist', JSON.stringify(filteredIds));
                  }
                } else {
                  // Add to watchlist
                  newWatchlist.add(vehicle.id);
                  setWatchlist(newWatchlist);
                  
                  // Save IDs to localStorage
                  localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
                  
                  // Save detailed vehicle data to localStorage
                  const savedWatchlistData = localStorage.getItem('vehicleWatchlistData');
                  const watchlistData: any[] = savedWatchlistData ? JSON.parse(savedWatchlistData) : [];
                  
                  const detailedVehicleData = {
                    id: vehicle.id,
                    auctionCarId: vehicle.id,
                    carId: vehicle.id,
                    auctionId: 'unknown',
                    lotNumber: `LOT-${vehicle.id.slice(-4)}`,
                    year: vehicle.year || 2020,
                    make: vehicle.make || 'Unknown',
                    model: vehicle.model || 'Unknown',
                    image: vehicle.photoUrls?.[0] || '/placeholder-car.jpg',
                    odometer: vehicle.odometer || 0,
                    damage: vehicle.primaryDamage || 'None',
                    estimatedRetailValue: vehicle.estimatedRetailValue || 0,
                    currentBid: vehicle.estimatedRetailValue || 0,
                    bidCount: 0,
                    reservePrice: vehicle.estimatedRetailValue || 0,
                    isReserveMet: false,
                    auctionStartTime: new Date().toISOString(),
                    auctionEndTime: new Date().toISOString(),
                    isLive: false,
                    location: {
                      city: vehicle.locationCity || 'Unknown',
                      region: 'North America',
                      address: vehicle.locationAddress || 'Unknown',
                      phone: '+1-555-0123',
                      email: 'auction@example.com',
                      username: 'AuctionHouse',
                      auctionJoinDate: new Date().toISOString()
                    },
                    condition: {
                      titleType: vehicle.condition === 'Salvage' ? 'Salvage' : 'Clean',
                      keysStatus: 'Available' as const
                    },
                    addedToWatchlistAt: new Date().toISOString()
                  };
                  
                  // Check if vehicle already exists in detailed data
                  const existingIndex = watchlistData.findIndex(item => item.id === vehicle.id);
                  if (existingIndex === -1) {
                    watchlistData.push(detailedVehicleData);
                    localStorage.setItem('vehicleWatchlistData', JSON.stringify(watchlistData));
                  }
                  
                  // Also save to vehicleWatchlist (for compatibility)
                  const savedVehicleWatchlist = localStorage.getItem('vehicleWatchlist');
                  const vehicleWatchlistArray: string[] = savedVehicleWatchlist ? JSON.parse(savedVehicleWatchlist) : [];
                  if (!vehicleWatchlistArray.includes(vehicle.id)) {
                    vehicleWatchlistArray.push(vehicle.id);
                    localStorage.setItem('vehicleWatchlist', JSON.stringify(vehicleWatchlistArray));
                  }
                }
              }}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium ${
                watchlist.has(vehicle.id)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {watchlist.has(vehicle.id) ? (
                <>
                  <Heart className="h-3 w-3 fill-current" />
                  Watched
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Watch
                </>
              )}
            </button>
            <Link 
              to={`/car/${vehicle.id}`}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium"
            >
              <Eye className="h-3 w-3" />
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Alert */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80 max-w-md transform transition-all duration-300 ${
            alert.type === 'success' 
              ? 'bg-green-500 text-white border-l-4 border-green-400' 
              : 'bg-red-500 text-white border-l-4 border-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              alert.type === 'success' ? 'bg-green-200' : 'bg-red-200'
            }`}></div>
            <span className="font-medium">{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-auto text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Finder</h1>
          <p className="text-gray-600 mb-6">Search and filter vehicles from our auction inventory</p>
          
          {/* Quick Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by make, model, VIN, or lot number..."
                value={searchParams.make || searchParams.model || searchParams.vin || searchParams.lotNumber || ''}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-lg"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
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
                {watchlist.size > 0 && (
                  <div className="ml-auto flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg">
                    <Heart className="h-4 w-4 text-green-400 fill-current" />
                    <span className="text-green-400 text-sm font-medium">{watchlist.size}</span>
                  </div>
                )}
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

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 font-medium"
                >
                  Clear All Filters
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
                  {watchlist.size > 0 && (
                    <p className="text-green-400 text-sm font-medium">
                      {watchlist.size} vehicle{watchlist.size !== 1 ? 's' : ''} in watchlist
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadWatchlist}
                    className="p-2 rounded-lg transition-all duration-300 bg-white/20 text-white hover:bg-white/30"
                    title="Refresh Watchlist"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  {watchlist.size > 0 && (
                    <button
                      onClick={clearWatchlist}
                      className="p-2 rounded-lg transition-all duration-300 bg-red-500/20 text-white hover:bg-red-500/30"
                      title="Clear Watchlist"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
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
                    <>
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
                      
                      {/* Pagination */}
                      {searchResults.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                          <button
                            onClick={() => handleInputChange('page', Math.max(1, searchResults.page - 1))}
                            disabled={searchResults.page <= 1}
                            className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleInputChange('page', pageNum)}
                                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                                    searchResults.page === pageNum
                                      ? 'bg-white text-blue-600'
                                      : 'bg-white/20 hover:bg-white/30 text-white'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => handleInputChange('page', Math.min(searchResults.totalPages, searchResults.page + 1))}
                            disabled={searchResults.page >= searchResults.totalPages}
                            className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
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
