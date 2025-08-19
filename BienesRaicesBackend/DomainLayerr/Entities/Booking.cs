using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        public int TimeSlotId { get; set; }
        public TimeSlot TimeSlot { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    }
}
