using AutoriaFinal.Contract.Dtos.Auctions.Car;
using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Auctions
{
    public interface ICarService : IGenericService<
        Car,
        CarGetDto,
        CarDetailDto,
        CarCreateDto,
        CarUpdateDto>
    {
        Task<CarDetailDto?> GetByVinAsync(string vin);
    }
}
