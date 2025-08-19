using DomainLayerr.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(int id);
        Task<List<Booking>> GetByUserIdAsync(int userId);
        Task<List<Booking>> GetAllAsync();
        Task<bool> HasUserBookingForSlotAsync(int userId, int timeSlotId);
        Task<bool> HasUserBookingForDateAsync(int userId, DateTime date);
        Task<int> CreateBookingWithConcurrencyCheckAsync(Booking booking);
        Task UpdateAsync(Booking booking);
    }
}
