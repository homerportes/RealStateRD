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
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context)); 
        }

        public async Task<User?> AddAsync(User user)
        {
            if (user == null) 
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Email)) 
                throw new ArgumentException("Email is required", nameof(user));

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null; 

            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            if (id <= 0) return null;

            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task UpdateAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UserExitsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;

            return await _context.Users.AnyAsync(u => u.Email == email);
        }

    }
}
