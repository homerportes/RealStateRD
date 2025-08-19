using DomainLayerr.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface ITimeSlotRepository
    {
        Task<TimeSlot?> GetByIdAsync(int id);
        Task<List<TimeSlot>> GetAvailableSlotsAsync(DateTime startDate, DateTime endDate);
        Task UpdateAsync(TimeSlot timeSlot);
    }
}
