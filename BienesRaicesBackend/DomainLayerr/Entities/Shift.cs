using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class Shift
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public ShiftType Type { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int StationCount { get; set; }
        public List<TimeSlot> TimeSlots { get; set; } = new();
        public int ConfigurationId { get; set; }
        public Configuration Configuration { get; set; } = null!;
    }
}
