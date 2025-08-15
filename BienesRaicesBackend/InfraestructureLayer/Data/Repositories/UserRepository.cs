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
            _context = context;
        }

        public async Task<User?> AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email == email);



        public async Task<User?> GetByIdAsync(int id) =>
            await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id);


        public Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            return _context.SaveChangesAsync();
        }

        public async Task<bool> UserExitsAsync(string email) =>
            await _context.Users.AnyAsync(u => u.Email == email);

    }
}
