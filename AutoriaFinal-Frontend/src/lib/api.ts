import { 
  AuctionGetDto, 
  AuctionDetailDto, 
  AuctionCarGetDto, 
  AuctionCarDetailDto, 
  BidGetDto, 
  BidDetailDto,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  PlacePreBidRequest,
  PlaceLiveBidRequest,
  PlaceProxyBidRequest,
  AuctionTimerInfo,
  BidValidationResult,
  VehicleSearchParams,
  VehicleSearchResult,
  VehicleSearchItem,
  VehicleFilters
} from '../types/api';

const API_BASE_URL = 'https://localhost:7249/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    console.log('API Client - Sending register data:', userData);
    const response = await this.request<AuthResponseDto>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('API Client - Received response:', response);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // New/extended Auth endpoints (from updated API)
  async logoutApi(): Promise<any> {
    try {
      const result = await this.request<any>('/Auth/logout', {
        method: 'POST',
      });
      return result;
    } finally {
      this.logout();
    }
  }

  async confirmEmail(params: { userId?: string; token?: string; redirect?: string }): Promise<void | any> {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    if (params.token) query.append('token', params.token);
    if (params.redirect) query.append('redirect', params.redirect);
    const qs = query.toString();
    return this.request<void | any>(`/Auth/confirmemail${qs ? `?${qs}` : ''}`);
  }

  async resendConfirmation(email: string): Promise<void | any> {
    return this.request<void | any>('/Auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(payload: { email: string; callbackUrl?: string; ipAddress?: string; userAgent?: string }): Promise<void | any> {
    return this.request<void | any>('/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: { email: string; token: string; password: string; confirmPassword: string }): Promise<void | any> {
    return this.request<void | any>('/Auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getProfile(): Promise<any> {
    return this.request<any>('/Auth/profile');
  }

  async updateProfile(update: any): Promise<any> {
    return this.request<any>('/Auth/profile', {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async me(): Promise<any> {
    return this.request<any>('/Auth/me');
  }

  async getRoles(): Promise<string[]> {
    return this.request<string[]>('/Auth/roles');
  }

  async authHealth(): Promise<any> {
    return this.request<any>('/Auth/health');
  }

  // Auction endpoints
  async getAuctions(): Promise<AuctionGetDto[]> {
    return this.request<AuctionGetDto[]>('/Auction');
  }

  async getLiveAuctions(): Promise<AuctionGetDto[]> {
    return this.request<AuctionGetDto[]>('/Auction/live');
  }

  async getActiveAuctions(): Promise<AuctionGetDto[]> {
    return this.request<AuctionGetDto[]>('/Auction/active');
  }

  async getReadyToStartAuctions(): Promise<AuctionGetDto[]> {
    return this.request<AuctionGetDto[]>('/Auction/ready-to-start');
  }

  async getAuction(id: string): Promise<AuctionDetailDto> {
    return this.request<AuctionDetailDto>(`/Auction/${id}`);
  }

  async getAuctionTimer(id: string): Promise<AuctionTimerInfo> {
    return this.request<AuctionTimerInfo>(`/Auction/${id}/timer`);
  }

  // AuctionCar endpoints
  async getAuctionCars(auctionId: string): Promise<AuctionCarGetDto[]> {
    return this.request<AuctionCarGetDto[]>(`/AuctionCar/auction/${auctionId}`);
  }

  async getAuctionCar(id: string): Promise<AuctionCarDetailDto> {
    return this.request<AuctionCarDetailDto>(`/AuctionCar/${id}`);
  }

  async getActiveAuctionCar(auctionId: string): Promise<AuctionCarDetailDto> {
    return this.request<AuctionCarDetailDto>(`/AuctionCar/auction/${auctionId}/active`);
  }

  async getAuctionCarByLot(lotNumber: string): Promise<AuctionCarDetailDto> {
    return this.request<AuctionCarDetailDto>(`/AuctionCar/lot/${lotNumber}`);
  }

  async getNextMinimumBid(auctionCarId: string): Promise<number> {
    return this.request<number>(`/AuctionCar/${auctionCarId}/next-min-bid`);
  }

  // Bid endpoints
  async placeLiveBid(request: PlaceLiveBidRequest): Promise<BidDetailDto> {
    return this.request<BidDetailDto>('/Bid/live', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async placePreBid(request: PlacePreBidRequest): Promise<BidDetailDto> {
    return this.request<BidDetailDto>('/Bid/prebid', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async placeProxyBid(request: PlaceProxyBidRequest): Promise<BidDetailDto> {
    return this.request<BidDetailDto>('/Bid/proxy', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getBidHistory(auctionCarId: string, pageSize: number = 50): Promise<any> {
    return this.request(`/Bid/auction-car/${auctionCarId}/history?pageSize=${pageSize}`);
  }

  async getRecentBids(auctionCarId: string, count: number = 10): Promise<BidGetDto[]> {
    return this.request<BidGetDto[]>(`/Bid/auction-car/${auctionCarId}/recent?count=${count}`);
  }

  async getHighestBid(auctionCarId: string): Promise<BidDetailDto> {
    return this.request<BidDetailDto>(`/Bid/auction-car/${auctionCarId}/highest`);
  }

  async getMyBids(): Promise<BidGetDto[]> {
    return this.request<BidGetDto[]>('/Bid/my-bids');
  }

  async validateBid(request: any): Promise<BidValidationResult> {
    return this.request<BidValidationResult>('/Bid/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async canBid(auctionCarId: string): Promise<boolean> {
    return this.request<boolean>(`/Bid/can-bid/${auctionCarId}`);
  }

  // Vehicle Finder endpoints - using real API endpoints
  async searchVehicles(searchParams: VehicleSearchParams): Promise<VehicleSearchResult> {
    const queryParams = new URLSearchParams();
    
    if (searchParams.condition) queryParams.append('condition', searchParams.condition);
    if (searchParams.type) queryParams.append('type', searchParams.type);
    if (searchParams.minOdometer) queryParams.append('minOdometer', searchParams.minOdometer.toString());
    if (searchParams.maxOdometer) queryParams.append('maxOdometer', searchParams.maxOdometer.toString());
    if (searchParams.minYear) queryParams.append('minYear', searchParams.minYear.toString());
    if (searchParams.maxYear) queryParams.append('maxYear', searchParams.maxYear.toString());
    if (searchParams.damageType) queryParams.append('damageType', searchParams.damageType);
    if (searchParams.make) queryParams.append('make', searchParams.make);
    if (searchParams.model) queryParams.append('model', searchParams.model);
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.vin) queryParams.append('vin', searchParams.vin);
    if (searchParams.lotNumber) queryParams.append('lotNumber', searchParams.lotNumber);
    if (searchParams.page) queryParams.append('page', searchParams.page.toString());
    if (searchParams.pageSize) queryParams.append('pageSize', searchParams.pageSize.toString());

    // Use the real AuctionCar endpoint with pagination
    const response = await this.request<AuctionCarGetDto[]>(`/AuctionCar?${queryParams.toString()}`);
    
    // Transform the response to match VehicleSearchResult interface
    const vehicles: VehicleSearchItem[] = response.map(car => ({
      id: car.id,
      auctionId: car.auctionId,
      carId: car.carId,
      lotNumber: car.lotNumber,
      currentPrice: car.currentPrice,
      minPreBid: car.minPreBid,
      winnerStatus: car.winnerStatus,
      isActive: car.isActive,
      bidCount: car.bidCount,
      lastBidTime: car.lastBidTime,
      isReserveMet: car.isReserveMet,
      reservePrice: car.reservePrice,
      carMake: car.carMake,
      carModel: car.carModel,
      carYear: car.carYear,
      carImage: car.carImage,
      carVin: undefined,
      carOdometer: undefined,
      carCondition: undefined,
      carType: undefined,
      carDamageType: undefined,
      carLocation: undefined,
      auctionName: undefined,
      auctionStartTime: undefined,
      auctionEndTime: undefined
    }));

    return {
      vehicles,
      totalCount: vehicles.length,
      page: searchParams.page || 1,
      pageSize: searchParams.pageSize || 12,
      totalPages: Math.ceil(vehicles.length / (searchParams.pageSize || 12))
    };
  }

  async getVehicleFilters(): Promise<VehicleFilters> {
    // Get all auction cars to extract unique values for filters
    const allCars = await this.request<AuctionCarGetDto[]>('/AuctionCar');
    
    const makes = [...new Set(allCars.map(car => car.carMake).filter(Boolean))] as string[];
    const years = allCars.map(car => car.carYear).filter(Boolean) as number[];
    
    return {
      conditions: ['All', 'Used', 'Salvage'],
      types: ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback'],
      damageTypes: ['None', 'Front End', 'Rear End', 'Side', 'All Over', 'Water/Flood'],
      makes,
      locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      yearRange: {
        min: Math.min(...years),
        max: Math.max(...years)
      },
      odometerRange: {
        min: 0,
        max: 300000
      }
    };
  }

  async getVehicleMakes(): Promise<string[]> {
    const allCars = await this.request<AuctionCarGetDto[]>('/AuctionCar');
    return [...new Set(allCars.map(car => car.carMake).filter(Boolean))] as string[];
  }

  async getVehicleModels(make: string): Promise<string[]> {
    const allCars = await this.request<AuctionCarGetDto[]>('/AuctionCar');
    return [...new Set(
      allCars
        .filter(car => car.carMake === make)
        .map(car => car.carModel)
        .filter(Boolean)
    )] as string[];
  }

  async getVehicleLocations(): Promise<string[]> {
    // Return static locations for now, can be enhanced with real data
    return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  }
}

export const apiClient = new ApiClient(API_BASE_URL);