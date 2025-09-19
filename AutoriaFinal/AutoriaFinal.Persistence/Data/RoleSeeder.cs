using AutoriaFinal.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Persistence.Data
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
        {
            // ✅ Auction sistemi üçün lazım olan bütün rollar
            string[] roles = {
                "Admin",
                "Seller",
                "Member"
            };

            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var role = new ApplicationRole
                    {
                        Id = Guid.NewGuid().ToString(), // ✅ .ToString() əlavə edildi
                        Name = roleName,
                        NormalizedName = roleName.ToUpper(),
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    };

                    await roleManager.CreateAsync(role);
                }
            }
        }

        // ✅ Əlavə metod - Specific user üçün rol təyin etmək
        public static async Task AssignUserToRoleAsync(UserManager<ApplicationUser> userManager, string userId, string roleName)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user != null && !await userManager.IsInRoleAsync(user, roleName))
            {
                await userManager.AddToRoleAsync(user, roleName);
            }
        }
    }
}