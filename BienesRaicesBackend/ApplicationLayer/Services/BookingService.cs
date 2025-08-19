using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Enums;
using DomainLayerr.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services
{
    public class BookingService : IBookingService
    {
        private readonly ITimeSlotRepository _timeSlotRepository;
        private readonly IBookingRepository _bookingRepository;

        public BookingService(
            ITimeSlotRepository timeSlotRepository,
            IBookingRepository bookingRepository)
        {
            _timeSlotRepository = timeSlotRepository;
            _bookingRepository = bookingRepository;
        }

        public async Task<ApiResponseDto<List<TimeSlotDto>>> GetAvailableTimeSlotsAsync(DateTime? startDate, DateTime? endDate, int userId)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponseDto<List<TimeSlotDto>>.ErrorResponse("Usuario inválido", 401);

                var start = startDate ?? DateTime.Today;
                var end = endDate ?? DateTime.Today.AddDays(7);

                if (end < start)
                    return ApiResponseDto<List<TimeSlotDto>>.ErrorResponse("La fecha de fin debe ser posterior a la de inicio");

                if (start < DateTime.Today)
                    return ApiResponseDto<List<TimeSlotDto>>.ErrorResponse("No se pueden consultar fechas pasadas");

                var slots = await _timeSlotRepository.GetAvailableSlotsAsync(start, end);
                var slotsDto = slots.Select(MapToTimeSlotDto).ToList();

                var metadata = new
                {
                    StartDate = start.ToString("yyyy-MM-dd"),
                    EndDate = end.ToString("yyyy-MM-dd"),
                    TotalSlots = slotsDto.Count,
                    DaysRange = (end - start).Days
                };

                return ApiResponseDto<List<TimeSlotDto>>.SuccessResponse(
                    slotsDto,
                    "Horarios disponibles obtenidos exitosamente",
                    200,
                    metadata);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<List<TimeSlotDto>>.ErrorResponse($"Error interno: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<int>> CreateBookingAsync(int userId, CreateBookingDto bookingDto)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponseDto<int>.ErrorResponse("Usuario inválido", 401);

                if (bookingDto.TimeSlotId <= 0)
                    return ApiResponseDto<int>.ErrorResponse("TimeSlot inválido");

                var timeSlot = await _timeSlotRepository.GetByIdAsync(bookingDto.TimeSlotId);
                if (timeSlot == null)
                    return ApiResponseDto<int>.ErrorResponse("El horario seleccionado no existe");

                var slotDateTime = timeSlot.SlotDate.Date.Add(timeSlot.StartTime);
                if (slotDateTime <= DateTime.Now)
                    return ApiResponseDto<int>.ErrorResponse("No se puede reservar en horarios pasados");

                var booking = new Booking
                {
                    TimeSlotId = timeSlot.Id,
                    UserId = userId,
                    Status = BookingStatus.Confirmed,
                    BookingDate = DateTime.UtcNow
                };

                var bookingId = await _bookingRepository.CreateBookingWithConcurrencyCheckAsync(booking);

                return ApiResponseDto<int>.SuccessResponse(
                    bookingId,
                    "Reserva creada exitosamente",
                    201);
            }
            catch (BookingException ex)
            {
                return ApiResponseDto<int>.ErrorResponse(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<int>.ErrorResponse($"Error interno al crear la reserva: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<List<BookingDto>>> GetUserBookingsAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponseDto<List<BookingDto>>.ErrorResponse("Usuario inválido", 401);

                var bookings = await _bookingRepository.GetByUserIdAsync(userId);
                var bookingsDto = bookings.Select(MapToBookingDto).ToList();

                var metadata = new
                {
                    UserId = userId,
                    TotalBookings = bookingsDto.Count,
                    Confirmed = bookingsDto.Count(b => b.Status == BookingStatus.Confirmed),
                    Cancelled = bookingsDto.Count(b => b.Status == BookingStatus.Cancelled)
                };

                return ApiResponseDto<List<BookingDto>>.SuccessResponse(
                    bookingsDto,
                    "Reservas obtenidas exitosamente",
                    200,
                    metadata);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<List<BookingDto>>.ErrorResponse($"Error obteniendo reservas: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<List<BookingDto>>> GetAllBookingsAsync()
        {
            try
            {
                var bookings = await _bookingRepository.GetAllAsync();
                var bookingsDto = bookings.Select(MapToBookingDto).ToList();

                var metadata = new
                {
                    TotalBookings = bookingsDto.Count,
                    Confirmed = bookingsDto.Count(b => b.Status == BookingStatus.Confirmed),
                    Cancelled = bookingsDto.Count(b => b.Status == BookingStatus.Cancelled),
                    Pending = bookingsDto.Count(b => b.Status == BookingStatus.Pending)
                };

                return ApiResponseDto<List<BookingDto>>.SuccessResponse(
                    bookingsDto,
                    "Todas las reservas obtenidas exitosamente",
                    200,
                    metadata);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<List<BookingDto>>.ErrorResponse($"Error obteniendo todas las reservas: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<object>> CancelBookingAsync(int bookingId, int userId)
        {
            try
            {
                if (bookingId <= 0)
                    return ApiResponseDto<object>.ErrorResponse("ID de reserva inválido");

                if (userId <= 0)
                    return ApiResponseDto<object>.ErrorResponse("Usuario inválido", 401);

                var booking = await _bookingRepository.GetByIdAsync(bookingId);
                if (booking == null)
                    return ApiResponseDto<object>.ErrorResponse("Reserva no encontrada", 404);

                if (booking.UserId != userId)
                    return ApiResponseDto<object>.ErrorResponse("No tiene permisos para cancelar esta reserva", 403);

                if (booking.Status != BookingStatus.Confirmed)
                    return ApiResponseDto<object>.ErrorResponse("La reserva ya está cancelada o completada");

                if (booking.TimeSlot != null)
                {
                    var slotDateTime = booking.TimeSlot.SlotDate.Date.Add(booking.TimeSlot.StartTime);
                    if (slotDateTime <= DateTime.Now.AddHours(1))
                        return ApiResponseDto<object>.ErrorResponse("No se puede cancelar con menos de 1 hora de anticipación");
                }

                booking.Status = BookingStatus.Cancelled;
                await _bookingRepository.UpdateAsync(booking);

                if (booking.TimeSlot != null)
                {
                    booking.TimeSlot.CurrentBookings = Math.Max(0, booking.TimeSlot.CurrentBookings - 1);
                    await _timeSlotRepository.UpdateAsync(booking.TimeSlot);
                }

                return ApiResponseDto<object>.SuccessResponse(
                    new { BookingId = bookingId },
                    "Reserva cancelada exitosamente",
                    200);
            }
            catch (BookingException ex)
            {
                return ApiResponseDto<object>.ErrorResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<object>.ErrorResponse($"Error al cancelar reserva: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<int>> QuickBookAsync(int userId, int timeSlotId)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponseDto<int>.ErrorResponse("Usuario inválido", 401);

                var bookingDto = new CreateBookingDto { TimeSlotId = timeSlotId };
                return await CreateBookingAsync(userId, bookingDto);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<int>.ErrorResponse($"Error en reserva rápida: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponseDto<DashboardDto>> GetDashboardAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponseDto<DashboardDto>.ErrorResponse("Usuario inválido", 401);

                var myBookingsResponse = await GetUserBookingsAsync(userId);
                if (!myBookingsResponse.Success || myBookingsResponse.Data == null)
                    return ApiResponseDto<DashboardDto>.ErrorResponse("Error obteniendo reservas del usuario");

                var myBookings = myBookingsResponse.Data;

                var availableSlotsResponse = await GetAvailableTimeSlotsAsync(DateTime.Today, DateTime.Today.AddDays(7), userId);
                if (!availableSlotsResponse.Success || availableSlotsResponse.Data == null)
                    return ApiResponseDto<DashboardDto>.ErrorResponse("Error obteniendo slots disponibles");

                var availableSlots = availableSlotsResponse.Data;

                var dashboard = new DashboardDto
                {
                    UserId = userId,
                    MyBookings = new UserBookingSummaryDto
                    {
                        Total = myBookings.Count,
                        Confirmed = myBookings.Count(b => b.Status == BookingStatus.Confirmed),
                        Cancelled = myBookings.Count(b => b.Status == BookingStatus.Cancelled),
                        Recent = myBookings.Take(5).Select(b => new BookingSummaryDto
                        {
                            Id = b.Id,
                            Status = b.Status.ToString(),
                            Date = b.TimeSlot?.SlotDate.ToString("yyyy-MM-dd") ?? "N/A",
                            Time = b.TimeSlot?.StartTime.ToString(@"hh\:mm") ?? "N/A"
                        }).ToList()
                    },
                    AvailableSlots = new AvailableSlotsSummaryDto
                    {
                        Total = availableSlots.Count,
                        Next5 = availableSlots.Take(5).Select(s => new TimeSlotSummaryDto
                        {
                            Id = s.Id,
                            Date = s.SlotDate.ToString("yyyy-MM-dd"),
                            Time = $"{s.StartTime:hh\\:mm}-{s.EndTime:hh\\:mm}",
                            Available = s.AvailableSlots,
                            MaxCapacity = s.MaxCapacity
                        }).ToList()
                    }
                };

                return ApiResponseDto<DashboardDto>.SuccessResponse(
                    dashboard,
                    "Dashboard obtenido exitosamente",
                    200);
            }
            catch (Exception ex)
            {
                return ApiResponseDto<DashboardDto>.ErrorResponse($"Error obteniendo dashboard: {ex.Message}", 500);
            }
        }

        private static TimeSlotDto MapToTimeSlotDto(TimeSlot timeSlot)
        {
            return new TimeSlotDto
            {
                Id = timeSlot.Id,
                SlotDate = timeSlot.SlotDate,
                StartTime = timeSlot.StartTime,
                EndTime = timeSlot.EndTime,
                MaxCapacity = timeSlot.MaxCapacity,
                CurrentBookings = timeSlot.CurrentBookings
            };
        }

        private static BookingDto MapToBookingDto(Booking booking)
        {
            return new BookingDto
            {
                Id = booking.Id,
                BookingDate = booking.BookingDate,
                TimeSlot = booking.TimeSlot != null ? MapToTimeSlotDto(booking.TimeSlot) : null!,
                Status = booking.Status,
                User = booking.User != null ? new UserDto 
                { 
                    Id = booking.User.Id,
                    Username = booking.User.Username,
                    Email = booking.User.Email,
                } : null
            };
        }
    }
}
