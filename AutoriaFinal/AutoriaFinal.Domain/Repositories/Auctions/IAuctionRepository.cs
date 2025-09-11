using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Repositories.Auctions
{
    public interface IAuctionRepository : IGenericRepository<Auction>
    {
        Task<IEnumerable<Auction>> GetActiveAuctionsAsync();
        Task<IEnumerable<Auction>> GetAuctionsByLocationAsync(Guid locationId);
        Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync(DateTime from, DateTime to);
    }
}
