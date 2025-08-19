using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class TimeSlot
    {
        public int Id { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int MaxCapacity { get; set; }
        public int CurrentBookings { get; set; }
        public int ConfigurationId { get; set; }
        public Configuration Configuration { get; set; } = null!;
        public int ShiftId { get; set; }
        public Shift Shift { get; set; } = null!;
        public List<Booking> Bookings { get; set; } = new();
    }
}
