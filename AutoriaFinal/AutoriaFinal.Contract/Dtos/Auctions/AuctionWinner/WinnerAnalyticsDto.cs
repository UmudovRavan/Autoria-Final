using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner
{
    public class WinnerAnalyticsDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = default!;

        // Win statistikaları
        public int TotalWins { get; set; }
        public int CompletedSales { get; set; }
        public int CancelledSales { get; set; }
        public int PendingSales { get; set; }

        // Amount statistikaları
        public decimal TotalAmountWon { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public decimal OutstandingAmount { get; set; }
        public decimal AverageWinAmount { get; set; }

        // Performance məlumatları
        public decimal SuccessRate { get; set; }
        public decimal PaymentComplianceRate { get; set; }
        public TimeSpan AveragePaymentTime { get; set; }

        // Period məlumatları
        public DateTime AnalysisPeriodFrom { get; set; }
        public DateTime AnalysisPeriodTo { get; set; }
        public int DaysInPeriod { get; set; }

        // Comparison
        public decimal PerformanceVsAverage { get; set; } // %
        public string PerformanceGrade { get; set; } = default!; // A+, A, B, C, D
    }
}
