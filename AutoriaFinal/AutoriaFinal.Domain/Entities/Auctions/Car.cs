using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Entities.Identity;
using AutoriaFinal.Domain.Enums.VehicleEnums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Entities.Auctions
{
    public class Car : BaseEntity
    {
        public string OwnerId { get;  set; }  = default!;
        public ApplicationUser Owner { get; set; } = default!;
        public string Vin { get; private set; } = default!;
        public int Year { get; private set; }
        public string Make { get; private set; } = default!;
        public string Model { get; private set; } = default!;
        public string? BodyStyle { get; private set; }
        public string? Color { get; private set; }
        public int? Odometer { get; private set; }
        public string OdometerUnit { get; private set; } = "km"; // "mi"/"km"

        public FuelType Fuel { get; private set; } = FuelType.Unknown;
        public Transmission Transmission { get; private set; } = Transmission.Unknown;
        public DriveTrain DriveTrain { get; private set; } = DriveTrain.Unknown;
        public CarCondition Condition { get; private set; } = CarCondition.Unknown;
        public bool HasKeys { get; private set; }

        public DamageType PrimaryDamage { get;  set; } = DamageType.Unknown;
        public DamageType SecondaryDamage { get;  set; } = DamageType.Unknown;

        public TitleType TitleType { get; private set; } = TitleType.Unknown;
        public string? TitleState { get; private set; }

        public decimal? EstimatedRetailValue { get; private set; }

        public string PhotoUrls { get;  set; }= new string("");
        public string VideoUrls { get;  set; } = new string("");
        public Guid? LocationId { get; private set; }
        public Location? Location { get; private set; } = default!;

        public ICollection<Support.Document> Documents { get; private set; } = new List<Support.Document>();

        #region Helper Methods
        public void SetOdometer(int? value, string unit)
        {
            Odometer = value;
            OdometerUnit = unit;
            MarkUpdated();
        }

        public void SetSpec(FuelType fuel, Transmission trans, DriveTrain drive)
        {
            Fuel = fuel;
            Transmission = trans;
            DriveTrain = drive;
            MarkUpdated();
        }

        public void SetCondition(CarCondition condition, bool hasKeys)
        {
            Condition = condition;
            HasKeys = hasKeys;
            MarkUpdated();
        }

        public void SetDamage(DamageType primary, DamageType secondary)
        {
            PrimaryDamage = primary;
            SecondaryDamage = secondary;
            MarkUpdated();
        }

        public void SetTitle(TitleType type, string? state)
        {
            TitleType = type;
            TitleState = state;
            MarkUpdated();
        }

        public void SetErv(decimal? value)
        {
            EstimatedRetailValue = value;
            MarkUpdated();
        }

        #endregion


    }
}
