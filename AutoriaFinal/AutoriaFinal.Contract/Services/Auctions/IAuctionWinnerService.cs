using AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner;
using AutoriaFinal.Domain.Entities.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Auctions
{
    public interface IAuctionWinnerService : IGenericService<
        AuctionWinner,
        AuctionWinnerGetDto,
        AuctionWinnerDetailDto,
        AuctionWinnerCreateDto,
        AuctionWinnerUpdateDto>
    {
        Task<AuctionWinnerDetailDto?> GetByAuctionCarIdAsync(Guid auctionCarId);
        Task<IEnumerable<AuctionWinnerGetDto>> GetByUserIdAsync(Guid userId);

        Task<bool> MarkPaidAsync(Guid winnerId, decimal amount);
        Task<bool> CancelAsync(Guid winnerId);
    }
}
