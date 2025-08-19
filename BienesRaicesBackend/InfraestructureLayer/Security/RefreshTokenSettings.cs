using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Security
{
    public class RefreshTokenSettings
    {
        public int ExpiryInDays { get; set; } = 7;
    }
}
