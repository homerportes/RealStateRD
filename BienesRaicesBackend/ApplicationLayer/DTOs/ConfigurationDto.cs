using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class ConfigurationDto
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AppointmentDurationMinutes { get; set; }
        public List<ShiftDto> Shifts { get; set; } = new();
        public int TimeSlotsCount { get; set; }
    }
}
