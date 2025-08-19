using DomainLayerr.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user, TimeSpan? expiry = null);
        int? GetUserIdFromToken(string token);

    }
}
