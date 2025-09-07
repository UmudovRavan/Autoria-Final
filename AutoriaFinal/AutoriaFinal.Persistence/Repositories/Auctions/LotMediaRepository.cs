using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Repositories.Auctions;
using AutoriaFinal.Persistence.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Repositories.Auctions
{
    public class LotMediaRepository : GenericRepository<LotMedia>, ILotMediaRepository
    {
        public LotMediaRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IQueryable<LotMedia>> GetByLotAsync(Guid lotId)
            =>await Task.FromResult(_context.LotMedias.Where(m => m.AuctionCarId == lotId).AsQueryable());
    }
}
