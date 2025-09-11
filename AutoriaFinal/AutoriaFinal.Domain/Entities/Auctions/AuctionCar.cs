using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class AuctionCar : BaseEntity
    {
        public Guid AuctionId { get; private set; }
        public Guid CarId { get; private set; }

        public string LotNumber { get; private set; } = default!;
        public int? ItemNumber { get; private set; }

        public decimal? ReservePrice { get; private set; }
        public decimal? HammerPrice { get; private set; }
        public decimal CurrentPrice { get; private set; } = 0;
        public bool IsReserveMet { get; private set; }

        public ICollection<Bid> Bids { get; private set; } = new List<Bid>();
        public AuctionWinnerStatus WinnerStatus { get; private set; } = AuctionWinnerStatus.Pending;

        public void SetReserve(decimal? reserve) { ReservePrice = reserve; MarkUpdated(); } //rich data model
        public void SetHammer(decimal amount) { HammerPrice = amount; MarkUpdated(); }
        public void SetReserveMet(bool met) { IsReserveMet = met; MarkUpdated(); }
        public void SetWinner(AuctionWinnerStatus winner) { WinnerStatus = winner; MarkUpdated(); }
        public void UpdateCurrentPrice(decimal bidAmount) { CurrentPrice = bidAmount; MarkUpdated(); }

    }
}
