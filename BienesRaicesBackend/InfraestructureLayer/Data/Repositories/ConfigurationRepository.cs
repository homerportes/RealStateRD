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
    public class ConfigurationRepository : IConfigurationRepository
    {
        private readonly AppDbContext _context;

        public ConfigurationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Configuration> AddAsync(Configuration configuration)
        {
            await _context.Configurations.AddAsync(configuration);
            await _context.SaveChangesAsync();
            return configuration;
        }

        public async Task DeleteAsync(Configuration configuration)
        {
            _context.Configurations.Remove(configuration);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Configuration>> GetAllAsync()
        {
            return await _context.Configurations
                .Include(c => c.Shifts)
                .ToListAsync();
        }

        public async Task<Configuration?> GetByIdAsync(
            int id,
            bool includeShifts = false,
            bool includeTimeSlots = false)
        {
            var query = _context.Configurations.AsQueryable();

            if (includeShifts)
                query = query.Include(c => c.Shifts);

            if (includeTimeSlots)
                query = query.Include(c => c.TimeSlots);

            return await query.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task UpdateAsync(Configuration configuration)
        {
            _context.Configurations.Update(configuration);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Configuration>> GetOverlappingConfigurationsAsync(
            DateTime startDate, DateTime endDate)
        {
            return await _context.Configurations
                .Include(c => c.Shifts)
                .Where(c => c.StartDate <= endDate && c.EndDate >= startDate)
                .ToListAsync();
        }
    }
}
