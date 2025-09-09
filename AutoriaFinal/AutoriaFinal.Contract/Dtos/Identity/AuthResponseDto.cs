using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Identity
{
    public class AuthResponseDto
    {
        public string UserId { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
    }
}
