using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Auction
{
    public record AuctionRequestDto(
        string Name,
        Guid LocationId,
        DateTime StartTimeUtc,
        DateTime EndTimeUtc
    );
}
