using AutoriaFinal.Application.Exceptions;
using AutoriaFinal.Contract.Dtos.Identity;
using AutoriaFinal.Contract.Dtos.Identity.Token;
using AutoriaFinal.Contract.Services.Email;
using AutoriaFinal.Contract.Services.Identity;
using AutoriaFinal.Contract.Services.Token;
using AutoriaFinal.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Application.Services.Identity
{
    public class AuthService : IAuthService
    {
        #region Register and Login Methods
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IEmailService emailService,
            IConfiguration configuration,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _emailService = emailService;
            _configuration = configuration;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new UserAlreadyExistsException(dto.Email);
            }
            var newUser = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email
            };
            var result = await _userManager.CreateAsync(newUser, dto.Password);
            if (!result.Succeeded)
            {
                throw new Exception(
                    $"Failed to create the user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
            await EnsureRoleExistsAsync("Member");
            await _userManager.AddToRoleAsync(newUser, "Member");


            var baseUrl = _configuration["App:BaseUrl"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
            var confirmUrl = $"{baseUrl}/api/auth/confirmemail?userId={newUser.Id}&token={Uri.EscapeDataString(token)}";

            await _emailService.SendEmailAsync(newUser.Email, "Confirm your email",
                $"Zəhmət olmasa emailinizi təsdiqləmək üçün <a href='{confirmUrl}'>buraya klikləyin</a>.");

            return new AuthResponseDto
            {
                UserId = newUser.Id,
                Email = newUser.Email!,
                Token = string.Empty, // Token yalnız Login zamanı veriləcək
                ExpiresAt = DateTime.UtcNow
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                throw new Exception("Invalid email or password");
            }

            if (!user.EmailConfirmed)
            {
                throw new Exception("Email is not confirmed yet");
            }

            var roles = await _userManager.GetRolesAsync(user);
                      
            var role = roles.FirstOrDefault() ?? "Member";

            var (token, expires) = await GenerateJwtToken(user, role);

            return new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email!,
                Token = token,
                ExpiresAt = expires
            };
            #endregion
    }

        #region Private Helper Methods

        private async Task EnsureRoleExistsAsync(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = roleName });
            }
        }

        private async Task<(string Token, DateTime Expires)> GenerateJwtToken(ApplicationUser user, string role)
        {
            var expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "60"));

            var request = new TokenGenerationRequest
            {
                UserId = user.Id,
                Email = user.Email!,
                Role = role,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = expires
            };

            // Token və Expire dəyərlərini tuple kimi al
            var (token, exp) = await _tokenService.GenerateTokenAsync(request);

            return (token, exp);
        }
        #endregion
    }
}
