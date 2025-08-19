using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Interfaces
{
    public interface IJwtSettings
    {
        string Key { get; }
        string Issuer { get; }
        string Audience { get; }
        int? DefaultExpiryInMinutes { get; }
        int? AdminExpiryInMinutes { get; }
    }
}
