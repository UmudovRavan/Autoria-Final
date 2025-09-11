using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Repositories.Auctions
{
    public interface IAuctionCarRepository : IGenericRepository<AuctionCar>
    {
        Task<AuctionCar?> GetByLotNumberAsync(string lotNumber);
        Task<IEnumerable<AuctionCar>> GetByAuctionIdAsync(Guid auctionId);
        Task<decimal?> GetCurrentPriceAsync(Guid auctionCarId);
    }
}
