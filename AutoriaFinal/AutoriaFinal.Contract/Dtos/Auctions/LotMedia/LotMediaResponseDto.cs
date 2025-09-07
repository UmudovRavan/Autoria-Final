using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.LotMedia
{
    public record LotMediaResponseDto (Guid Id,
        Guid AuctionCarId,
        string Url,
        MediaType Type,
        string? ContentType,
        int SortOrder,
        bool IsPrimary);
}
