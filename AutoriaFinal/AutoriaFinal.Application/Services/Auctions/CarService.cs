using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Car;
using AutoriaFinal.Contract.Services;
using AutoriaFinal.Contract.Services.Auctions;
using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Repositories;
using AutoriaFinal.Domain.Repositories.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Application.Services.Auctions
{
    public class CarService : GenericService<
        Car,
        CarGetDto,
        CarDetailDto,
        CarCreateDto,
        CarUpdateDto>,
        ICarService
    {
        private readonly ICarRepository _carRepository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILocationRepository _locationRepository;
        public CarService(
            ICarRepository carRepository,
            ILocationRepository locationRepository,
            IFileStorageService fileStorageService,
            IMapper mapper,
            IUnitOfWork unitOfWork)
            : base(carRepository, mapper, unitOfWork)
        {
            _carRepository = carRepository ?? throw new ArgumentNullException(nameof(carRepository));
            _locationRepository = locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
            _fileStorageService = fileStorageService ?? throw new ArgumentNullException(nameof(fileStorageService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }
        public override async Task<CarDetailDto> AddAsync(CarCreateDto dto)
        {
            if (dto is null)
                throw new Exception("Create DTO cannot be null");

            if (string.IsNullOrWhiteSpace(dto.Vin))
                throw new Exception("Car VIN is required.");
            var location = await _locationRepository.GetByIdAsync(dto.LocationId);
            if (location is null)
                throw new Exception($"Location with ID {dto.LocationId} not found.");
            if (dto.Image != null)
            {
                var imagePath = await _fileStorageService.SaveFileAsync(dto.Image, "images/car");
                dto.ImagePath = imagePath;
            }

            var entity = _mapper.Map<Car>(dto);
            await _carRepository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<CarDetailDto>(entity);
        }
        public async Task<CarDetailDto?> GetByVinAsync(string vin)
        {
           var entity = await _carRepository.GetByVinAsync(vin);
            if (entity is null)
                throw new Exception($"Car with VIN {vin} not found.");
            return _mapper.Map<CarDetailDto>(entity);
        }


    }
}
