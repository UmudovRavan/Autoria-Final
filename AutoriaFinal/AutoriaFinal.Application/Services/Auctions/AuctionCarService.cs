//using AutoMapper;
//using AutoriaFinal.Application.Exceptions;
//using AutoriaFinal.Contract.Dtos.Auctions.AuctionCar;
//using AutoriaFinal.Contract.Services.Auctions;
//using AutoriaFinal.Domain.Entities.Auctions;
//using AutoriaFinal.Domain.Enums.AuctionEnums;
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
//       private readonly IAuctionCarRepository _auctionCarRepository;
//        private readonly IBidRepository _bidRepository;
//        private readonly IAuctionWinnerRepository _auctionWinnerRepository;
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly ILogger<AuctionCarService> _logger;
//        private readonly IMapper _mapper;
//        public AuctionCarService(
//            IGenericRepository<AuctionCar> repository,
//            IAuctionCarRepository auctionCarRepository,
//            IBidRepository bidRepository,
//            IAuctionWinnerRepository auctionWinnerRepository,
//            IMapper mapper,
//            IUnitOfWork unitOfWork,
//            ILogger<AuctionCarService> logger)
//            : base(repository, mapper, unitOfWork, logger)
//        {
//            _auctionCarRepository = auctionCarRepository;
//            _bidRepository = bidRepository;
//            _auctionWinnerRepository = auctionWinnerRepository;
//            _unitOfWork = unitOfWork;
//            _logger = logger;
//            _mapper = mapper;
//        }

//        public async Task<AuctionCarDetailDto> CompleteSaleAsync(Guid auctionCarId)
//        {
//            var auctionCar =  await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
//            if (auctionCar == null)
//                throw new NotFoundException(nameof(AuctionCar), auctionCarId);
//            auctionCar.CompleteSale();
//            await _unitOfWork.SaveChangesAsync();
//            _logger.LogInformation("Satış tamamlandı: AuctionCar {CarId}", auctionCarId);
//            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
//        }

//        public async Task<AuctionCarDetailDto> ConfirmWinnerAsync(Guid auctionCarId)
//        {
//            var auctionCar = await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
//            if (auctionCar == null)
//                throw new NotFoundException(nameof(AuctionCar), auctionCarId);
//            auctionCar.ConfirmWinner();
//            await _unitOfWork.SaveChangesAsync();
//            _logger.LogInformation("Winner təsdiqləndi: AuctionCar {CarId}", auctionCarId);

//            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
//        }

//        public async Task<AuctionCarDetailDto> MarkPaymentFailedAsync(Guid auctionCarId)
//        {
//            var auctionCar = await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
//            if (auctionCar == null)
//                throw new NotFoundException(nameof(AuctionCar), auctionCarId);

//            auctionCar.MarkPaymentFailed();

//            await _unitOfWork.SaveChangesAsync();
//            _logger.LogInformation("Payment failed: AuctionCar {CarId}", auctionCarId);

//            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
//        }

//        public async Task<AuctionCarDetailDto> MarkUnsoldAsync(Guid auctionCarId)
//        {
//            var auctionCar = await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
//            if (auctionCar == null)
//                throw new NotFoundException(nameof(AuctionCar), auctionCarId);

//            auctionCar.MarkUnsold();

//            await _unitOfWork.SaveChangesAsync();
//            _logger.LogInformation("Unsold işarələndi: AuctionCar {CarId}", auctionCarId);

//            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
//        }

//        public async Task<AuctionCarDetailDto> PlacePreBidAsync(Guid auctionCarId, Guid userId, decimal amount)
//        {
//            var auctionCar = await _auctionCarRepository.GetAuctionCarWithBidsAsync(auctionCarId);
//            if (auctionCar == null)
//                throw new NotFoundException(nameof(AuctionCar), auctionCarId);
//            if (amount < auctionCar.MinPreBid)
//                throw new ConflictException($"Minimum pre-bid {auctionCar.MinPreBid} olmalıdır.");

//            var bid = new Bid
//            {
//                AuctionCarId = auctionCarId,
//                UserId = userId,
//                Amount = amount,
//                IsPreBid = true
//            };
//            await _bidRepository.AddAsync(bid);
//            await _unitOfWork.SaveChangesAsync();

//            _logger.LogInformation("PreBid qoyuldu: User {UserId}, AuctionCar {CarId}, Amount {Amount}",
//                userId, auctionCarId, amount);

//            return _mapper.Map<AuctionCarDetailDto>(auctionCar);
//        }
//    }
//}
