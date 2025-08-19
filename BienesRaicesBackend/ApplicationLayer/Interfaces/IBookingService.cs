using ApplicationLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IBookingService
    {
        Task<ApiResponseDto<List<TimeSlotDto>>> GetAvailableTimeSlotsAsync(DateTime? startDate, DateTime? endDate, int userId);
        Task<ApiResponseDto<int>> CreateBookingAsync(int userId, CreateBookingDto bookingDto);
        Task<ApiResponseDto<List<BookingDto>>> GetUserBookingsAsync(int userId);
        Task<ApiResponseDto<List<BookingDto>>> GetAllBookingsAsync();
        Task<ApiResponseDto<object>> CancelBookingAsync(int bookingId, int userId);
        Task<ApiResponseDto<int>> QuickBookAsync(int userId, int timeSlotId);
        Task<ApiResponseDto<DashboardDto>> GetDashboardAsync(int userId);
    }
}
