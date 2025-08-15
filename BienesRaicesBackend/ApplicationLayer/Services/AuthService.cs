using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Enums;
using DomainLayerr.Exceptions;
using DomainLayerr.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;

namespace ApplicationLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IJwtSettings _jwtSettings;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IRefreshTokenService refreshTokenService,
            IJwtSettings jwtSettings)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _refreshTokenService = refreshTokenService;
            _jwtSettings = jwtSettings;
        }

        // ===================
        // REGISTRO
        // ===================
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.UserExitsAsync(registerDto.Email))
                throw new AuthException("El correo ya está registrado.");

            CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            // Siempre usuario normal
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = RoleType.User
            };

            await _userRepository.AddAsync(user);

            return await GenerateAuthResponseAsync(user);
        }

        // ===================
        // LOGIN
        // ===================
        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email)
                       ?? throw new AuthException("Usuario o contraseña incorrectos.");

            if (!VerifyPasswordHash(loginDto.Password, user.PasswordHash, user.PasswordSalt))
                throw new AuthException("Usuario o contraseña incorrectos.");

            return await GenerateAuthResponseAsync(user);
        }

        // ===================
        // REFRESH TOKEN
        // ===================
        public async Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken)
        {
            var userId = _jwtService.GetUserIdFromToken(token)
                       ?? throw new AuthException("Token inválido.");

            var user = await _userRepository.GetByIdAsync(userId)
                       ?? throw new AuthException("Usuario no encontrado.");

            var storedRefresh = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);

            if (storedRefresh == null || storedRefresh.IsExpired)
                throw new AuthException("Refresh token inválido o expirado.");

            return await GenerateAuthResponseAsync(user);
        }

        // ===================
        // MÉTODOS PRIVADOS
        // ===================
        private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
        {
            var tokenExpiry = TimeSpan.FromMinutes(
                user.Role == RoleType.Admin
                    ? _jwtSettings.AdminExpiryInMinutes ?? 480
                    : _jwtSettings.DefaultExpiryInMinutes ?? 60
            );

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

        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            salt = RandomNumberGenerator.GetBytes(128 / 8);
            hash = KeyDerivation.Pbkdf2(
                password,
                salt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                256 / 8
            );
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            var hash = KeyDerivation.Pbkdf2(
                password,
                storedSalt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                256 / 8
            );

            return hash.SequenceEqual(storedHash);
        }
    }
}
