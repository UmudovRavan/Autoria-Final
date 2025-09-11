using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Repositories.Auctions
{
    public interface IAuctionWinnerRepository : IGenericRepository<AuctionWinner>
    {
        Task<AuctionWinner?> GetByAuctionCarIdAsync(Guid auctionCarId);
        Task<IEnumerable<AuctionWinner>> GetByUserIdAsync(Guid userId);
    }
}
