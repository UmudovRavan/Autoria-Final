using AutoriaFinal.Contract.Dtos.Identity;
using AutoriaFinal.Contract.Services.Identity;
using AutoriaFinal.Domain.Entities.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AutoriaFinal.API.Controllers.Identity
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        #region Register
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto),StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        #endregion
        #region Login
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        [HttpGet("confirmemail")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        #endregion
        #region ConfirmEmail
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token,
            [FromServices] UserManager<ApplicationUser> userManager)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest("Invalid User Id");
            var result = await userManager.ConfirmEmailAsync(user, token);
            if(!result.Succeeded)
                return BadRequest("Email confirmation failed");
            return Ok("Email confirmed successfully");
        }
        #endregion
    }
}
