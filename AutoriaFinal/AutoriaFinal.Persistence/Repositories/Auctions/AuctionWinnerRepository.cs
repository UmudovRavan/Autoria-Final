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
    public class AuctionWinnerRepository : GenericRepository<AuctionWinner>, IAuctionWinnerRepository
    {
        public AuctionWinnerRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<AuctionWinner?> GetByAuctionCarIdAsync(Guid auctionCarId)
        {
            return await _context.AuctionWinners
                .FirstOrDefaultAsync(aw => aw.AuctionCarId == auctionCarId);
        }

        public async Task<IEnumerable<AuctionWinner>> GetByUserIdAsync(Guid userId)
        {
            return await _context.AuctionWinners
                .Where(aw => aw.UserId == userId)
                .ToListAsync();
        }
    }
}
