//using AutoMapper;
//using AutoriaFinal.Contract.Dtos.Auctions.AuctionWinner;
//using AutoriaFinal.Contract.Services.Auctions;
//using AutoriaFinal.Domain.Entities.Auctions;
//using AutoriaFinal.Domain.Repositories;
//using AutoriaFinal.Domain.Repositories.Auctions;
//using Microsoft.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace AutoriaFinal.Application.Services.Auctions
//{
//    public class AuctionWinnerService : GenericService<
//        AuctionWinner,
//        AuctionWinnerGetDto,
//        AuctionWinnerDetailDto,
//        AuctionWinnerCreateDto,
//        AuctionWinnerUpdateDto>, IAuctionWinnerService
//    {
//        private readonly IAuctionWinnerRepository _repository;
//        private readonly IMapper _mapper;
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly ILogger<AuctionWinnerService> _logger;
//        public AuctionWinnerService(
//           IAuctionWinnerRepository auctionWinnerRepository,
//           IMapper mapper,
//           IUnitOfWork unitOfWork,
//           ILogger<AuctionWinnerService> logger)
//           : base(auctionWinnerRepository, mapper, unitOfWork)
//        {
//            _repository = auctionWinnerRepository;
//            _mapper = mapper;
//            _unitOfWork = unitOfWork;
//            _logger = logger;
//        }

//        public Task<bool> CancelAsync(Guid winnerId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<AuctionWinnerDetailDto?> GetByAuctionCarIdAsync(Guid auctionCarId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<IEnumerable<AuctionWinnerGetDto>> GetByUserIdAsync(Guid userId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> MarkPaidAsync(Guid winnerId, decimal amount)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}
