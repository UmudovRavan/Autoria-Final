using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner
{
    public record AuctionWinnerResponseDto(
         Guid Id,
         Guid AuctionCarId,
         Guid UserId,
         Guid WinningBidId,
         decimal Amount,
         AuctionWinnerStatus Status
     );
}
