using DomainLayerr.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IConfigurationRepository
    {
        Task<Configuration> AddAsync(Configuration configuration);
        Task<Configuration?> GetByIdAsync(int id, bool includeShifts = false, bool includeTimeSlots = false);
        Task<List<Configuration>> GetAllAsync();
        Task UpdateAsync(Configuration configuration);
        Task DeleteAsync(Configuration configuration);
        Task<List<Configuration>> GetOverlappingConfigurationsAsync(DateTime startDate, DateTime endDate);
    }
}
