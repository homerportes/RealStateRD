using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class TimeSlotSummaryDto
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public int Available { get; set; }
        public int MaxCapacity { get; set; }
    }
}
