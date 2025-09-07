using AutoriaFinal.Domain.Entities.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class Location : BaseEntity
    {
        public string Name { get; private set; } = default!;
        public string Code { get; private set; } = default!;

        public string? AddressLine1 { get; private set; }
        public string? City { get; private set; }
        public string? Region { get; private set; }
        public string? Country { get; private set; }
        public string? PostalCode { get; private set; }             

    }
}
