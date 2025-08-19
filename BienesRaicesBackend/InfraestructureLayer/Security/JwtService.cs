using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Enums;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Security
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;

        public JwtService(IOptions<JwtSettings> settings)
        {
            _settings = settings.Value;
        }

        
        public string GenerateToken(User user, TimeSpan? expiry = null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenExpiry = expiry ?? (_settings.DefaultExpiryInMinutes.HasValue
                ? TimeSpan.FromMinutes(_settings.DefaultExpiryInMinutes.Value)
                : TimeSpan.FromHours(1));

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.Add(tokenExpiry),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }



        public int? GetUserIdFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            return int.TryParse(jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value, out var id)
                ? id
                : null;
        }
    }
}
