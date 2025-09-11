using AutoriaFinal.Contract.Dtos.Auctions.Auction;
using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Auctions
{
    public interface IAuctionService : IGenericService<
        Auction,
        AuctionGetDto,
        AuctionDetailDto,
        AuctionCreateDto,
        AuctionUpdateDto>
    {
        Task<IEnumerable<AuctionGetDto>> GetActiveAuctionsAsync();
        Task<IEnumerable<AuctionGetDto>> GetUpcomingAuctionsAsync(DateTime from, DateTime to);
        Task<IEnumerable<AuctionGetDto>> GetByLocationAsync(Guid locationId);

        Task<bool> StartAuctionsAsync(Guid auctionId);
        Task<bool> EndAuctionsAsync(Guid auctionId);
        Task<bool> CancelAuctionsAsync(Guid auctionId);
        Task<bool> SettleAuctionsAsync(Guid auctionId);
    }
}
