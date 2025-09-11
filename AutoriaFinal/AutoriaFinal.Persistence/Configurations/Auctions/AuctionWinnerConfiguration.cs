using AutoriaFinal.Domain.Entities.Auctions;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoriaFinal.Domain.Enums.AuctionEnums;

namespace AutoriaFinal.Persistence.Configurations.Auctions
{
    public class AuctionWinnerConfiguration : BaseEntityConfiguration<AuctionWinner>
    {
        public override void Configure(EntityTypeBuilder<AuctionWinner> builder)
        {
            base.Configure(builder);

            builder.Property(x => x.Amount)
                   .IsRequired()
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.PaidAmount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired(false);

            builder.Property(x => x.PaymentStatus)
                   .HasConversion<int>()
                   .HasDefaultValue(PaymentStatus.Pending); // Pending

            builder.Property(x => x.AssignedAt)
                   .IsRequired();

            builder.HasIndex(x => x.AuctionCarId).IsUnique();

            builder.HasOne<AuctionCar>()
                   .WithMany()
                   .HasForeignKey(x => x.AuctionCarId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Bid>()
                   .WithMany()
                   .HasForeignKey(x => x.WinningBidId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
