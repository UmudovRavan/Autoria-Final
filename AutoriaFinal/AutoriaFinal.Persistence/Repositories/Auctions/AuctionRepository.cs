using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Enums.AuctionEnums;
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
    public class AuctionRepository : GenericRepository<Auction>, IAuctionRepository
    {
        public AuctionRepository(AppDbContext context) : base(context){}

        public async Task<IEnumerable<Auction>> GetActiveAuctionsAsync()
        {
            return await _context.Auctions
                .Where(a=>a.Status ==AuctionStatus.Running || a.Status == AuctionStatus.Scheduled)
                .Include(a=>a.AuctionCars)
                .ToListAsync(); 
        }

        public async Task<IEnumerable<Auction>> GetAuctionsByLocationAsync(Guid locationId)
        {
            return await _context.Auctions
                .Where(a=> a.LocationId == locationId)
                .Include(a => a.AuctionCars)
                .ToListAsync();
        }

        public async Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync(DateTime from, DateTime to)
        {
            return await _context.Auctions
                .Where(a=>a.StartTimeUtc>=from && a.StartTimeUtc<=to)
                .Include(a => a.AuctionCars)
                .ToListAsync();
        }
    }
}
