using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Auction
{
    public record AuctionResponseDto(
         Guid Id,
         string Name,
         Guid LocationId,
         DateTime StartTimeUtc,
         DateTime EndTimeUtc,
         AuctionStatus Status
     );
}
