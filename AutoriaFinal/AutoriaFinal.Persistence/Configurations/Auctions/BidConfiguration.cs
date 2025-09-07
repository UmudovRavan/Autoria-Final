using AutoriaFinal.Domain.Entities.Auctions;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Configurations.Auctions
{
    public class BidConfiguration : BaseEntityConfiguration<Bid>
    {
        public override void Configure(EntityTypeBuilder<Bid> builder)
        {
            base.Configure(builder);


            builder.Property(x => x.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");


            builder.Property(x => x.IsProxy)
            .HasDefaultValue(false);


            builder.Property(x => x.ProxyMax)
            .HasColumnType("decimal(18,2)");


            builder.Property(x => x.Status)
            .HasConversion<int>();


            builder.Property(x => x.PlacedAtUtc)
            .IsRequired();


            builder.HasIndex(x => x.AuctionCarId);
            builder.HasIndex(x => new { x.AuctionCarId, x.PlacedAtUtc });


            builder.HasOne<AuctionCar>()
            .WithMany(ac => ac.Bids)
            .HasForeignKey(x => x.AuctionCarId)
            .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
