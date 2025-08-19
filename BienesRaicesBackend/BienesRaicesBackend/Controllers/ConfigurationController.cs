using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/configurationsReserve")]
    [Authorize(Policy = "AdminOnly")]

    public class ConfigurationController : ControllerBase
    {
        private readonly IConfigurationService _configurationService;

        public ConfigurationController(IConfigurationService configurationService)
        {
            _configurationService = configurationService;
        }

        [HttpPost]
        public async Task<ActionResult<ConfigurationDto>> Create([FromBody] CreateConfigurationDto dto)
        {
            var result = await _configurationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<ActionResult<List<ConfigurationDto>>> GetAll()
        {
            return Ok(await _configurationService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ConfigurationDto>> GetById(int id)
        {
            return Ok(await _configurationService.GetByIdAsync(id));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateConfigurationDto dto)
        {
            await _configurationService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _configurationService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/generate-slots")]
        public async Task<IActionResult> GenerateTimeSlots(int id)
        {
            await _configurationService.GenerateTimeSlotsAsync(id);
            return NoContent();
        }

    }
}
