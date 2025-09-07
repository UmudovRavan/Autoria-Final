using AutoriaFinal.Contract.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

// 👈 IFormFile üçün lazım

namespace AutoriaFinal.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;

        public LocalFileStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }
        public async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            var uploadsRootFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", folder);
            if (!Directory.Exists(uploadsRootFolder))
                Directory.CreateDirectory(uploadsRootFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsRootFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Path.Combine(folder, uniqueFileName).Replace("\\", "/");
        }
        public Task DeleteFileAsync(string filePath)
        {
            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", filePath);
            if (File.Exists(fullPath))
                File.Delete(fullPath);

            return Task.CompletedTask;
        }

    }
}
