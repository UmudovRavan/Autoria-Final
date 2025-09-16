using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using AutoriaFinal.Domain.Enums.FinanceEnums;
using AutoriaFinal.Domain.Repositories.Auctions;
using AutoriaFinal.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Repositories.Auctions
{
    public class AuctionWinnerRepository : GenericRepository<AuctionWinner>, IAuctionWinnerRepository
    {
        public AuctionWinnerRepository(AppDbContext context) : base(context) { }

        // ========== ƏSAS SORĞULAR ==========

        public async Task<AuctionWinner?> GetByAuctionCarIdAsync(Guid auctionCarId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .FirstOrDefaultAsync(aw => aw.AuctionCarId == auctionCarId);
        }

        public async Task<IEnumerable<AuctionWinner>> GetByUserIdAsync(Guid userId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Auction)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.UserId == userId)
                .OrderByDescending(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetUnpaidWinnersAsync(Guid userId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.UserId == userId &&
                            (aw.PaymentStatus == PaymentStatus.Pending ||
                             aw.PaymentStatus == PaymentStatus.PartiallyPaid))
                .OrderBy(aw => aw.PaymentDueDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetWinnersByAuctionAsync(Guid auctionId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.AuctionCar.AuctionId == auctionId)
                .OrderBy(aw => aw.AuctionCar.LotNumber)
                .ToListAsync();
        }

        // ========== PAYMENT TRACKİNG ==========

        public async Task<IEnumerable<AuctionWinner>> GetWinnersByPaymentStatusAsync(PaymentStatus paymentStatus)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.PaymentStatus == paymentStatus)
                .OrderByDescending(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetOverduePaymentsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.PaymentStatus == PaymentStatus.Pending &&
                            aw.PaymentDueDate.HasValue &&
                            aw.PaymentDueDate.Value < now)
                .OrderBy(aw => aw.PaymentDueDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetPaidWinnersInPeriodAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.PaymentStatus == PaymentStatus.Paid &&
                            aw.UpdatedAtUtc >= fromDate &&
                            aw.UpdatedAtUtc <= toDate)
                .OrderByDescending(aw => aw.UpdatedAtUtc)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetPartiallyPaidWinnersAsync()
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.PaymentStatus == PaymentStatus.PartiallyPaid)
                .OrderByDescending(aw => aw.UpdatedAtUtc)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetFailedPaymentWinnersAsync()
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.PaymentStatus == PaymentStatus.Failed)
                .OrderByDescending(aw => aw.UpdatedAtUtc)
                .ToListAsync();
        }

        // ========== SELLER PERSPEKTİVİ ==========

        public async Task<IEnumerable<AuctionWinner>> GetSellerSalesAsync(Guid sellerId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.AuctionCar.Car.Id == sellerId) // Seller Car.OwnerId kimi təyin edilib
                .OrderByDescending(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetPendingConfirmationsBySeller(Guid sellerId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.AuctionCar.Car.Id == sellerId &&
                            aw.WinnerConfirmedAt == null)
                .OrderBy(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetRejectedWinnersBySeller(Guid sellerId)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.AuctionCar.Car.Id == sellerId &&
                            aw.PaymentStatus == PaymentStatus.Cancelled)
                .OrderByDescending(aw => aw.UpdatedAtUtc)
                .ToListAsync();
        }

        // ========== STATİSTİKA VƏ ANALİZ ==========

        public async Task<decimal> GetUserSuccessRateAsync(Guid userId)
        {
            var totalWins = await _context.AuctionWinners
                .CountAsync(aw => aw.UserId == userId);

            if (totalWins == 0) return 0;

            var successfulWins = await _context.AuctionWinners
                .CountAsync(aw => aw.UserId == userId &&
                                 aw.PaymentStatus == PaymentStatus.Paid);

            return (decimal)successfulWins / totalWins * 100;
        }

        public async Task<TimeSpan> GetUserAveragePaymentTimeAsync(Guid userId)
        {
            var paidWinners = await _context.AuctionWinners
                .Where(aw => aw.UserId == userId &&
                            aw.PaymentStatus == PaymentStatus.Paid &&
                            aw.WinnerConfirmedAt.HasValue)
                .Select(aw => new {
                    AssignedAt = aw.AssignedAt,
                    PaidAt = aw.AssignedAt //Notess dəyişdirilməlidir
                })
                .ToListAsync();

            if (!paidWinners.Any()) return TimeSpan.Zero;

            var totalHours = paidWinners
                .Select(pw => (pw.PaidAt - pw.AssignedAt).TotalHours)
                .Average();

            return TimeSpan.FromHours(totalHours);
        }

        public async Task<decimal> GetTotalSalesAmountAsync(Guid auctionId)
        {
            return await _context.AuctionWinners
                .Where(aw => aw.AuctionCar.AuctionId == auctionId)
                .SumAsync(aw => aw.Amount);
        }

        public async Task<decimal> GetOverallCollectionRateAsync()
        {
            var totalAmount = await _context.AuctionWinners.SumAsync(aw => aw.Amount);
            if (totalAmount == 0) return 0;

            var collectedAmount = await _context.AuctionWinners
                .Where(aw => aw.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(aw => aw.PaidAmount ?? 0);

            return collectedAmount / totalAmount * 100;
        }

        public async Task<IEnumerable<AuctionWinner>> GetTopBuyersAsync(int count = 10)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .GroupBy(aw => aw.UserId)
                .Select(g => new {
                    UserId = g.Key,
                    TotalAmount = g.Sum(aw => aw.Amount),
                    Winner = g.OrderByDescending(aw => aw.AssignedAt).First()
                })
                .OrderByDescending(x => x.TotalAmount)
                .Take(count)
                .Select(x => x.Winner)
                .ToListAsync();
        }

        // ========== RE-AUCTION DƏSTƏK ==========

        public async Task<IEnumerable<AuctionWinner>> GetCandidatesForReAuctionAsync()
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-7); // 7 gün əvvəl

            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Where(aw => (aw.PaymentStatus == PaymentStatus.Failed ||
                             aw.PaymentStatus == PaymentStatus.Cancelled ||
                             (aw.PaymentStatus == PaymentStatus.Pending &&
                              aw.PaymentDueDate.HasValue &&
                              aw.PaymentDueDate.Value < cutoffDate)))
                .OrderBy(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<AuctionWinner?> GetSecondChanceCandidateAsync(Guid auctionCarId)
        {
            // İlk winner-i tap
            var currentWinner = await GetByAuctionCarIdAsync(auctionCarId);
            if (currentWinner?.WinningBid == null) return null;

            // Növbəti ən yüksək bid-i tap
            var nextHighestBid = await _context.Bids
                .Where(b => b.AuctionCarId == auctionCarId &&
                           b.Id != currentWinner.WinningBidId &&
                           b.Status == Domain.Enums.AuctionEnums.BidStatus.Placed)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAtUtc)
                .FirstOrDefaultAsync();

            if (nextHighestBid == null) return null;

            // Yeni winner yaradırıq (amma database-ə əlavə etmirik)
            return AuctionWinner.Create(
                auctionCarId,
                nextHighestBid.UserId,
                nextHighestBid.Id,
                nextHighestBid.Amount);
        }

        // ========== BULK ƏMƏLİYYATLAR ==========

        public async Task<IEnumerable<AuctionWinner>> GetWinnersForPaymentReminderAsync(int daysBefore = 2)
        {
            var reminderDate = DateTime.UtcNow.AddDays(daysBefore);

            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Where(aw => aw.PaymentStatus == PaymentStatus.Pending &&
                            aw.PaymentDueDate.HasValue &&
                            aw.PaymentDueDate.Value.Date == reminderDate.Date)
                .ToListAsync();
        }

        public async Task<int> MarkOverduePaymentsAsync()
        {
            var overdueWinners = await GetOverduePaymentsAsync();
            int updatedCount = 0;

            foreach (var winner in overdueWinners)
            {
                winner.Notes = $"Payment overdue since {winner.PaymentDueDate}. " + winner.Notes;
                // Status dəyişdirmək üçün business logic-dən keçməlidir
                updatedCount++;
            }

            if (updatedCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return updatedCount;
        }

        public async Task<int> ArchiveCompletedWinnersAsync(DateTime cutoffDate)
        {
            var completedWinners = await _context.AuctionWinners
                .Where(aw => aw.PaymentStatus == PaymentStatus.Paid &&
                            aw.UpdatedAtUtc < cutoffDate)
                .ToListAsync();

            // Archive məntiqini burada implement etmək olar
            // Məsələn, ayrı archive table-ə köçürmək

            return completedWinners.Count;
        }

        // ========== SEARCH VƏ FİLTER ==========

        public async Task<IEnumerable<AuctionWinner>> SearchWinnersAsync(WinnerSearchCriteria criteria)
        {
            var query = _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .AsQueryable();

            if (criteria.UserId.HasValue)
            {
                query = query.Where(aw => aw.UserId == criteria.UserId.Value);
            }

            if (criteria.AuctionId.HasValue)
            {
                query = query.Where(aw => aw.AuctionCar.AuctionId == criteria.AuctionId.Value);
            }

            if (criteria.PaymentStatus.HasValue)
            {
                query = query.Where(aw => aw.PaymentStatus == criteria.PaymentStatus.Value);
            }

            if (criteria.FromDate.HasValue)
            {
                query = query.Where(aw => aw.AssignedAt >= criteria.FromDate.Value);
            }

            if (criteria.ToDate.HasValue)
            {
                query = query.Where(aw => aw.AssignedAt <= criteria.ToDate.Value);
            }

            if (criteria.MinAmount.HasValue)
            {
                query = query.Where(aw => aw.Amount >= criteria.MinAmount.Value);
            }

            if (criteria.MaxAmount.HasValue)
            {
                query = query.Where(aw => aw.Amount <= criteria.MaxAmount.Value);
            }

            if (criteria.IsOverdue.HasValue)
            {
                var now = DateTime.UtcNow;
                query = criteria.IsOverdue.Value
                    ? query.Where(aw => aw.PaymentDueDate.HasValue && aw.PaymentDueDate.Value < now)
                    : query.Where(aw => !aw.PaymentDueDate.HasValue || aw.PaymentDueDate.Value >= now);
            }

            if (!string.IsNullOrEmpty(criteria.CarMake))
            {
                query = query.Where(aw => aw.AuctionCar.Car.Make.Contains(criteria.CarMake));
            }

            if (!string.IsNullOrEmpty(criteria.CarModel))
            {
                query = query.Where(aw => aw.AuctionCar.Car.Model.Contains(criteria.CarModel));
            }

            return await query
                .OrderByDescending(aw => aw.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuctionWinner>> GetWinnersByAmountRangeAsync(decimal minAmount, decimal maxAmount)
        {
            return await _context.AuctionWinners
                .Include(aw => aw.AuctionCar)
                    .ThenInclude(ac => ac.Car)
                .Include(aw => aw.WinningBid)
                .Where(aw => aw.Amount >= minAmount && aw.Amount <= maxAmount)
                .OrderByDescending(aw => aw.Amount)
                .ToListAsync();
        }
    }
}