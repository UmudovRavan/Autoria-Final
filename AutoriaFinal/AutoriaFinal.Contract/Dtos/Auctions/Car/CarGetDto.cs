using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.Car
{
    public class CarGetDto
    {
        public Guid Id { get; set; }
        public string Vin { get; set; } = default!;
        public int Year { get; set; }
        public string Make { get; set; } = default!;
        public string Model { get; set; } = default!;
        public string? Color { get; set; }
        public int? Odometer { get; set; }
        public string OdometerUnit { get; set; } = "km";
        public string? PhotoUrl { get; set; }
    }
}
