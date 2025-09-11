using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionCar
{
    public class AuctionCarCreateDto
    {
        public Guid AuctionId { get; set; }
        public Guid CarId { get; set; }
        public string LotNumber { get; set; } = default!;
        public int? ItemNumber { get; set; }
        public decimal? ReservePrice { get; set; }
    }
}
