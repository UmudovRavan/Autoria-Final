using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Auction
{
    public class AuctionUpdateDto
    {
        public string Name { get; set; } = default!;
        public Guid LocationId { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public decimal MinBidIncrement { get; set; } = 100;
    }
}
