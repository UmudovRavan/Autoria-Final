using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Location
{
    public record LocationRequestDto(string Name,
        string Code,
        string? AddressLine1,
        string? City,
        string? Region,
        string? Country,
        string? PostalCode);
}
