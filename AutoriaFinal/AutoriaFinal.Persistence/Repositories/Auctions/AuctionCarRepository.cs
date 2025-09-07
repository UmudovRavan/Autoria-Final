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

        public async Task<AuctionCar?> GetWithMediaAsync(Guid id)
            => await _context.AuctionCars
                    .Include(m => m.Medias)
                    .Include(b => b.Bids)
                    .FirstOrDefaultAsync(x => x.Id == id);
    }
}
