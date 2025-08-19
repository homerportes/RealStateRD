using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Enums;
using DomainLayerr.Exceptions;
using DomainLayerr.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;
using Microsoft.Extensions.Logging;

namespace ApplicationLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IJwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IRefreshTokenService refreshTokenService,
            IJwtSettings jwtSettings,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _refreshTokenService = refreshTokenService;
            _jwtSettings = jwtSettings;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.UserExitsAsync(registerDto.Email))
            {
                _logger.LogWarning("Intento de registro con email duplicado: {Email}", registerDto.Email);
                throw new AuthException("El correo ya está registrado");
            }

            var (hash, salt) = CreatePasswordHash(registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = RoleType.User
            };

            _logger.LogInformation(
            "Nuevo usuario registrado: ID {UserId}, Email: {Email}",
            user.Id, user.Email);

            await _userRepository.AddAsync(user);
            return await GenerateAuthResponseAsync(user);

            

        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                _logger.LogDebug("Intentando login para email: {Email}", loginDto.Email);

                var user = await _userRepository.GetByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    _logger.LogWarning("Intento de login fallido: Email no registrado - {Email}", loginDto.Email);
                    throw new AuthException("Credenciales inválidas");
                }

                _logger.LogDebug("Verificando credenciales para usuario ID: {UserId}", user.Id);

                if (!VerifyPasswordHash(loginDto.Password, user.PasswordHash, user.PasswordSalt))
                {
                    _logger.LogWarning(
                        "Intento de login fallido: Contraseña incorrecta - Usuario ID: {UserId}",
                        user.Id);

                    throw new AuthException("Credenciales inválidas");
                }

                _logger.LogInformation(
                    "Login exitoso: Usuario ID: {UserId}, Email: {Email}, Rol: {Role}",
                    user.Id, user.Email, user.Role);

                return await GenerateAuthResponseAsync(user);
            }
            catch (Exception ex) when (ex is not AuthException)
            {
                _logger.LogError(
                    ex,
                    "Error inesperado durante login para email: {Email}",
                    loginDto.Email);

                throw new AuthException("Error en el proceso de autenticación");
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken)
        {
            var userId = _jwtService.GetUserIdFromToken(token)
               ?? throw new AuthException("Token inválido");

            var user = await _userRepository.GetByIdAsync(userId)
                       ?? throw new AuthException("Usuario no encontrado");

            var storedRefresh = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);

            if (storedRefresh == null) throw new AuthException("Token de refresco no encontrado");
            if (storedRefresh.IsExpired) throw new AuthException("Token de refresco expirado");

            return await GenerateAuthResponseAsync(user);
        }

        private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
        {
            var tokenExpiry = GetTokenExpiryForRole(user.Role);
            var token = _jwtService.GenerateToken(user, tokenExpiry);
            var refreshToken = _refreshTokenService.GenerateRefreshToken();

            user.RefreshTokens.Add(refreshToken);
            await _userRepository.UpdateAsync(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token,
                TokenExpiration = DateTime.UtcNow.Add(tokenExpiry),
                RefreshToken = refreshToken.Token,
                RefreshTokenExpiration = refreshToken.Expires
            };
        }

        private TimeSpan GetTokenExpiryForRole(RoleType role)
        {
            return TimeSpan.FromMinutes(
                role == RoleType.Admin
                    ? _jwtSettings.AdminExpiryInMinutes ?? 480 
                    : _jwtSettings.DefaultExpiryInMinutes ?? 60 
            );
        }

        private static (byte[] hash, byte[] salt) CreatePasswordHash(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = KeyDerivation.Pbkdf2(
                password,
                salt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                32);
            return (hash, salt);
        }

        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            var hash = KeyDerivation.Pbkdf2(
                password,
                storedSalt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                32);
            return hash.SequenceEqual(storedHash);
        }
    }
}