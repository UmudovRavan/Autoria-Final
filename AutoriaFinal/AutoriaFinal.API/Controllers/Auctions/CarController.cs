using AutoriaFinal.Contract.Dtos.Auctions.Car;
using AutoriaFinal.Contract.Services.Auctions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AutoriaFinal.API.Controllers.Auctions
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly ICarService _carService;
        public CarController(ICarService carService)
        {
            _carService = carService;
        }
        //GET api/car
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cars = await _carService.GetAllAsync();
            return Ok(cars);
        }
        //GET api/car/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var car = await _carService.GetByIdAsync(id);
            if (car == null)
                return NotFound();
            return Ok(car);
        }
        //POST api/car
        [HttpPost]
        public async Task<IActionResult> Create([FromBody]CarCreateDto dto)
        {
            var created = await _carService.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        // Updated method to use CarResponseDto instead of CarRequestDto
        [HttpPut("{id}")]
        
        public async Task<IActionResult> Update(Guid id, [FromBody] CarUpdateDto dto)
        {
            var updated = await _carService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        //DELETE api/car/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _carService.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }
        //GET api/car/vin/{vin}
        [HttpGet("vin/{vin}")]
        public async Task<IActionResult> GetByVin(string vin)
        {
            var car = await _carService.GetByVinAsync(vin);
            if (car == null)
                return NotFound();
            return Ok(car);
        }


    }
}
