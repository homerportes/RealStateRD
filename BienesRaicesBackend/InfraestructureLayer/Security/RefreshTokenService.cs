using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Security
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly RefreshTokenSettings _settings;

        public RefreshTokenService(IOptions<RefreshTokenSettings> settings)
        {
            _settings = settings.Value;
        }
        public RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken
            {
                Token = Guid.NewGuid().ToString(),
                Expires = DateTime.UtcNow.AddDays(_settings.ExpiryInDays)
            };
        }
    }
}
