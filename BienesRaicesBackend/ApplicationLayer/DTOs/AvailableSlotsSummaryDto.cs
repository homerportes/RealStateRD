using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class AvailableSlotsSummaryDto
    {
        public int Total { get; set; }
        public List<TimeSlotSummaryDto> Next5 { get; set; } = new();

    }
}
