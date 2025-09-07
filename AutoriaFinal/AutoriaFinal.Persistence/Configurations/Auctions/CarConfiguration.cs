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
    public class CarConfiguration : BaseEntityConfiguration<Car>
    {
        public override void Configure(EntityTypeBuilder<Car> builder)
        {
            base.Configure(builder);


            builder.Property(x => x.Vin)
            .IsRequired()
            .HasMaxLength(17);
            builder.HasIndex(x => x.Vin).IsUnique();


            builder.Property(x => x.Year)
            .IsRequired();


            builder.Property(x => x.Make)
            .IsRequired()
            .HasMaxLength(100);


            builder.Property(x => x.Model)
            .IsRequired()
            .HasMaxLength(100);


            builder.Property(x => x.BodyStyle)
            .HasMaxLength(64);


            builder.Property(x => x.Color)
            .HasMaxLength(64);


            builder.Property(x => x.Odometer);


            builder.Property(x => x.OdometerUnit)
            .IsRequired()
            .HasMaxLength(2); // "mi" / "km"


            builder.Property(x => x.Fuel).HasConversion<int>();
            builder.Property(x => x.Transmission).HasConversion<int>();
            builder.Property(x => x.DriveTrain).HasConversion<int>();
            builder.Property(x => x.Condition).HasConversion<int>();
            builder.Property(x => x.PrimaryDamage).HasConversion<int>();
            builder.Property(x => x.SecondaryDamage).HasConversion<int>();
            builder.Property(x => x.TitleType).HasConversion<int>();


            builder.Property(x => x.TitleState)
            .HasMaxLength(10);


            builder.Property(x => x.EstimatedRetailValue)
            .HasColumnType("decimal(18,2)");




            // Documents are in Support module; FK configured there if needed.
        }
    }
}
