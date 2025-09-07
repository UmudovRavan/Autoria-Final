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
        public CarService(
            ICarRepository carRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService) : base(carRepository, mapper,unitOfWork)
        {
            _carRepository = carRepository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }
        public override async Task<CarDetailDto> AddAsync(CarCreateDto dto)
        {
            if (dto is null)
                throw new Exception("Create DTO cannot be null");

            if (string.IsNullOrWhiteSpace(dto.Vin))
                throw new Exception("Car VIN is required.");

           
            if (dto.Image != null)
            {
                var imagePath = await _fileStorageService.SaveFileAsync(dto.Image, "images/pokemons");
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
                throw new Exception($"Pokémon with ID {vin} not found.");
            return _mapper.Map<CarDetailDto>(entity);
        }





        //public async Task<CarResponseDto?> GetByVinAsync(string vin)
        //{
        //    var cars = await _carRepository.GetByVinAsync(vin);
        //    return cars == null ? null : _mapper.Map<CarResponseDto>(cars);
        //}
    }
}
