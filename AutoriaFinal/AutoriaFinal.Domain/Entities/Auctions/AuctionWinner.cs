using AutoriaFinal.Domain.Entities.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class AuctionWinner : BaseEntity
    {
        public Guid AuctionCarId { get; private set; }
        public Guid UserId { get; private set; }
        public Guid WinningBidId { get; private set; }
        public decimal Amount { get; private set; }
    }
}
