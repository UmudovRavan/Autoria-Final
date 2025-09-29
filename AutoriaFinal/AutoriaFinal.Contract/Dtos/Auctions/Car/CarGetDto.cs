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
        public string Vin { get; set; }
        public int Year { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string ImagePath { get; set; }
        public string OwnerId { get; set; } // string owner
        public Guid? LocationId { get; set; }
    }
}
