using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class Bid : BaseEntity
    {
        public Guid AuctionCarId { get; private set; }
        public Guid UserId { get; private set; }

        public decimal Amount { get; private set; }
        public bool IsProxy { get; private set; }
        public decimal? ProxyMax { get; private set; }
        public BidStatus Status { get; private set; } = BidStatus.Placed;

        public DateTime PlacedAtUtc { get; private set; } = DateTime.UtcNow;

        public void Invalidate() { Status = BidStatus.Invalidated; MarkUpdated(); }
        public void Retract() { Status = BidStatus.Retracted; MarkUpdated(); }
    }
}
