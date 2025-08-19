using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Enums;
using DomainLayerr.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Data.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;
        public BookingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking> AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.TimeSlot)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.TimeSlot)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.TimeSlot)
                .Include(b => b.User)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<bool> HasUserBookingForSlotAsync(int userId, int timeSlotId)
        {
            return await _context.Bookings
                .AnyAsync(b => b.UserId == userId && b.TimeSlotId == timeSlotId && b.Status == BookingStatus.Confirmed);
        }

        public async Task<bool> HasUserBookingForDateAsync(int userId, DateTime date)
        {
            return await _context.Bookings
                .Include(b => b.TimeSlot)
                .AnyAsync(b => b.UserId == userId
                    && b.TimeSlot.SlotDate.Date == date.Date
                    && b.Status == BookingStatus.Confirmed);
        }

        public async Task<int> CreateBookingWithConcurrencyCheckAsync(Booking booking)
        {
            const int maxRetries = 3;
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var timeSlot = await _context.TimeSlots
                        .FromSqlRaw("SELECT * FROM TimeSlots WITH (UPDLOCK) WHERE Id = {0}", booking.TimeSlotId)
                        .FirstOrDefaultAsync();

                    if (timeSlot == null)
                        throw new BookingException("El horario seleccionado no existe");

                    if (timeSlot.CurrentBookings >= timeSlot.MaxCapacity)
                        throw new BookingException("No hay cupos disponibles para este horario");

                    var hasBookingToday = await _context.Bookings
                        .Include(b => b.TimeSlot)
                        .AnyAsync(b => b.UserId == booking.UserId
                            && b.TimeSlot.SlotDate.Date == timeSlot.SlotDate.Date
                            && b.Status == BookingStatus.Confirmed);

                    if (hasBookingToday)
                        throw new BookingException("Ya tiene una cita confirmada para este día");

                    await _context.Bookings.AddAsync(booking);
                    timeSlot.CurrentBookings++;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return booking.Id;
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync();
                    retryCount++;
                    if (retryCount >= maxRetries)
                        throw new BookingException("Error de concurrencia. Intente nuevamente.");

                    await Task.Delay(100);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            throw new BookingException("No se pudo completar la reserva después de varios intentos");
        }

        public async Task UpdateAsync(Booking booking)
        {
            if (booking == null)
                throw new ArgumentNullException(nameof(booking));

            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
        }
    }
}
