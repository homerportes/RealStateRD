using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public DateTime BookingDate { get; set; }
        public TimeSlotDto? TimeSlot { get; set; }
        public BookingStatus Status { get; set; }
        public string StatusText => Status.ToString();
        public UserDto? User { get; set; }
    }
}
