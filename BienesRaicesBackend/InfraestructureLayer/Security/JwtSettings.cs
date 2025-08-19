using DomainLayerr.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Security
{
    public class JwtSettings : IJwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int? DefaultExpiryInMinutes { get; set; } = 60;
        public int? AdminExpiryInMinutes { get; set; } = 480;
    }
}
