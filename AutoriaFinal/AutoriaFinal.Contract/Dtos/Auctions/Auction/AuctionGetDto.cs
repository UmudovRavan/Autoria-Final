using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Auction
{
    public class AuctionGetDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public string Status { get; set; } = default!;
    }
}
