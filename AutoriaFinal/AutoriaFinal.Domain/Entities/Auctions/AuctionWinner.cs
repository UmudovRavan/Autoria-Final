using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
using AutoriaFinal.Domain.Enums.FinanceEnums;
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

        public decimal? PaidAmount { get; private set; }
        public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;
        public DateTime AssignedAt { get; private set; } = DateTime.UtcNow;

        public void MarkPaid(decimal amount)
        {
            PaidAmount = amount;
            PaymentStatus = PaymentStatus.Paid;
            MarkUpdated();
        }

        public void Cancel()
        {
            PaymentStatus = PaymentStatus.Cancelled;
            MarkUpdated();
        }
    }
}
