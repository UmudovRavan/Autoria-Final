using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner
{
    public class AuctionWinnerUpdateDto
    {
        public decimal? PaidAmount { get; set; }
        public string PaymentStatus { get; set; } = default!;
    }
}
