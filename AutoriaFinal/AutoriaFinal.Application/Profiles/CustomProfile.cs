using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Car;
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
