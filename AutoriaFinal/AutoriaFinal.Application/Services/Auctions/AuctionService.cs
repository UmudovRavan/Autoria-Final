﻿using AutoMapper;
using AutoriaFinal.Application.Exceptions;
using AutoriaFinal.Contract.Dtos.Auctions.Auction;
using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
using AutoriaFinal.Contract.Services.Auctions;
using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using AutoriaFinal.Domain.Repositories;
using AutoriaFinal.Domain.Repositories.Auctions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace AutoriaFinal.Application.Services.Auctions
{
    public class AuctionService : GenericService<
        Auction, AuctionGetDto, AuctionDetailDto, AuctionCreateDto, AuctionUpdateDto>, IAuctionService
    {
       private readonly IAuctionRepository _auctionRepository;
        private readonly IAuctionCarRepository _auctionCarRepository;
        private readonly IAuctionWinnerRepository _auctionWinnerRepository;
        private readonly IBidRepository _bidRepository;
        public AuctionService(
           IAuctionRepository auctionRepository,
           IAuctionCarRepository auctionCarRepository,
           IBidRepository bidRepository,
           IAuctionWinnerRepository winnerRepository,
           IUnitOfWork unitOfWork,
           IMapper mapper,
           ILogger<AuctionService> logger)
           : base(auctionRepository, mapper, unitOfWork, logger)
        {
            _auctionRepository = auctionRepository;
            _auctionCarRepository = auctionCarRepository;
            _bidRepository = bidRepository;
            _auctionWinnerRepository = winnerRepository;
        }
        #region Override GenericService Methods
        public override async Task<AuctionDetailDto> AddAsync(AuctionCreateDto dto)
        {
            if (dto.StartTimeUtc <= DateTime.UtcNow)
                throw new BadRequestException("Auction başlama vaxtı gələcəkdə olmalıdır");

            if (dto.StartTimeUtc >= dto.EndTimeUtc)
                throw new BadRequestException("Başlama vaxtı bitmə vaxtından əvvəl olmalıdır");

            _logger.LogInformation("Creating auction: {AuctionName} scheduled for {StartTime}", dto.Name, dto.StartTimeUtc);
            var currentUserId = Guid.NewGuid();
            var auction = Auction.Create(
                 name: dto.Name,
                locationId: dto.LocationId,
                createdByUserId: currentUserId,
                startTime: dto.StartTimeUtc,
                timerSeconds: dto.TimerSeconds,
                minBidIncrement: dto.MinBidIncrement);

            auction.Schedule(dto.StartTimeUtc, dto.EndTimeUtc);
            var createdAuction = await _repository.AddAsync(auction);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("AUCTION CREATED: {AuctionId} - {Name}", createdAuction.Id, createdAuction.Name);

            return await GetDetailedByIdAsync(createdAuction.Id);
        }
        public override async Task<AuctionDetailDto> UpdateAsync(Guid id, AuctionUpdateDto dto)
        {
            var auction = await _auctionRepository.GetByIdAsync(id);
            if (auction == null)
                throw new NotFoundException("Auction", id);

            // Business rule: Yalnız Draft status-da olan auction-lar update edilə bilər
            if (auction.Status != AuctionStatus.Draft)
                throw new ConflictException("Yalnız Draft status-da olan auction-lar dəyişdirilə bilər");
            _mapper.Map(dto, auction);
            var updatedAuction = await _repository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("AUCTION UPDATED: {AuctionId}", id);
            return await GetDetailedByIdAsync(updatedAuction.Id);
        }
        #endregion
        #region Auction Main Lifecycle Methods
        public async Task<AuctionDetailDto> StartAuctionAsync(Guid auctionId)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);

            auction.Start();

            //  Cari maşını active et
            if (!string.IsNullOrEmpty(auction.CurrentCarLotNumber))
            {
                var currentCar = auction.AuctionCars
                    .FirstOrDefault(ac => ac.LotNumber == auction.CurrentCarLotNumber);

                if (currentCar != null)
                {
                    currentCar.MarkAsActive();

                    // Pre-bid ilə current price set et
                    var highestPreBid = currentCar.GetHighestPreBid();
                    if (highestPreBid != null)
                    {
                        currentCar.CurrentPrice = highestPreBid.Amount;
                    }
                }
            }

            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("AUCTION STARTED: {AuctionId} - Current Car: {LotNumber} - Start Price: {StartPrice}",
                auctionId, auction.CurrentCarLotNumber, auction.StartPrice);

            return await GetByIdAsync(auctionId);
        }
        public async Task<AuctionDetailDto> EndAuctionAsync(Guid auctionId)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            if (!string.IsNullOrEmpty(auction.CurrentCarLotNumber))
            {
                var currentCar = auction.AuctionCars
                    .FirstOrDefault(ac=>ac.LotNumber == auction.CurrentCarLotNumber);
                if (currentCar != null)
                {
                    await EndCarAuctionAsync(currentCar.Id);
                }
            }
            auction.End();
            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();

            var soldCarsCount = auction.AuctionCars.Count(ac => ac.AuctionWinner != null);
            var totalSalesAmount = auction.AuctionCars
                .Where(ac => ac.AuctionWinner != null)
                .Sum(ac => ac.AuctionWinner.Amount);
            _logger.LogInformation("AUCTION ENDED: {AuctionId} - Total Cars: {TotalCars}, Sold: {SoldCars}, Sales Amount: {Amount}",
                auctionId, auction.AuctionCars.Count, soldCarsCount, totalSalesAmount);

            return await GetDetailedByIdAsync(auctionId);
        }
        public async Task<AuctionDetailDto> CancelAuctionAsync(Guid auctionId, string reason)
        {
            if(!string.IsNullOrEmpty(reason))
                throw new BadRequestException("Ləğv etmə səbəbi mütləqdir");

            var auction = await _auctionRepository.GetByIdAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            auction.Cancel();
            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogWarning("AUCTION CANCELLED: {AuctionId} - Reason: {Reason}", auctionId, reason);

            return await GetDetailedByIdAsync(auctionId);
        }
        public async Task<AuctionDetailDto> ExtendAuctionAsync(Guid auctionId, int additionalMinutes, string reason)
        {
            if (additionalMinutes <= 0)
                throw new BadRequestException("Əlavə vaxt müsbət olmalıdır");

            if (string.IsNullOrWhiteSpace(reason))
                throw new BadRequestException("Uzatma səbəbi mütləqdir");
            var auction = await _auctionRepository.GetByIdAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            var previousEndTime = auction.EndTimeUtc;
            auction.ExtendAuction(additionalMinutes);

            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("AUCTION EXTENDED: {AuctionId} - Additional Minutes: {Minutes} - From: {PreviousEnd} To: {NewEnd}",
                auctionId, additionalMinutes, previousEndTime, auction.EndTimeUtc);

            return await GetDetailedByIdAsync(auctionId);
        }
        #endregion
        #region Car Crossing Methods
        public async Task<AuctionDetailDto> MoveToNextCarAsync(Guid auctionId)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);

            if (auction.Status != AuctionStatus.Running)
                throw new ConflictException("Yalnız işləyən auction-da maşın dəyişdirilə bilər");

            var previousLotNumber = auction.CurrentCarLotNumber;

            // Cari maşını bitir və winner təyin et
            var currentCar = auction.AuctionCars
                .FirstOrDefault(ac => ac.LotNumber == auction.CurrentCarLotNumber);

            if (currentCar != null)
            {
                // Cari maşını inactive et
                currentCar.MarkAsInactive();
                await EndCurrentCarAndAssignWinner(currentCar);
            }

            auction.MoveToNextCar();

            // Yeni cari maşını active et
            if (!string.IsNullOrEmpty(auction.CurrentCarLotNumber))
            {
                var newCurrentCar = auction.AuctionCars
                    .FirstOrDefault(ac => ac.LotNumber == auction.CurrentCarLotNumber);

                if (newCurrentCar != null)
                {
                    newCurrentCar.MarkAsActive();
                }
            }

            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();

            if (auction.Status == AuctionStatus.Ended)
            {
                _logger.LogInformation("AUCTION AUTO-COMPLETED: {AuctionId} - No more cars available", auctionId);
            }
            else
            {
                _logger.LogInformation("MOVED TO NEXT CAR: {AuctionId} - From: {PreviousLot} To: {CurrentLot} - New Start Price: {StartPrice}",
                    auctionId, previousLotNumber, auction.CurrentCarLotNumber, auction.StartPrice);
            }

            return await GetByIdAsync(auctionId);
        }
        public async Task<AuctionCarDetailDto> EndCarAuctionAsync(Guid auctionCarId)
        {
            var auctionCar = await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
            if (auctionCar == null)
                throw new NotFoundException("AuctionCar", auctionCarId);

            await EndCurrentCarAndAssignWinner(auctionCar);
            _logger.LogInformation("CAR AUCTION ENDED: {AuctionCarId} - Lot: {LotNumber}",
               auctionCarId, auctionCar.LotNumber);

            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
        }
        public async Task<AuctionDetailDto> SetCurrentCarAsync(Guid auctionId, string lotNumber)
        {
            if (string.IsNullOrWhiteSpace(lotNumber))
                throw new BadRequestException("Lot nömrəsi mütləqdir");

            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);

            if (auction.Status != AuctionStatus.Running)
                throw new ConflictException("Yalnız işləyən auction-da cari maşın təyin edilə bilər");

            var targetCar = auction.AuctionCars.FirstOrDefault(ac => ac.LotNumber == lotNumber);
            if (targetCar == null)
                throw new NotFoundException($"AuctionCar with lot number {lotNumber}", lotNumber);

            if (!targetCar.HasPreBids())
                throw new ConflictException("Yalnız pre-bid-i olan maşınlar auction-da ola bilər");

            // Manual car switch - Admin function
            var previousCar = auction.AuctionCars
                .FirstOrDefault(ac => ac.LotNumber == auction.CurrentCarLotNumber);

            if (previousCar != null)
            {
                previousCar.MarkAsInactive();
            }

            targetCar.MarkAsActive();
            var highestPreBid = targetCar.GetHighestPreBid();
            if (highestPreBid != null)
            {
                targetCar.UpdateCurrentPrice(highestPreBid.Amount);
                auction.SetStartPrice(highestPreBid.Amount);
            }

            auction.CurrentCarLotNumber = lotNumber;

            auction.CurrentCarStartTime = DateTime.UtcNow;

            await _auctionRepository.UpdateAsync(auction);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("MANUAL CAR SWITCH: {AuctionId} - To: {LotNumber} by ravanmu-coder at {SwitchTime}",
                auctionId, lotNumber, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));

            return await GetByIdAsync(auctionId);
        }

        #endregion
        #region Real-Time Status Methods
        public async Task<IEnumerable<AuctionGetDto>> GetActiveAuctionsAsync()
        {
            var activeAuctions = await _auctionRepository.GetActiveAuctionsAsync();
            return _mapper.Map<IEnumerable<AuctionGetDto>>(activeAuctions);
        }
        public async Task<IEnumerable<AuctionGetDto>> GetLiveAuctionsAsync()
        {
            var liveAuctions = await _auctionRepository.GetLiveAuctionsAsync();
            return _mapper.Map<IEnumerable<AuctionGetDto>>(liveAuctions);
        }
        public async Task<IEnumerable<AuctionGetDto>> GetAuctionsReadyToStartAsync()
        {
            var readyAuctions = await _auctionRepository.GetScheduledAuctionsReadyToStartAsync();
            return _mapper.Map<IEnumerable<AuctionGetDto>>(readyAuctions);
        }
        public async Task<AuctionDetailDto> GetAuctionCurrentStateAsync(Guid auctionId)
        {
            return await GetByIdAsync(auctionId);
        }
        #endregion
        #region Timer and Scheduling Methods
        public async Task<AuctionTimerInfo> GetAuctionTimerInfoAsync(Guid auctionId)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            if (string.IsNullOrEmpty(auction.CurrentCarLotNumber) || auction.Status != AuctionStatus.Running)
            {
                return new AuctionTimerInfo
                {
                    AuctionId = auctionId,
                    IsExpired = true,
                    RemainingSeconds = 0,
                    TimerSeconds = auction.TimerSeconds,
                    CurrentCarLotNumber = auction.CurrentCarLotNumber,
                    CarStartTime = auction.CurrentCarStartTime
                };
            }
            var currentCar = auction.AuctionCars
                .First(ac => ac.LotNumber == auction.CurrentCarLotNumber);
            var isTimeExpired = currentCar.IsTimeExpired(auction.TimerSeconds);
            var referenceTime = currentCar.LastBidTime ?? currentCar.ActiveStartTime ?? DateTime.UtcNow;
            var timeSinceReference = DateTime.UtcNow - referenceTime;
            var remainingSeconds = Math.Max(0, auction.TimerSeconds - (int)timeSinceReference.TotalSeconds);
            return new AuctionTimerInfo
            {
                AuctionId = auctionId,
                CurrentCarLotNumber = auction.CurrentCarLotNumber,
                LastBidTime = currentCar.LastBidTime,
                TimerSeconds = auction.TimerSeconds,
                RemainingSeconds = remainingSeconds,
                IsExpired = isTimeExpired,
                CarStartTime = currentCar.ActiveStartTime
            };
        }

        public async Task ResetAuctionTimerAsync(Guid auctionId)
        {
            var auction =  await _auctionRepository.GetByIdAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            if (auction.Status != AuctionStatus.Running)
                throw new ConflictException("Yalnız işləyən auction-ın timer-ı reset edilə bilər");

            _logger.LogDebug("TIMER RESET REQUESTED: {AuctionId} - Timer: {TimerSeconds}s at {ResetTime}",
                auctionId, auction.TimerSeconds, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
            // Timer reset controller layer-də SignalR ilə handle ediləcək
        }
        public async Task<IEnumerable<AuctionGetDto>> GetExpiredAuctionsAsync()
        {
            var runningAuctions = await _auctionRepository.GetAuctionsByStatusAsync(AuctionStatus.Running);
            var currentTime = DateTime.UtcNow;
            var expiredAuctions = new List<Auction>();
            foreach (var auction in runningAuctions)
            {
                if (auction.EndTimeUtc <= currentTime)
                {
                    expiredAuctions.Add(auction);
                    continue;
                }
                if (!string.IsNullOrEmpty(auction.CurrentCarLotNumber))
                {
                    var currentCar = auction.AuctionCars
                        .FirstOrDefault(ac => ac.LotNumber == auction.CurrentCarLotNumber);
                    if (currentCar != null && currentCar.IsTimeExpired(auction.TimerSeconds))
                    {
                        expiredAuctions.Add(auction);
                    }
                }
            }

            if (expiredAuctions.Any())
            {
                _logger.LogInformation("EXPIRED AUCTIONS DETECTED: {Count} auctions at {CheckTime}",
                    expiredAuctions.Count, currentTime.ToString("yyyy-MM-dd HH:mm:ss"));
            }

            return _mapper.Map<IEnumerable<AuctionGetDto>>(expiredAuctions);
        }

        #endregion
        #region Statistics and Information Methods
        public async Task<AuctionStatisticsDto> GetAuctionStatisticsAsync(Guid auctionId)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(auctionId);
            if (auction == null)
                throw new NotFoundException("Auction", auctionId);
            var allBids = auction.AuctionCars.SelectMany(ac => ac.Bids).ToList();
            var soldCars = auction.AuctionCars.Where(ac => ac.WinnerStatus == AuctionWinnerStatus.Won ||
                                                        ac.WinnerStatus == AuctionWinnerStatus.Confirmed ||
                                                        ac.WinnerStatus == AuctionWinnerStatus.Completed).ToList();
            var statistics = new AuctionStatisticsDto
            {
                AuctionId = auctionId,
                AuctionName = auction.Name,
                TotalCars = auction.AuctionCars.Count,
                SoldCars = soldCars.Count,
                UnsoldCars = auction.AuctionCars.Count(ac => ac.WinnerStatus == AuctionWinnerStatus.Unsold),
                TotalBids = allBids.Count,
                UniqueBidders = allBids.Select(b => b.UserId).Distinct().Count()
            };
            if (soldCars.Any())
            {
                var saleAmounts = soldCars.Where(ac => ac.SoldPrice.HasValue)
                                         .Select(ac => ac.SoldPrice.Value).ToList();
                if (saleAmounts.Any())
                {
                    statistics.TotalSalesAmount = saleAmounts.Sum();
                    statistics.AverageSalePrice = saleAmounts.Average();
                }
            }

            var chronologicalBids = allBids.OrderBy(b => b.PlacedAtUtc).ToList();
            

            return statistics;
        }
        public async Task<IEnumerable<AuctionGetDto>> GetAuctionsByLocationAsync(Guid locationId)
        {
            var auctions = await _auctionRepository.GetAuctionsByLocationAsync(locationId);
            return _mapper.Map<IEnumerable<AuctionGetDto>>(auctions);
        }
        #endregion
        #region AuctionCar Management Methods
        public async Task<AuctionCarDetailDto> AddCarToAuctionAsync(AuctionCarCreateDto dto)
        {
            throw new NotImplementedException("Bu metod AuctionCarService-də implement ediləcək");
        }

        public async Task<bool> RemoveCarFromAuctionAsync(Guid auctionCarId)
        {
            throw new NotImplementedException("Bu metod AuctionCarService-də implement ediləcək");
        }

        public async Task<IEnumerable<AuctionCarGetDto>> GetCarsReadyForAuctionAsync(Guid auctionId)
        {
            throw new NotImplementedException("Bu metod AuctionCarService-də implement ediləcək");
        }

        #endregion

        #region Custom Private Methods
        private async Task<AuctionDetailDto> GetDetailedByIdAsync(Guid id)
        {
            var auction = await _auctionRepository.GetAuctionWithCarsAsync(id);
            if (auction == null)
                throw new NotFoundException("Auction", id);

            var dto = _mapper.Map<AuctionDetailDto>(auction);

            dto.TotalCarsCount = auction.AuctionCars.Count;
            dto.CarsWithPreBidsCount = auction.AuctionCars.Count(ac => ac.Bids.Any(b => b.IsPreBid));
            dto.SoldCarsCount = auction.AuctionCars.Count(ac => ac.AuctionWinner != null);
            dto.UnsoldCarsCount = dto.TotalCarsCount - dto.SoldCarsCount;
            dto.TotalSalesAmount = auction.AuctionCars
                .Where(ac => ac.AuctionWinner != null)
                .Sum(ac => ac.AuctionWinner.Amount);

            return dto;
        }

        private async Task EndCurrentCarAndAssignWinner(AuctionCar auctionCar)
        {
            var highestBid = auctionCar.Bids
                .Where(b => !b.IsPreBid && b.Status == BidStatus.Placed)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAtUtc)
                .FirstOrDefault();
            if (highestBid != null && auctionCar.AuctionWinner == null)
            {
                var winner = AuctionWinner.Create(
                    auctionCar.Id,
                    highestBid.UserId,
                    highestBid.Id,
                    highestBid.Amount
                    );
                await _auctionWinnerRepository.AddAsync(winner);
                auctionCar.MarkWon(highestBid.Amount);
                _logger.LogInformation("CAR SOLD: {LotNumber} - Winner: {UserId} - Amount: ${Amount} at {SoldTime}",
                   auctionCar.LotNumber, highestBid.UserId, highestBid.Amount, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
            }
            else
            {
                auctionCar.MarkUnsold();

                _logger.LogInformation("CAR UNSOLD: {LotNumber} - No valid bids at {UnsoldTime}",
                    auctionCar.LotNumber, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
            }
            await _auctionCarRepository.UpdateAsync(auctionCar);
            await _unitOfWork.SaveChangesAsync();
        }
        #endregion
    }
}
