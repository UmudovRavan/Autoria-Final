using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.LotMedia
{
    public record LotMediaRequestDto(Guid AuctionCarId,
        string Url,
        MediaType Type,        // Image / Video
        string? ContentType,
        int SortOrder = 0,
        bool IsPrimary = false);
}
