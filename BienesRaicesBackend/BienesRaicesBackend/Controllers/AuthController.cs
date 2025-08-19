using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            return Ok(await _authService.RegisterAsync(registerDto));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            return Ok(await _authService.LoginAsync(loginDto));
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequestDto request)
        {
            return Ok(await _authService.RefreshTokenAsync(request.Token, request.RefreshToken));
        }
    }
}
