using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner
{
    public class AuctionWinnerDetailDto
    {
        public Guid Id { get; set; }
        public Guid AuctionCarId { get; set; }
        public Guid UserId { get; set; }
        public Guid WinningBidId { get; set; }
        public decimal Amount { get; set; }
        public decimal? PaidAmount { get; set; }
        public string PaymentStatus { get; set; } = default!;
        public DateTime AssignedAt { get; set; }
    }
}
