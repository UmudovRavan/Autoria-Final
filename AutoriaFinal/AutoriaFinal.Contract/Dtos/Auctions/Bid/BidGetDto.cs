using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Bid
{
    public record BidGetDto(
        Guid AuctionCarId,
        Guid UserId,
        decimal Amount,
        bool IsProxy = false,
        decimal? ProxyMax = null
    );
}
