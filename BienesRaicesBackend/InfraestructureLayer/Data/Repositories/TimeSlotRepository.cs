using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Data.Repositories
{
    public class TimeSlotRepository : ITimeSlotRepository
    {
        private readonly AppDbContext _context;
        public TimeSlotRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TimeSlot?> GetByIdAsync(int id)
        {
            if (id <= 0) return null; 

            return await _context.TimeSlots
                .Include(t => t.Configuration)
                .Include(t => t.Shift)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<TimeSlot>> GetAvailableSlotsAsync(DateTime startDate, DateTime endDate)
        {
            if (endDate < startDate)
                throw new ArgumentException("End date must be after start date");

            return await _context.TimeSlots
                .Where(t => t.SlotDate >= startDate && t.SlotDate <= endDate && t.CurrentBookings < t.MaxCapacity)
                .OrderBy(t => t.SlotDate)
                .ThenBy(t => t.StartTime)
                .ToListAsync();
        }

        public async Task UpdateAsync(TimeSlot timeSlot)
        {
            if (timeSlot == null)
                throw new ArgumentNullException(nameof(timeSlot));

            _context.TimeSlots.Update(timeSlot);
            await _context.SaveChangesAsync();
        }
    }
}
