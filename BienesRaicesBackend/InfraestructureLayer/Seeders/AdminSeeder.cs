using DomainLayerr.Entities;
using DomainLayerr.Enums;
using InfraestructureLayer.Data;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Seeders
{
    public class AdminSeeder
    {
        public static void SeedAdmins(AppDbContext context, IConfiguration configuration)
        {
            // Leer lista de admins desde appsettings.json
            var admins = configuration.GetSection("AdminSettings:AdminConfigs").Get<List<AdminConfig>>();

            foreach (var adminConfig in admins)
            {
                // Solo crear si no existe
                if (!context.Users.Any(u => u.Email == adminConfig.Email))
                {
                    var admin = new User
                    {
                        Username = adminConfig.Username,
                        Email = adminConfig.Email,
                        Role = RoleType.Admin
                    };

                    CreatePasswordHash(adminConfig.Password, out byte[] hash, out byte[] salt);
                    admin.PasswordHash = hash;
                    admin.PasswordSalt = salt;

                    context.Users.Add(admin);
                }
            }

            context.SaveChanges();
        }

        // ===========================
        // MÉTODO AUXILIAR PARA HASH
        // ===========================
        private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            salt = RandomNumberGenerator.GetBytes(128 / 8);
            hash = KeyDerivation.Pbkdf2(
                password,
                salt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                256 / 8
            );
        }
    }
}

