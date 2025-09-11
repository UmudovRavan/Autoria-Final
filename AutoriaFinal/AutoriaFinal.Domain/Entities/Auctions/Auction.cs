using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class Auction : BaseEntity
    {
        public string Name { get; private set; } = default!;
        public Guid LocationId { get; private set; }
        public DateTime StartTimeUtc { get; private set; }
        public DateTime EndTimeUtc { get; private set; }
        public AuctionStatus Status { get; private set; } = AuctionStatus.Draft;

        public decimal MinBidIncrement { get; private set; } = 100;
        public Guid? CreatedByUserId { get; private set; }

        public ICollection<AuctionCar> AuctionCars { get; private set; } = new List<AuctionCar>();

        public void Schedule(DateTime start, DateTime end) { StartTimeUtc = start; EndTimeUtc = end; MarkUpdated(); }
        public void Start() { Status = AuctionStatus.Running; MarkUpdated(); }
        public void End() { Status = AuctionStatus.Ended; MarkUpdated(); }
        public void Cancel() { Status = AuctionStatus.Cancelled; MarkUpdated(); }
        public void Settle() { Status = AuctionStatus.Settled; MarkUpdated(); }
    }
}
