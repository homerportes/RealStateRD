
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services;
using InfraestructureLayer.Data;
using InfraestructureLayer.Security;
using Microsoft.EntityFrameworkCore;
using InfraestructureLayer.Seeders; 
using DomainLayerr.Interfaces;       
using Microsoft.Extensions.Configuration; 
using Microsoft.Extensions.DependencyInjection; 


namespace BienesRaicesBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("RealStateDB")));

            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
            builder.Services.Configure<RefreshTokenSettings>(builder.Configuration.GetSection("RefreshTokenSettings"));

            builder.Services.AddScoped<IUserRepository, InfraestructureLayer.Data.Repositories.UserRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
            builder.Services.AddScoped<IJwtSettings>(sp =>
                sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<JwtSettings>>().Value);


            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                AdminSeeder.SeedAdmins(context, config);
            }

            app.Run();
        }
    }
}
