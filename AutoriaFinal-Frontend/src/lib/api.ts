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
  BidValidationResult
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
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
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
}

export const apiClient = new ApiClient(API_BASE_URL);