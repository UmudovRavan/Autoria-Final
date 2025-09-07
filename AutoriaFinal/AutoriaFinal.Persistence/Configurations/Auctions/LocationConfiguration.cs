using AutoriaFinal.Domain.Entities.Auctions;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Configurations.Auctions
{
    public class LocationConfiguration : BaseEntityConfiguration<Location>
    {
        public override void Configure(EntityTypeBuilder<Location> builder)
        {
            base.Configure(builder);


            builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(150);


            builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);


            builder.HasIndex(x => x.Code).IsUnique();


            builder.Property(x => x.AddressLine1).HasMaxLength(200);
            builder.Property(x => x.City).HasMaxLength(80);
            builder.Property(x => x.Region).HasMaxLength(80);
            builder.Property(x => x.Country).HasMaxLength(80);
            builder.Property(x => x.PostalCode).HasMaxLength(20);
        }   
    }
}
