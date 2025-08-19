using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class Configuration
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AppointmentDurationMinutes { get; set; }
        public List<Shift> Shifts { get; set; } = new();
        public List<TimeSlot> TimeSlots { get; set; } = new();

    }
}
