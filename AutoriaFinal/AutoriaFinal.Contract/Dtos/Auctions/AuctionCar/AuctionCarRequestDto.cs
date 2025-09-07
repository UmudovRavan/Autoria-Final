using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionCar
{
    public record AuctionCarRequestDto(
       Guid AuctionId,
       Guid CarId,
       string LotNumber,
       int? ItemNumber,
       decimal? ReservePrice
   );
}
