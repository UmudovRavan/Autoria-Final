using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Auctions
{
    public interface IAuctionCarService : IGenericService<
        AuctionCar,
        AuctionCarGetDto,
        AuctionCarDetailDto,
        AuctionCarCreateDto,
        AuctionCarUpdateDto>
    {
        Task<AuctionCarDetailDto?> GetByLotNumberAsync(string lotNumber);
        Task<IEnumerable<AuctionCarGetDto>> GetByAuctionIdAsync(Guid auctionId);
        Task<decimal?> GetCurrentPriceAsync(Guid auctionCarId);
    }
}
