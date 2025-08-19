using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class UserBookingSummaryDto
    {
        public int Total { get; set; }
        public int Confirmed { get; set; }
        public int Cancelled { get; set; }
        public List<BookingSummaryDto> Recent { get; set; } = new();
    }
}
