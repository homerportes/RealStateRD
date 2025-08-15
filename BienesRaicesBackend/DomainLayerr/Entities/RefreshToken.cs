using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime Expires { get; set; }
        public bool IsExpired => DateTime.UtcNow >= Expires;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
