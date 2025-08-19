using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class TimeSlotDto
    {
        public int Id { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int MaxCapacity { get; set; }
        public int CurrentBookings { get; set; }
        public int AvailableSlots => MaxCapacity - CurrentBookings;
    }
}
