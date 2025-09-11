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
    public class AuctionCarConfiguration : BaseEntityConfiguration<AuctionCar>
    {
        public override void Configure(EntityTypeBuilder<AuctionCar> builder)
        {
            base.Configure(builder);

            builder.Property(x => x.LotNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(x => x.ItemNumber)
                   .IsRequired(false);

            builder.Property(x => x.ReservePrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.HammerPrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.CurrentPrice)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(x => x.IsReserveMet)
                   .HasDefaultValue(false);

            builder.Property(x => x.WinnerStatus)
                   .HasConversion<int>();

            builder.HasIndex(x => new { x.AuctionId, x.CarId }).IsUnique();
            builder.HasIndex(x => new { x.AuctionId, x.LotNumber }).IsUnique();

            builder.HasMany(x => x.Bids)
                   .WithOne()
                   .HasForeignKey(b => b.AuctionCarId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
