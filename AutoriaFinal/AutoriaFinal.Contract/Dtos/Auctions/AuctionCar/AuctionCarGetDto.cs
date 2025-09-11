using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Auctions.AuctionCar
{
    public class AuctionCarGetDto
    {
        public Guid Id { get; set; }
        public string LotNumber { get; set; } = default!;
        public decimal CurrentPrice { get; set; }
        public bool IsReserveMet { get; set; }
        public string WinnerStatus { get; set; } = default!;
    }
}
