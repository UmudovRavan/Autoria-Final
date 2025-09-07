using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Bid
{
    public record BidResponseDto(
        Guid Id,
        Guid AuctionCarId,
        Guid UserId,
        decimal Amount,
        bool IsProxy,
        decimal? ProxyMax,
        BidStatus Status,
        DateTime PlacedAtUtc
    );
}
