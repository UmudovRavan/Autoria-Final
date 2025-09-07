using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Repositories.Auctions;
using AutoriaFinal.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Repositories.Auctions
{
    public class BidRepository : GenericRepository<Bid>, IBidRepository
    {
        public BidRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Bid?> GetHighestBidAsync(Guid lotId)
            => await _context.Bids.Where(b => b.AuctionCarId == lotId)
                       .OrderByDescending(b => b.Amount)
                       .FirstOrDefaultAsync();
    }
}
