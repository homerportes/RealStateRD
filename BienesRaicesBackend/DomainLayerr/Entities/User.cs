using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public byte[] PasswordHash { get; set; } = [];
        public byte[] PasswordSalt { get; set; } = [];

        public RoleType Role { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = [];
    }
}
