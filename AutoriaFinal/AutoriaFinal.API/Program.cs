using AutoriaFinal.Application.Extensions;
using AutoriaFinal.Application.Profiles;
using AutoriaFinal.Domain.Entities.Identity;
using AutoriaFinal.Infrastructure.DependencyInjection;
using AutoriaFinal.Persistence.Data;
using AutoriaFinal.Persistence.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Threading.Tasks;
using Serilog;
using AutoriaFinal.API.ExceptionHandler;
using AutoriaFinal.API.Hubs;

namespace AutoriaFinal.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ✅ CORS - ƏN ƏVVƏLDƏ
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(
                        "http://127.0.0.1:5500", 
                        "http://localhost:5500",
                        "https://localhost:5500",
                        "http://localhost:3000",
                        "https://localhost:7249",  // ✅ Bu əlavə et
                         "http://localhost:7249"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            // ✅ Controllers
            builder.Services.AddControllers();

            // ✅ SignalR - JWT dəstəyi ilə
            builder.Services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            });

            // ✅ AutoMapper
            builder.Services.AddAutoMapper(opt =>
            {
                opt.AddProfile(new CustomProfile());
            });

            // ✅ Serilog - File path problemi həll edildi
            builder.Host.UseSerilog((context, configuration) =>
            {
                configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .WriteTo.Console()
                    .WriteTo.File(
                        path: Path.Combine(Directory.GetCurrentDirectory(), "logs", "log-.txt"),
                        rollingInterval: RollingInterval.Day,
                        shared: true,
                        retainedFileCountLimit: 30
                    );
            });

            // ✅ Exception Handlers
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddExceptionHandler<AppExceptionHandler>();
            builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
            builder.Services.AddExceptionHandler<NotFoundExceptionHandler>();
            builder.Services.AddExceptionHandler<ConflictExceptionHandler>();
            builder.Services.AddExceptionHandler<UnauthorizedExceptionHandler>();

            // ✅ DbContext
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("AutoriaDb")));

            // ✅ Repository & Application services
            builder.Services.AddRepositoriesRegistration();
            builder.Services.AddServiceRegistration();

            // ✅ Email Service
            builder.Services.Configure<EmailSettings>(
                builder.Configuration.GetSection("Email"));
            builder.Services.AddInfrastructureServices();

            // ✅ Identity - DÜZƏLDİLMİŞ
            builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.Password.RequireDigit = false; // Test üçün sadələşdirdim
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;

                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false; // Test üçün false
                
                options.Lockout.AllowedForNewUsers = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            // ✅ JWT Authentication - TAM DÜZƏLDİLMİŞ
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // Development üçün
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    RequireExpirationTime = true
                };

                // ✅ SignalR üçün JWT dəstəyi
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        // ✅ Hub path-ləri düzəlt
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/auctionHub") || path.StartsWithSegments("/bidHub")))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            // ✅ Authorization
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                options.AddPolicy("RequireSellerRole", policy => policy.RequireRole("Seller", "Admin"));
                options.AddPolicy("RequireAuctionManagerRole", policy => policy.RequireRole("AuctionManager", "Admin"));
            });

            // ✅ Swagger - JWT dəstəyi ilə
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo 
                { 
                    Title = "Autoria Auction API", 
                    Version = "v1",
                    Description = "API for auction management system"
                });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer abcdef12345\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();



            using (var scope = app.Services.CreateScope())
            {

                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

                await RoleSeeder.SeedRolesAsync(roleManager);

                // ✅ Sizin user-ə rollar təyin et - string ID istifadə edin
                await RoleSeeder.AssignUserToRoleAsync(userManager, "9f8bbe66-5499-4790-8e3e-011a4cbda67d", "Admin");
                await RoleSeeder.AssignUserToRoleAsync(userManager, "9f8bbe66-5499-4790-8e3e-011a4cbda67d", "Seller");


            }

            // ✅ Exception Handling
            app.UseExceptionHandler(_ => { });

            // ✅ Development pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Autoria Auction API v1");
                    c.RoutePrefix = string.Empty; // Swagger UI-ni root-da açır
                });
            }

            // ✅ MIDDLEWARE SİRALAMASI - ÇOX VACİBDİR!
            app.UseHttpsRedirection();

            // CORS - Authentication-dan əvvəl
            app.UseCors();

            // Static Files (optional)
            app.UseStaticFiles();

            // Routing
            app.UseRouting();

            // Authentication - Authorization-dan əvvəl
            app.UseAuthentication();
            app.UseAuthorization();

            // Controllers
            app.MapControllers();

            // ✅ SignalR Hubs
            app.MapHub<AuctionHub>("/auctionHub");
            app.MapHub<BidHub>("/bidHub");

            // ✅ Health Check endpoint
            app.MapGet("/health", () => Results.Ok(new { 
                Status = "✅ Healthy", 
                Timestamp = DateTime.UtcNow,
                Environment = app.Environment.EnvironmentName,
                Version = "1.0.0"
            }));

            // ✅ API Info endpoint
            app.MapGet("/api/info", () => Results.Ok(new {
                ApplicationName = "🏆 Autoria Auction API",
                Version = "1.0.0",
                Author = "ravanmu-coder",
                Timestamp = DateTime.UtcNow,
                Endpoints = new[] {
                    "GET /api/auction - Get all auctions",
                    "POST /api/auction - Create auction",
                    "GET /health - Health check",
                    "GET /auctionHub - SignalR Hub",
                    "GET /swagger - API Documentation"
                }
            }));

            // ✅ Console-da startup mesajı
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            
            app.Lifetime.ApplicationStarted.Register(() =>
            {
                logger.LogInformation("🎯 === AUTORIA AUCTION API STARTED ===");
                logger.LogInformation("🌐 Swagger UI: https://localhost:7249");
                logger.LogInformation("📡 SignalR Hub: https://localhost:7249/auctionHub");
                logger.LogInformation("💚 Health Check: https://localhost:7249/health");
                logger.LogInformation("📊 API Info: https://localhost:7249/api/info");
                logger.LogInformation("👨‍💻 Developer: ravanmu-coder");
            });

            app.Run();
        }
    }
}