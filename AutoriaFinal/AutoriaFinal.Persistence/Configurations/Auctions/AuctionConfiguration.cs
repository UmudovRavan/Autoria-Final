using AutoriaFinal.Domain.Entities.Auctions;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoriaFinal.Persistence.Configurations;

namespace AutoriaFinal.Persistence.Configurations.Auctions
{
    public class AuctionConfiguration : BaseEntityConfiguration<Auction>
    {
        public override void Configure(EntityTypeBuilder<Auction> builder)
        {
            base.Configure(builder);

            builder.Property(a => a.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(a => a.MinBidIncrement)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(100);

            builder.Property(a => a.CreatedByUserId)
                   .IsRequired(false);

            builder.HasOne<Location>()
                   .WithMany()
                   .HasForeignKey(a => a.LocationId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(a => a.Status)
                   .HasConversion<int>();

            builder.HasMany(a => a.AuctionCars)
                   .WithOne()
                   .HasForeignKey(ac => ac.AuctionId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
  
    }
}
