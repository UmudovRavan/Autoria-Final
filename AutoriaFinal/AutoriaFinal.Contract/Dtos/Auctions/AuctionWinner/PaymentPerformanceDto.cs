using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner
{
    public class PaymentPerformanceDto
    {
        public DateTime ReportPeriodFrom { get; set; }
        public DateTime ReportPeriodTo { get; set; }

        // Overall məlumatları
        public int TotalWinners { get; set; }
        public int PaidOnTime { get; set; }
        public int PaidLate { get; set; }
        public int PaymentFailed { get; set; }
        public int StillPending { get; set; }

        // Amount məlumatları
        public decimal TotalWinAmount { get; set; }
        public decimal CollectedAmount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public decimal BadDebtAmount { get; set; }

        // Ratios
        public decimal CollectionRate { get; set; }
        public decimal OnTimePaymentRate { get; set; }
        public decimal BadDebtRate { get; set; }

        // Average times
        public TimeSpan AveragePaymentTime { get; set; }
        public TimeSpan AverageOverdueTime { get; set; }

        // Breakdown by ranges
        public IEnumerable<AmountRangePerformance> PerformanceByAmountRange { get; set; } = new List<AmountRangePerformance>();

        // Monthly breakdown
        public IEnumerable<MonthlyPerformance> MonthlyBreakdown { get; set; } = new List<MonthlyPerformance>();
    }

    public class AmountRangePerformance
    {
        public string Range { get; set; } = default!; // "$0-$5K", "$5K-$20K"
        public int WinnerCount { get; set; }
        public decimal CollectionRate { get; set; }
        public decimal OnTimeRate { get; set; }
    }

    public class MonthlyPerformance
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = default!;
        public int WinnerCount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal CollectionRate { get; set; }
    }
}
