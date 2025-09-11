using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionCar
{
    public class AuctionCarUpdateDto
    {
        public string LotNumber { get; set; } = default!;
        public int? ItemNumber { get; set; }
        public decimal? ReservePrice { get; set; }
        public decimal? HammerPrice { get; set; }
    }
}
