using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Car;

using AutoriaFinal.Domain.Entities.Auctions;
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
            //Auctions

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

        }
    }
}
