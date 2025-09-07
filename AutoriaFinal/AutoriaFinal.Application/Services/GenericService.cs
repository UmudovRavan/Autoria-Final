using AutoMapper;
using AutoriaFinal.Contract.Services;
using AutoriaFinal.Domain.Entities.Abstractions;
using AutoriaFinal.Domain.Repositories;
using AutoriaFinal.Domain.Repositories.Auctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Application.Services
{
    public class GenericService<TEntity, TGetDto, TDetailDto, TCreateDto, TUpdateDto>
    : IGenericService<TEntity, TGetDto, TDetailDto, TCreateDto, TUpdateDto>
    where TEntity : BaseEntity, new()
    where TGetDto : class, new()
    where TDetailDto : class, new()
    where TCreateDto : class, new()
    where TUpdateDto : class, new()
    {
        protected readonly IGenericRepository<TEntity> _repository;
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;

        public GenericService(
            IGenericRepository<TEntity> repository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<IEnumerable<TGetDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TGetDto>>(entities);
        }

        public async Task<TDetailDto> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity is null)
                throw new Exception($"{typeof(TEntity).Name} with ID {id} not found");

            return _mapper.Map<TDetailDto>(entity);
        }

        public virtual async Task<TDetailDto> AddAsync(TCreateDto dto)
        {
            if (dto is null)
                throw new Exception("Create DTO cannot be null");

            var entity = _mapper.Map<TEntity>(dto);
            await _repository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<TDetailDto>(entity);
        }

        public virtual async Task<TDetailDto> UpdateAsync(Guid id, TUpdateDto dto)
        {
            if (dto is null)
                throw new Exception("Update DTO cannot be null");

            var existing = await _repository.GetByIdAsync(id);

            if (existing is null)
                throw new Exception($"{typeof(TEntity).Name} with ID {id} not found");

            _mapper.Map(dto, existing);

            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<TDetailDto>(existing);


        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
                throw new Exception($"{typeof(TEntity).Name} with ID {id} not found");

            await _repository.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

       
    }

}