using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Auction;
using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
using AutoriaFinal.Contract.Dtos.Auctions.Bid;
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
            #region AuctionCar
            CreateMap<AuctionCarCreateDto, AuctionCar>()
               .ForMember(dest => dest.Id, opt => opt.Ignore())
               .ForMember(dest => dest.HammerPrice, opt => opt.Ignore())
               .ForMember(dest => dest.CurrentPrice, opt => opt.Ignore())
               .ForMember(dest => dest.IsReserveMet, opt => opt.Ignore())
               .ForMember(dest => dest.IsActive, opt => opt.Ignore())
               .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
               .ForMember(dest => dest.UpdatedAtUtc, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<AuctionCar, AuctionCarGetDto>().ReverseMap();

            CreateMap<AuctionCar, AuctionCarDetailDto>().ReverseMap();

            CreateMap<AuctionCarUpdateDto, AuctionCar>().ReverseMap();
            CreateMap<AuctionCar, AuctionCarTimerDto>().ReverseMap();
            #endregion
            #region Bids
            // Create
            CreateMap<BidCreateDto, Bid>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Entity-də yaranır
                .ForMember(dest => dest.PlacedAtUtc, opt => opt.Ignore()) // Service səviyyəsində set edilir
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ReverseMap();

            // Update
            CreateMap<BidUpdateDto, Bid>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PlacedAtUtc, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ReverseMap();

            // Get (siyahı üçün)
            CreateMap<Bid, BidGetDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BidType, opt => opt.MapFrom(src => src.BidType.ToString()))
                .ReverseMap();

            // Detail (detallı görünüş üçün)
            CreateMap<Bid, BidDetailDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BidType, opt => opt.MapFrom(src => src.BidType.ToString()))
                .ReverseMap();

            // History (auction üzrə bütün tarixçəni çıxarmaq üçün)
            CreateMap<Bid, BidHistoryDto>().ReverseMap();
            CreateMap<BidderSummaryDto, ApplicationUser>().ReverseMap();

            // Stats
            CreateMap<BidStatsDto, Bid>().ReverseMap();

            // Summary (istifadəçi üzrə ümumi bid statistika)
            CreateMap<BidSummaryDto, Bid>().ReverseMap();

            // ProxyBid
            CreateMap<ProxyBidDto, Bid>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PlacedAtUtc, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ReverseMap();

            #endregion
            #region Car
            CreateMap<Car, CarGetDto>()
      .ForMember(dest => dest.ImagePath, opt => opt.MapFrom(src =>
          !string.IsNullOrEmpty(src.PhotoUrls)
              ? src.PhotoUrls.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault()
              : src.PhotoUrls))
      .ForMember(dest => dest.OwnerId, opt => opt.MapFrom(src => src.OwnerId != null ? src.OwnerId.ToString() : null))
      .ForMember(dest => dest.LocationId, opt => opt.MapFrom(src => src.LocationId))
      .ReverseMap()
      .ForMember(src => src.PhotoUrls, opt => opt.Ignore())
      .ForMember(src => src.PhotoUrls, opt => opt.Ignore())
      .ForMember(src => src.OwnerId, opt => opt.Ignore());

            CreateMap<Car, CarDetailDto>()
                .ForMember(dest => dest.PhotoUrls, opt => opt.MapFrom(src => src.PhotoUrls))
                .ForMember(dest => dest.VideoUrls, opt => opt.MapFrom(src => src.VideoUrls))
                 .ForMember(dest => dest.PrimaryDamage, opt => opt.MapFrom(src => src.PrimaryDamage))
                  .ForMember(dest => dest.SecondaryDamage, opt => opt.MapFrom(src => src.SecondaryDamage))
                .ReverseMap()
                .ForMember(src => src.PhotoUrls, opt => opt.Ignore())
                .ForMember(src => src.VideoUrls, opt => opt.Ignore())
                .ForMember(src => src.Location, opt => opt.Ignore());

            CreateMap<CarCreateDto, Car>()
                .ForMember(dest => dest.PhotoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.VideoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ForMember(dest => dest.LocationId, opt => opt.MapFrom(src => src.LocationId))
                .ReverseMap()
                .ForMember(src => src.Image, opt => opt.Ignore())
                .ForMember(src => src.ImagePath, opt => opt.Ignore());

            CreateMap<CarUpdateDto, Car>()
                .ForMember(dest => dest.PhotoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.VideoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoUrls, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(src => src.ImageCar, opt => opt.Ignore());

            #endregion
            #region Location
            CreateMap<Location, LocationGetDto>().ReverseMap();
            CreateMap<Location, LocationDetailDto>().ReverseMap();
            CreateMap<LocationCreateDto, Location>().ReverseMap();
            CreateMap<LocationUpdateDto, Location>().ReverseMap();
            #endregion
            #endregion

            #region Identity

            //  Register
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ReverseMap();

            //  Login
            CreateMap<LoginDto, ApplicationUser>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ReverseMap();

            //  Forgot Password
            CreateMap<ForgotPasswordDto, ApplicationUser>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ReverseMap();

            //  Reset Password
            CreateMap<ResetPasswordDto, ApplicationUser>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ReverseMap();

            //  Resend Confirmation
            CreateMap<ResendConfirmationDto, ApplicationUser>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ReverseMap();

            //  Update User
            CreateMap<UpdateUserDto, ApplicationUser>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth))
                .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom(src => src.ProfilePicture))
                .ReverseMap();

            //  User
            CreateMap<ApplicationUser, UserDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom(src => src.ProfilePicture))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth))
                .ReverseMap();

            //  Auth Response
            CreateMap<ApplicationUser, AuthResponseDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.Token, opt => opt.Ignore())
                .ForMember(dest => dest.ExpiresAt, opt => opt.Ignore())
                .ReverseMap();

            //  Token Generation
            CreateMap<TokenGenerationRequest, AuthResponseDto>()
               .ForMember(dest => dest.User, opt => opt.Ignore())
               .ForMember(dest => dest.Token, opt => opt.Ignore())
               .ForMember(dest => dest.ExpiresAt, opt => opt.MapFrom(src => src.ExpiresAt))
               .ReverseMap();

            //  Validate Token (Request & Response)
            CreateMap<ValidateTokenRequest, ValidateTokenResponse>()
                .ReverseMap();

            #endregion


        }
    }
}
