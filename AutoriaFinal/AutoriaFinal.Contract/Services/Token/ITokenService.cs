using AutoriaFinal.Contract.Dtos.Identity.Token;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Services.Token
{
    public interface ITokenService
    {
        Task<(string Token, DateTime Expires)> GenerateTokenAsync(TokenGenerationRequest request);
        Task<string> GenerateRefreshTokenAsync();
        Task<bool> ValidateTokenAsync(string token);
    }
}
