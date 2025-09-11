using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Auction
{
    public class AuctionDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public Guid LocationId { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public string Status { get; set; } = default!;
        public decimal MinBidIncrement { get; set; }
        public IEnumerable<AuctionCarGetDto> AuctionCars { get; set; } = new List<AuctionCarGetDto>();
    }
}
