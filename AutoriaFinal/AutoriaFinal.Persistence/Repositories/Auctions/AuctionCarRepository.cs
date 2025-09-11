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
    public class AuctionCarRepository : GenericRepository<AuctionCar>, IAuctionCarRepository
    {
        public AuctionCarRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AuctionCar>> GetByAuctionIdAsync(Guid auctionId)
        {
            return await _context.AuctionCars
                .Where(ac => ac.AuctionId == auctionId)
                .Include(ac => ac.Bids)
                .ToListAsync();
        }

        public async Task<AuctionCar?> GetByLotNumberAsync(string lotNumber)
        {
            return await _context.AuctionCars
                .Include(ac => ac.Bids)
                .FirstOrDefaultAsync(ac => ac.LotNumber == lotNumber);
        }

        public async Task<decimal?> GetCurrentPriceAsync(Guid auctionCarId)
        {
            return await _context.AuctionCars
                .Where(ac=>ac.Id == auctionCarId)
                .Select(ac=>(decimal?)ac.CurrentPrice)
                .FirstOrDefaultAsync();
        }
    }
}
