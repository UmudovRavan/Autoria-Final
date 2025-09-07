
using AutoriaFinal.Application.Services;
using AutoriaFinal.Application.Services.Auctions;
using AutoriaFinal.Contract.Services;
using AutoriaFinal.Contract.Services.Auctions;
using AutoriaFinal.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Application.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddServiceRegistration(this IServiceCollection services)
        {
            services.AddScoped(typeof(IGenericService<,,,,>), typeof(GenericService<,,,,>));
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
            services.AddScoped<ICarService, CarService>();
            return services;
        }
    }
}
