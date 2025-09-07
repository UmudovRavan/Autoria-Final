using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Contract.Dtos.Identity
{
    public record UserResponseDto (
         Guid Id,
        string Name,
        string Email,
        bool EmailConfirmed);
}
