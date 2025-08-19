using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class DashboardDto
    {
        public UserBookingSummaryDto MyBookings { get; set; } = null!;
        public AvailableSlotsSummaryDto AvailableSlots { get; set; } = null!;
        public int UserId { get; set; }
    }
}
