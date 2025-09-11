//using AutoMapper;
//using AutoriaFinal.Contract.Dtos.Auctions.Auction;
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
//    public class AuctionService : GenericService<
//         Auction,
//         AuctionGetDto, 
//         AuctionDetailDto, 
//         AuctionCreateDto, 
//         AuctionUpdateDto>, 
//         IAuctionService
//    {
//        private readonly IAuctionRepository _auctionRepository;
//        private readonly IMapper _mapper;
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly ILogger<AuctionService> _logger;

//        public AuctionService(
//            IAuctionRepository auctionRepository,
//            IMapper mapper,
//            IUnitOfWork unitOfWork,
//            ILogger<AuctionService> logger)
//            : base(auctionRepository, mapper, unitOfWork)
//        {
//            _auctionRepository = auctionRepository;
//            _mapper = mapper;
//            _unitOfWork = unitOfWork;
//            _logger = logger;
//        }


//        public Task<bool> CancelAuctionsAsync(Guid auctionId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> EndAuctionsAsync(Guid auctionId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<IEnumerable<AuctionGetDto>> GetActiveAuctionsAsync()
//        {
//            throw new NotImplementedException();
//        }

//        public Task<IEnumerable<AuctionGetDto>> GetByLocationAsync(Guid locationId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<IEnumerable<AuctionGetDto>> GetUpcomingAuctionsAsync(DateTime from, DateTime to)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> SettleAuctionsAsync(Guid auctionId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> StartAuctionsAsync(Guid auctionId)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}
