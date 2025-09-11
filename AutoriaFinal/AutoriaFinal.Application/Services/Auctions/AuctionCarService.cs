//using AutoMapper;
//using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
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
//    public class AuctionCarService : GenericService<
//        AuctionCar,
//        AuctionCarGetDto,
//        AuctionCarDetailDto,
//        AuctionCarCreateDto,
//        AuctionCarUpdateDto>, IAuctionCarService
//    {
//        private readonly IAuctionCarRepository _auctionCarRepository;
//        private readonly IMapper _mapper;
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly ILogger<AuctionCarService> _logger;
//        public AuctionCarService(
//           IAuctionCarRepository auctionCarRepository,
//           IMapper mapper,
//           IUnitOfWork unitOfWork,
//           ILogger<AuctionCarService> logger)
//           : base(auctionCarRepository, mapper, unitOfWork)
//        {
//            _auctionCarRepository = auctionCarRepository;
//            _mapper = mapper;
//            _unitOfWork = unitOfWork;
//            _logger = logger;
//        }

//        public Task<IEnumerable<AuctionCarGetDto>> GetByAuctionIdAsync(Guid auctionId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<AuctionCarDetailDto?> GetByLotNumberAsync(string lotNumber)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<decimal?> GetCurrentPriceAsync(Guid auctionCarId)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}
