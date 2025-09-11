using AutoriaFinal.Contract.Dtos.Auctions.Bid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionCar
{
    public class AuctionCarDetailDto
    {
        public Guid Id { get; set; }
        public Guid CarId { get; set; }
        public string LotNumber { get; set; } = default!;
        public int? ItemNumber { get; set; }
        public decimal? ReservePrice { get; set; }
        public decimal? HammerPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public bool IsReserveMet { get; set; }
        public string WinnerStatus { get; set; } = default!;
        public IEnumerable<BidGetDto> Bids { get; set; } = new List<BidGetDto>();
    }
}
