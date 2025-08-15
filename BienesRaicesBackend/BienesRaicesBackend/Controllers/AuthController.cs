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

        /// <summary>
        /// Registro de usuario o administrador.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var response = await _authService.RegisterAsync(registerDto);
                return Ok(response);
            }
            catch (AuthException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Inicio de sesión.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var response = await _authService.LoginAsync(loginDto);
                return Ok(response);
            }
            catch (AuthException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Renovar el token usando refresh token.
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequestDto request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken);
                return Ok(response);
            }
            catch (AuthException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }

    // DTO auxiliar para refresh token
    public class RefreshRequestDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
