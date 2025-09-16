using AutoMapper;
using AutoriaFinal.Application.Exceptions;
using AutoriaFinal.Contract.Dtos.Auctions.Car;
using AutoriaFinal.Contract.Services;
using AutoriaFinal.Contract.Services.Auctions;
using AutoriaFinal.Domain.Entities.Auctions;
using AutoriaFinal.Domain.Repositories;
using AutoriaFinal.Domain.Repositories.Auctions;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<CarService> _logger;
        public CarService(  
      ICarRepository carRepository,
      ILocationRepository locationRepository,
      IFileStorageService fileStorageService,
      IMapper mapper,
      IUnitOfWork unitOfWork,
      ILogger<GenericService<Car, CarGetDto, CarDetailDto, CarCreateDto, CarUpdateDto>> baseLogger,
      ILogger<CarService> logger)   
      : base(carRepository, mapper, unitOfWork, baseLogger)
        {
            _carRepository = carRepository;
            _locationRepository = locationRepository;
            _fileStorageService = fileStorageService;
            _mapper = mapper;
            _logger = logger;
        }
        public override async Task<CarDetailDto> AddAsync(CarCreateDto dto)
        {
            _logger.LogInformation("Attempting to add a new car...");

            if (dto is null)
            {
                _logger.LogWarning("Car creation failed: DTO is null");
                throw new BadRequestException("Car information cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(dto.Vin))
            {
                _logger.LogWarning("Car creation failed: VIN is empty");
                throw new BadRequestException("Car VIN is required.");
            }

            var location = await _locationRepository.GetByIdAsync(dto.LocationId);
            if (location is null)
            {
                _logger.LogWarning("Car creation failed: Location with ID {LocationId} not found", dto.LocationId);
                throw new NotFoundException("Location", dto.LocationId);
            }

            if (dto.Image != null)
            {
                _logger.LogInformation("Saving car image for VIN {Vin}", dto.Vin);
                var imagePath = await _fileStorageService.SaveFileAsync(dto.Image, "images/car");
                dto.ImagePath = imagePath;
            }

            var entity = _mapper.Map<Car>(dto);
            await _carRepository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Car with VIN {Vin} added successfully (ID: {CarId})", entity.Vin, entity.Id);

            return _mapper.Map<CarDetailDto>(entity);
        }

        public async Task<CarDetailDto?> GetByVinAsync(string vin)
        {
            _logger.LogInformation("Fetching car by VIN {Vin}", vin);

            var entity = await _carRepository.GetByVinAsync(vin);
            if (entity is null)
            {
                _logger.LogWarning("Car with VIN {Vin} not found", vin);
                throw new BadRequestException($"Car with VIN {vin} not found.");
            }

            _logger.LogInformation("Car with VIN {Vin} retrieved successfully", vin);
            return _mapper.Map<CarDetailDto>(entity);
        }

    }
}
