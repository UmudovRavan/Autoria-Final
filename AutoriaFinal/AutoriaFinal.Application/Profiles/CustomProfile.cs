using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Auction;
using AutoriaFinal.Contract.Dtos.Auctions.Car;
using AutoriaFinal.Contract.Dtos.Auctions.Location;
using AutoriaFinal.Contract.Dtos.Identity;
using AutoriaFinal.Contract.Dtos.Identity.Token;
using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Application.Profiles
{
    public class CustomProfile : Profile
    {
        public CustomProfile()
        {
            #region Auctions
            #region Auction
            CreateMap<Auction, AuctionGetDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.TotalCarsCount, opt => opt.MapFrom(src => src.AuctionCars.Count))
                .ForMember(dest => dest.CarsWithPreBidsCount, opt => opt.MapFrom(src => src.AuctionCars.Count(ac => ac.Bids.Any(b => b.IsPreBid))))
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location != null ? src.Location.Name : null))
                .ReverseMap();

            CreateMap<Auction, AuctionDetailDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.TotalCarsCount, opt => opt.Ignore()) // Service-də hesablanır
                .ForMember(dest => dest.CarsWithPreBidsCount, opt => opt.Ignore()) // Service-də hesablanır
                .ForMember(dest => dest.SoldCarsCount, opt => opt.Ignore()) // Service-də hesablanır
                .ForMember(dest => dest.UnsoldCarsCount, opt => opt.Ignore()) // Service-də hesablanır
                .ForMember(dest => dest.TotalSalesAmount, opt => opt.Ignore()) // Service-də hesablanır
                .ReverseMap();

            CreateMap<AuctionCreateDto, Auction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Entity-də yaradılır
                .ForMember(dest => dest.Status, opt => opt.Ignore()) // Domain method-da təyin edilir
                .ForMember(dest => dest.IsLive, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentCarLotNumber, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentCarStartTime, opt => opt.Ignore())
                .ForMember(dest => dest.ExtendedCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // BaseEntity-də təyin edilir
                .ForMember(dest => dest.UpdatedAtUtc, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<AuctionUpdateDto, Auction>()
                .ReverseMap();

            CreateMap<Auction, AuctionStatisticsDto>()
                .ForMember(dest => dest.AuctionId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.AuctionName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.AuctionStartTime, opt => opt.MapFrom(src => src.StartTimeUtc))
                .ForMember(dest => dest.AuctionEndTime, opt => opt.MapFrom(src => src.EndTimeUtc))
                .ForMember(dest => dest.TotalCars, opt => opt.Ignore()) 
                .ForMember(dest => dest.SoldCars, opt => opt.Ignore())
                .ForMember(dest => dest.UnsoldCars, opt => opt.Ignore())
                .ForMember(dest => dest.TotalSalesAmount, opt => opt.Ignore())
                .ForMember(dest => dest.AverageSalePrice, opt => opt.Ignore())
                .ForMember(dest => dest.TotalBids, opt => opt.Ignore())
                .ForMember(dest => dest.UniqueBidders, opt => opt.Ignore())
                .ForMember(dest => dest.AuctionDuration, opt => opt.Ignore())
                .ReverseMap();
            #endregion
            #region Car
            // ✅ Siyahı görünüşü
            CreateMap<Car, CarGetDto>().ReverseMap();

            // ✅ Detallı görünüş
            CreateMap<Car, CarDetailDto>()
                .ForMember(dest => dest.PhotoUrls,
                    opt => opt.MapFrom(src => src.PhotoUrls))
                .ForMember(dest => dest.VideoUrls,
                    opt => opt.MapFrom(src => src.VideoUrls))
                .ReverseMap();

            // ✅ Create DTO → Entity
            CreateMap<CarCreateDto, Car>()
                .ForMember(dest => dest.PhotoUrls,
                    opt => opt.Ignore())   // şəkil upload sonra yazılır
                .ForMember(dest => dest.VideoUrls,
                    opt => opt.Ignore())
                .ReverseMap();

            // ✅ Update DTO → Entity
            CreateMap<CarUpdateDto, Car>()
                .ForMember(dest => dest.PhotoUrls,
                    opt => opt.Ignore())
                .ForMember(dest => dest.VideoUrls,
                    opt => opt.Ignore())
                .ReverseMap();
            #endregion
            #region Location
            CreateMap<Location, LocationGetDto>().ReverseMap();
            CreateMap<Location, LocationDetailDto>().ReverseMap();
            CreateMap<LocationCreateDto, Location>().ReverseMap();
            CreateMap<LocationUpdateDto, Location>().ReverseMap();
            #endregion
            #endregion

            #region Identity
            #region Register
            CreateMap<RegisterDto, ApplicationUser>()
                .ReverseMap();
            #endregion
            #region AuthResponse
            CreateMap<ApplicationUser, AuthResponseDto>()
              .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
              .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
              .ForMember(dest => dest.Token, opt => opt.Ignore())
              .ForMember(dest => dest.ExpiresAt, opt => opt.Ignore())
              .ReverseMap();
            #endregion
            #region Token
            CreateMap<TokenGenerationRequest, AuthResponseDto>()
               .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
               .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
               .ForMember(dest => dest.Token, opt => opt.Ignore())
               .ForMember(dest => dest.ExpiresAt, opt => opt.MapFrom(src => src.ExpiresAt))
               .ReverseMap();
            #endregion
            



            #endregion

        }
    }
}
