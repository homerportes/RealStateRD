using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("available-slots")]
        public async Task<IActionResult> GetAvailableSlots([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.GetAvailableTimeSlotsAsync(startDate, endDate, userId);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto bookingDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.CreateBookingAsync(userId, bookingDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetUserBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.GetUserBookingsAsync(userId);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("all")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.GetAllBookingsAsync();
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{bookingId}")]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.CancelBookingAsync(bookingId, userId);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("Token de usuario inválido");

            var response = await _bookingService.GetDashboardAsync(userId);
            return StatusCode(response.StatusCode, response);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var id) ? id : 0;
        }
    }
}
