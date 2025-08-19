using ApplicationLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IConfigurationService
    {
        Task<ConfigurationDto> CreateAsync(CreateConfigurationDto dto);
        Task<List<ConfigurationDto>> GetAllAsync();
        Task<ConfigurationDto?> GetByIdAsync(int id);
        Task UpdateAsync(int id, CreateConfigurationDto dto);
        Task DeleteAsync(int id);
        Task GenerateTimeSlotsAsync(int configurationId);
    }
}
