using AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner;
using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Auctions
{
    public interface IAuctionWinnerService : IGenericService<
        AuctionWinner,
        AuctionWinnerGetDto,
        AuctionWinnerDetailDto,
        AuctionWinnerCreateDto,
        AuctionWinnerUpdateDto>
    {
        // ========== WINNER ASSIGNMENT VƏ CONFIRMATION ==========

        
        /// Auction bitdikdə ən yüksək bid verəni qalib təyin edir
        /// Bu metod auction timer bitdikdə avtomatik çağrılır
       
        Task<AuctionWinnerDetailDto> AssignWinnerAsync(Guid auctionCarId, Guid winningBidId);

        
        /// Seller winner-i təsdiq edir
        ///  Copart sistemində seller mütləq təsdiqləməlidir
        
        Task<AuctionWinnerDetailDto> ConfirmWinnerAsync(Guid winnerId, Guid sellerId, string? confirmationNotes = null);

        
        /// Seller winner-i rədd edir
        /// Rədd edildikdə re-auction və ya second chance başlayır
       
        Task<AuctionWinnerDetailDto> RejectWinnerAsync(Guid winnerId, Guid sellerId, string rejectionReason);

        // ========== PAYMENT MANAGEMENT ==========

       
        /// Ödəniş qəbul edildiyi zaman işarələyir
        
        Task<AuctionWinnerDetailDto> ProcessPaymentAsync(Guid winnerId, decimal paidAmount, string? paymentReference = null, string? notes = null);

        /// Payment failure işarələ
       
        Task<AuctionWinnerDetailDto> MarkPaymentFailedAsync(Guid winnerId, string failureReason);

        /// Payment due date uzatma
        Task<AuctionWinnerDetailDto> ExtendPaymentDueDateAsync(Guid winnerId, int additionalDays, string reason, Guid extendedByUserId);

        // ========== SORĞULAR VƏ AXTARIŞ ==========

        /// AuctionCar üçün winner-i al
        Task<AuctionWinnerDetailDto?> GetByAuctionCarIdAsync(Guid auctionCarId);

        /// İstifadəçinin bütün qazandığı auction-ları al
        Task<IEnumerable<AuctionWinnerGetDto>> GetUserWinningsAsync(Guid userId);
        /// İstifadəçinin ödənilməmiş winner-lərini al
        Task<IEnumerable<AuctionWinnerGetDto>> GetUserUnpaidWinnersAsync(Guid userId);

        /// Seller-in satışlarını al
        Task<IEnumerable<AuctionWinnerGetDto>> GetSellerSalesAsync(Guid sellerId);

        /// Müəyyən auction üçün bütün winner-ləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetWinnersByAuctionAsync(Guid auctionId);

        // ========== PAYMENT TRACKING VƏ OVERDüE MANAGEMENT ==========
        /// Müddəti keçmiş ödənişləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetOverduePaymentsAsync();

        /// Payment reminder göndərəcək winner-ləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetWinnersForPaymentReminderAsync(int daysBefore = 2);

        /// Payment status-a görə winner-ləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetWinnersByPaymentStatusAsync(string paymentStatus);

        /// Payment reminder göndərmə qeydiyyatı
        Task<bool> RecordPaymentReminderSentAsync(Guid winnerId);

        // ========== RE-AUCTION VƏ SECOND CHANCE ==========

        /// Re-auction başladır
        Task<bool> InitiateReAuctionAsync(Guid auctionCarId, string reason);

        /// Second chance bid işləyir
        Task<AuctionWinnerDetailDto?> ProcessSecondChanceBidAsync(Guid auctionCarId);

        /// Re-auction üçün uyğun winner-ləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetCandidatesForReAuctionAsync();

        // ========== COMPLETION VƏ DELIVERY ==========

        /// Satışı tamamlanmış olaraq işarələ
        Task<AuctionWinnerDetailDto> CompleteSaleAsync(Guid winnerId, string? completionNotes = null);

        /// Satışı ləğv edir
        Task<AuctionWinnerDetailDto> CancelSaleAsync(Guid winnerId, string cancellationReason);

        // ========== ANALYTICS VƏ REPORTİNG ==========

        /// Winner success rate hesablayır
        Task<WinnerAnalyticsDto> GetWinnerAnalyticsAsync(Guid userId, DateTime fromDate, DateTime toDate);

        /// Payment performance hesabatı
        Task<PaymentPerformanceDto> GetPaymentPerformanceAsync(DateTime fromDate, DateTime toDate);

        /// Top buyer-ləri al
        Task<IEnumerable<AuctionWinnerGetDto>> GetTopBuyersAsync(int count = 10);

        // ========== SEARCH VƏ ADVANCED QUERİES ==========

        /// Winner axtarışı (complex criteria ilə)
        Task<IEnumerable<AuctionWinnerGetDto>> SearchWinnersAsync(WinnerSearchCriteria criteria);

        /// Məbləğ aralığına görə winner-lər
        Task<IEnumerable<AuctionWinnerGetDto>> GetWinnersByAmountRangeAsync(decimal minAmount, decimal maxAmount);

        // ========== NOTIFICATION VƏ COMMUNİCATİON ==========

        /// Winner notification göndərir
        Task<bool> SendWinnerNotificationAsync(Guid winnerId, WinnerNotificationType notificationType);
    }

    // ========== HELPER CLASSES VƏ ENUMS ==========

    /// Winner axtarış kriteriyaları
    public class WinnerSearchCriteria
    {
        public Guid? UserId { get; set; }
        public Guid? AuctionId { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public bool? IsOverdue { get; set; }
        public string? CarMake { get; set; }
        public string? CarModel { get; set; }
        public bool? IsConfirmed { get; set; }
        public bool? IsSecondChance { get; set; }
    }

}