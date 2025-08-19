using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class ShiftDto
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public ShiftType Type { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int StationCount { get; set; }
    }
}
