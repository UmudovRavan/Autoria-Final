export interface AuctionGetDto {
  id: string;
  name: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: string;
  startPrice?: number;
  isLive: boolean;
  currentCarLotNumber?: string;
  totalCarsCount: number;
  carsWithPreBidsCount: number;
  locationId: string;
  locationName?: string;
}

export interface AuctionDetailDto {
  id: string;
  name: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: string;
  minBidIncrement: number;
  startPrice?: number;
  timerSeconds: number;
  currentCarLotNumber?: string;
  isLive: boolean;
  extendedCount: number;
  maxCarDurationMinutes: number;
  currentCarStartTime?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt?: string;
  totalCarsCount: number;
  carsWithPreBidsCount: number;
  soldCarsCount: number;
  unsoldCarsCount: number;
  totalSalesAmount: number;
  auctionCars?: AuctionCarGetDto[];
}

export interface AuctionCarGetDto {
  id: string;
  auctionId: string;
  carId: string;
  lotNumber: string;
  currentPrice: number;
  minPreBid: number;
  winnerStatus?: string;
  isActive: boolean;
  bidCount: number;
  lastBidTime?: string;
  isReserveMet: boolean;
  reservePrice?: number;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carImage?: string;
}

export interface AuctionCarDetailDto {
  id: string;
  auctionId: string;
  carId: string;
  lotNumber: string;
  itemNumber?: number;
  reservePrice?: number;
  hammerPrice?: number;
  currentPrice: number;
  isReserveMet: boolean;
  minPreBid: number;
  winnerStatus?: string;
  soldPrice?: number;
  lastBidTime?: string;
  bidCount: number;
  isActive: boolean;
  activeStartTime?: string;
  createdAt: string;
  updatedAt?: string;
  totalBidsCount: number;
  preBidsCount: number;
  highestPreBidAmount: number;
  highestBidAmount: number;
  remainingTimeSeconds: number;
  isTimeExpired: boolean;
  bids?: BidGetDto[];
  auctionWinner?: any;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carVin?: string;
}

export interface BidGetDto {
  id: string;
  auctionCarId: string;
  userId: string;
  amount: number;
  isPreBid: boolean;
  placedAtUtc: string;
  status: string;
  bidType: string;
  isProxy: boolean;
  proxyMax?: number;
  isAutoBid: boolean;
  userName?: string;
  userDisplayName?: string;
  auctionCarLotNumber?: string;
  isWinning: boolean;
  isHighest: boolean;
  isActive: boolean;
  isExpired: boolean;
  rank: number;
  distanceFromLeader: number;
  timeAgo?: string;
  localTime: string;
  remainingProxyAmount?: number;
  canAutoIncrease: boolean;
  validUntil?: string;
  statusColor?: string;
  statusIcon?: string;
  isHighlighted: boolean;
}

export interface BidDetailDto {
  id: string;
  auctionCarId: string;
  userId: string;
  amount: number;
  isPreBid: boolean;
  isProxy: boolean;
  proxyMax?: number;
  status: string;
  placedAtUtc: string;
  bidType: string;
  notes?: string;
  validUntil?: string;
  processedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  sequenceNumber: number;
  isAutoBid: boolean;
  parentBidId?: string;
  createdAt: string;
  updatedAt?: string;
  isWinningBid: boolean;
  isHighestBid: boolean;
  isUserHighestBid: boolean;
  bidRankOverall: number;
  bidRankByUser: number;
  nextMinimumBid: number;
  distanceFromWinning: number;
  distanceFromHighest: number;
  timeToExpiry: string;
  isExpired: boolean;
  isActive: boolean;
  auctionCarLotNumber?: string;
  auctionName?: string;
  userName?: string;
  userDisplayName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carVin?: string;
  remainingProxyAmount: number;
  childBidsCount: number;
  totalProxyAmountUsed: number;
  clientInfo?: string;
  locationInfo?: string;
  isFromMobileDevice: boolean;
}

export interface UserDto {
  id: string;
  userName?: string;
  email?: string;
  emailConfirmed: boolean;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  allowMarketing: boolean;
}

export interface AuthResponseDto {
  isSuccess: boolean;
  message?: string;
  token?: string;
  expiresAt: string;
  user?: UserDto;
  loginInfo?: any;
  refreshToken?: string;
  errors?: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  acceptTerms: boolean;
  phone?: string;
  dateOfBirth?: string;
  allowMarketing?: boolean;
}

export interface PlacePreBidRequest {
  auctionCarId: string;
  amount: number;
  notes?: string;
}

export interface PlaceLiveBidRequest {
  auctionCarId: string;
  amount: number;
}

export interface PlaceProxyBidRequest {
  auctionCarId: string;
  startAmount: number;
  maxAmount: number;
  notes?: string;
  isPreBid: boolean;
}

export interface AuctionTimerInfo {
  auctionId: string;
  currentCarLotNumber?: string;
  lastBidTime?: string;
  timerSeconds: number;
  remainingSeconds: number;
  isExpired: boolean;
  carStartTime?: string;
}

export interface BidValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  minimumBidAmount: number;
  currentHighestBid: number;
  suggestedBidAmount: number;
  requiresPreBid: boolean;
  auctionActive: boolean;
}

// Vehicle Finder interfaces
export interface VehicleSearchParams {
  condition?: string;
  type?: string;
  minOdometer?: number;
  maxOdometer?: number;
  minYear?: number;
  maxYear?: number;
  damageType?: string;
  make?: string;
  model?: string;
  location?: string;
  vin?: string;
  lotNumber?: string;
  page?: number;
  pageSize?: number;
}

export interface VehicleSearchResult {
  vehicles: VehicleSearchItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VehicleSearchItem {
  id: string;
  auctionId: string;
  carId: string;
  lotNumber: string;
  currentPrice: number;
  minPreBid: number;
  winnerStatus?: string;
  isActive: boolean;
  bidCount: number;
  lastBidTime?: string;
  isReserveMet: boolean;
  reservePrice?: number;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carImage?: string;
  carVin?: string;
  carOdometer?: number;
  carCondition?: string;
  carType?: string;
  carDamageType?: string;
  carLocation?: string;
  auctionName?: string;
  auctionStartTime?: string;
  auctionEndTime?: string;
}

export interface VehicleFilters {
  conditions: string[];
  types: string[];
  damageTypes: string[];
  makes: string[];
  locations: string[];
  yearRange: {
    min: number;
    max: number;
  };
  odometerRange: {
    min: number;
    max: number;
  };
}