using DomainLayerr.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> UserExitsAsync(string email);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> AddAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);

    }
}
