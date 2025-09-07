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
    public class AuctionWinnerRepository : GenericRepository<AuctionWinner>, IAuctionWinnerRepository
    {
        public AuctionWinnerRepository(AppDbContext context) : base(context)
        {
        }
    }
}
