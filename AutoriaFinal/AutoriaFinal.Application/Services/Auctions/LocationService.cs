using AutoMapper;
using AutoriaFinal.Contract.Dtos.Auctions.Location;
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
    public class LocationService : GenericService<
        Location,
        LocationGetDto,
        LocationDetailDto,
        LocationCreateDto,
        LocationUpdateDto>,ILocationService
    {
        private readonly ILocationRepository _locationRepository;
        private readonly IMapper _mapper;
        public LocationService(
            ILocationRepository locationRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
            : base(locationRepository, mapper, unitOfWork)
        {
            _locationRepository = locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<LocationDetailDto?> GetByNameAsync(string name)
        {
            var entity = await _locationRepository.GetByNameAsync(name);
            return entity == null ? null : _mapper.Map<LocationDetailDto>(entity);
        }
    }
}
