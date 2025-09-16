using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Repositories.Auctions
{
    public interface IAuctionWinnerRepository : IGenericRepository<AuctionWinner>
    {
        // ========== ƏSAS SORĞULAR ==========

        Task<AuctionWinner?> GetByAuctionCarIdAsync(Guid auctionCarId);
        Task<IEnumerable<AuctionWinner>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<AuctionWinner>> GetUnpaidWinnersAsync(Guid userId);
        Task<IEnumerable<AuctionWinner>> GetWinnersByAuctionAsync(Guid auctionId);

        // ========== PAYMENT TRACKİNG ==========

        // Ödəniş statusuna görə winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetWinnersByPaymentStatusAsync(PaymentStatus paymentStatus);


        // Müddəti keçmiş ödənişləri alır  
        Task<IEnumerable<AuctionWinner>> GetOverduePaymentsAsync();

        // Müəyyən tarix aralığında ödəniş alan winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetPaidWinnersInPeriodAsync(DateTime fromDate, DateTime toDate);


        // Qismən ödəniş edən winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetPartiallyPaidWinnersAsync();

        /// <summary>
        /// Payment failure olan winner-ləri alır
        /// NIYË LAZIMDIR: Re-auction və second chance bid üçün
        /// </summary>
        Task<IEnumerable<AuctionWinner>> GetFailedPaymentWinnersAsync();

        // ========== SELLER PERSPEKTİVİ ==========

        // Seller-in satışlarını alır
        Task<IEnumerable<AuctionWinner>> GetSellerSalesAsync(Guid sellerId);

        // Seller-in pending confirmation olan winner-lərini alır
        Task<IEnumerable<AuctionWinner>> GetPendingConfirmationsBySeller(Guid sellerId);

        // Seller-in reject etdiyi winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetRejectedWinnersBySeller(Guid sellerId);

        // ========== STATİSTİKA VƏ ANALİZ ==========

        // İstifadəçinin uğur dərəcəsini hesablayır
        Task<decimal> GetUserSuccessRateAsync(Guid userId);

        /// İstifadəçinin orta ödəniş müddətini hesablayır
        Task<TimeSpan> GetUserAveragePaymentTimeAsync(Guid userId);

        /// Müəyyən auction üçün ümumi satış məbləğini hesablayır
        Task<decimal> GetTotalSalesAmountAsync(Guid auctionId);

        /// Ümumi collection rate hesablayır
        Task<decimal> GetOverallCollectionRateAsync();

        /// Top buyer-ləri alır (ən çox pul xərcləyən)
        Task<IEnumerable<AuctionWinner>> GetTopBuyersAsync(int count = 10);

        // ========== RE-AUCTION DƏSTƏK ==========

        /// Re-auction üçün uyğun olan winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetCandidatesForReAuctionAsync();

        /// Second chance bid üçün növbəti winner-i alır 
        Task<AuctionWinner?> GetSecondChanceCandidateAsync(Guid auctionCarId);

        // ========== BULK ƏMƏLİYYATLAR ==========

        /// Payment reminder göndərilməli winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetWinnersForPaymentReminderAsync(int daysBefore = 2);

        /// Müddəti keçmiş winner-lərin statusunu yenilər
        Task<int> MarkOverduePaymentsAsync();

        /// Completed olan köhnə winner record-larını archive edir
        Task<int> ArchiveCompletedWinnersAsync(DateTime cutoffDate);

        // ========== SEARCH VƏ FİLTER ==========

        /// Winner-ləri müxtəlif kriterlərə görə axtarır
        Task<IEnumerable<AuctionWinner>> SearchWinnersAsync(WinnerSearchCriteria criteria);

        /// Müəyyən məbləğ aralığında winner-ləri alır
        Task<IEnumerable<AuctionWinner>> GetWinnersByAmountRangeAsync(decimal minAmount, decimal maxAmount);
    }
    public class WinnerSearchCriteria
    {
        public Guid? UserId { get; set; }
        public Guid? AuctionId { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public bool? IsOverdue { get; set; }
        public string? CarMake { get; set; }
        public string? CarModel { get; set; }
    }
}
