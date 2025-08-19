using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using DomainLayerr.Entities;
using DomainLayerr.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly IConfigurationRepository _configurationRepository;
        private readonly ILogger<ConfigurationService> _logger;

        public ConfigurationService(
            IConfigurationRepository configurationRepository,
            ILogger<ConfigurationService> logger)
        {
            _configurationRepository = configurationRepository;
            _logger = logger;
        }

        public async Task<ConfigurationDto> CreateAsync(CreateConfigurationDto dto)
        {
            using var scope = _logger.BeginScope("Creando nueva configuración");

            try
            {
                _logger.LogInformation("Iniciando creación de configuración");
                _logger.LogDebug("Datos recibidos: {StartDate} a {EndDate}, Duración: {Duration} min",
                    dto.StartDate.ToString("yyyy-MM-dd"),
                    dto.EndDate.ToString("yyyy-MM-dd"),
                    dto.AppointmentDurationMinutes);

                ValidateConfiguration(dto);
                await ValidateNoOverlap(dto);
                _logger.LogDebug("Validaciones superadas");

                var configuration = new Configuration
                {
                    StartDate = dto.StartDate.Date,
                    EndDate = dto.EndDate.Date,
                    AppointmentDurationMinutes = dto.AppointmentDurationMinutes,
                    Shifts = dto.Shifts.Select(s => new Shift
                    {
                        DayOfWeek = s.DayOfWeek,
                        Type = s.Type,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime,
                        StationCount = s.StationCount
                    }).ToList()
                };

                var result = await _configurationRepository.AddAsync(configuration);
                _logger.LogInformation("Configuración creada con ID: {ConfigId}", result.Id);

                await GenerateTimeSlotsAsync(result.Id);
                _logger.LogInformation("Slots generados para configuración ID: {ConfigId}", result.Id);

                return MapToDto(result);
            }
            catch (ConfigurationException ex)
            {
                _logger.LogWarning(ex, "Error de validación en creación: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico al crear configuración");
                throw new ConfigurationException("Error interno al crear configuración");
            }
        }

        public async Task DeleteAsync(int id)
        {
            using var scope = _logger.BeginScope("Eliminando configuración ID: {ConfigId}", id);

            try
            {
                _logger.LogDebug("Buscando configuración para eliminar");
                var configuration = await _configurationRepository.GetByIdAsync(id)
                                    ?? throw new KeyNotFoundException("Configuración no encontrada");

                await _configurationRepository.DeleteAsync(configuration);
                _logger.LogInformation("Configuración eliminada exitosamente");
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Error al eliminar: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico al eliminar configuración ID: {ConfigId}", id);
                throw;
            }
        }

        public async Task<List<ConfigurationDto>> GetAllAsync()
        {
            using var scope = _logger.BeginScope("Obteniendo todas las configuraciones");

            try
            {
                _logger.LogDebug("Consultando repositorio");
                var configurations = await _configurationRepository.GetAllAsync();

                _logger.LogInformation("Se obtuvieron {Count} configuraciones", configurations.Count);
                return configurations.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener configuraciones");
                throw;
            }
        }

        public async Task<ConfigurationDto?> GetByIdAsync(int id)
        {
            using var scope = _logger.BeginScope("Obteniendo configuración ID: {ConfigId}", id);

            try
            {
                _logger.LogDebug("Consultando repositorio");
                var configuration = await _configurationRepository.GetByIdAsync(id, includeShifts: true);

                if (configuration == null)
                {
                    _logger.LogWarning("Configuración no encontrada");
                    return null;
                }

                _logger.LogDebug("Configuración encontrada con {ShiftCount} turnos", configuration.Shifts.Count);
                return MapToDto(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener configuración ID: {ConfigId}", id);
                throw;
            }
        }

        public async Task UpdateAsync(int id, CreateConfigurationDto dto)
        {
            using var scope = _logger.BeginScope("Actualizando configuración ID: {ConfigId}", id);

            try
            {
                _logger.LogInformation("Iniciando actualización");
                _logger.LogDebug("Datos recibidos: {StartDate} a {EndDate}",
                    dto.StartDate.ToString("yyyy-MM-dd"),
                    dto.EndDate.ToString("yyyy-MM-dd"));

                _logger.LogDebug("Buscando configuración existente");
                var configuration = await _configurationRepository.GetByIdAsync(id, includeShifts: true)
                                    ?? throw new KeyNotFoundException("Configuración no encontrada");

                ValidateConfiguration(dto);
                await ValidateNoOverlap(dto, id);
                _logger.LogDebug("Validaciones superadas");

                configuration.StartDate = dto.StartDate.Date;
                configuration.EndDate = dto.EndDate.Date;
                configuration.AppointmentDurationMinutes = dto.AppointmentDurationMinutes;

                configuration.Shifts.Clear();
                foreach (var shiftDto in dto.Shifts)
                {
                    configuration.Shifts.Add(new Shift
                    {
                        DayOfWeek = shiftDto.DayOfWeek,
                        Type = shiftDto.Type,
                        StartTime = shiftDto.StartTime,
                        EndTime = shiftDto.EndTime,
                        StationCount = shiftDto.StationCount
                    });
                }
                _logger.LogDebug("Actualizados {ShiftCount} turnos", dto.Shifts.Count);

                await _configurationRepository.UpdateAsync(configuration);
                _logger.LogInformation("Configuración actualizada");

                await GenerateTimeSlotsAsync(id);
                _logger.LogInformation("Slots regenerados");
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Error en actualización: {Message}", ex.Message);
                throw;
            }
            catch (ConfigurationException ex)
            {
                _logger.LogWarning(ex, "Error de validación en actualización: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico al actualizar configuración");
                throw;
            }
        }

        public async Task GenerateTimeSlotsAsync(int configurationId)
        {
            using var scope = _logger.BeginScope("Generando slots para configuración ID: {ConfigId}", configurationId);

            try
            {
                _logger.LogDebug("Obteniendo configuración con turnos y slots");
                var configuration = await _configurationRepository.GetByIdAsync(
                    configurationId, includeShifts: true, includeTimeSlots: true);

                if (configuration == null)
                {
                    _logger.LogError("Configuración no encontrada para generación de slots");
                    throw new ConfigurationException("Configuración no encontrada");
                }

                configuration.TimeSlots.Clear();
                _logger.LogDebug("Slots existentes eliminados");

                int totalSlots = 0;
                int daysProcessed = 0;

                for (var date = configuration.StartDate; date <= configuration.EndDate; date = date.AddDays(1))
                {
                    daysProcessed++;
                    var daySlots = 0;

                    foreach (var shift in configuration.Shifts.Where(s => s.DayOfWeek == date.DayOfWeek))
                    {
                        daySlots += GenerateSlotsForShift(date, shift, configuration);
                    }

                    totalSlots += daySlots;
                    _logger.LogTrace("Generados {SlotCount} slots para {Date}",
                        daySlots, date.ToString("yyyy-MM-dd"));
                }

                await _configurationRepository.UpdateAsync(configuration);
                _logger.LogInformation(
                    "Generados {TotalSlots} slots para {DayCount} días en configuración ID: {ConfigId}",
                    totalSlots, daysProcessed, configurationId);
            }
            catch (ConfigurationException ex)
            {
                _logger.LogError(ex, "Error en generación de slots: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico generando slots para configuración ID: {ConfigId}", configurationId);
                throw;
            }
        }

        private void ValidateConfiguration(CreateConfigurationDto dto)
        {
            try
            {
                if (dto.EndDate < dto.StartDate)
                {
                    _logger.LogWarning("Validación fallida: Fecha fin {EndDate} anterior a fecha inicio {StartDate}",
                        dto.EndDate.ToString("yyyy-MM-dd"), dto.StartDate.ToString("yyyy-MM-dd"));

                    throw new ConfigurationException(
                        "La fecha de fin debe ser posterior a la fecha de inicio");
                }

                foreach (var shift in dto.Shifts)
                {
                    if (shift.EndTime <= shift.StartTime)
                    {
                        _logger.LogWarning("Validación fallida: Turno {Type} con hora fin <= hora inicio ({StartTime} - {EndTime})",
                            shift.Type, shift.StartTime, shift.EndTime);

                        throw new ConfigurationException(
                            $"La hora de fin debe ser posterior a la hora de inicio para el turno {shift.Type}");
                    }

                    if ((shift.EndTime - shift.StartTime).TotalMinutes < dto.AppointmentDurationMinutes)
                    {
                        _logger.LogWarning(
                            "Validación fallida: Duración turno {Type} ({Duration} min) menor que cita ({AppointmentDuration} min)",
                            shift.Type,
                            (shift.EndTime - shift.StartTime).TotalMinutes,
                            dto.AppointmentDurationMinutes);

                        throw new ConfigurationException(
                            $"La duración del turno {shift.Type} es menor que la duración de la cita");
                    }
                }
            }
            catch (ConfigurationException)
            {
                _logger.LogWarning("Validación de configuración fallida");
                throw;
            }
        }

        private async Task ValidateNoOverlap(CreateConfigurationDto dto, int? currentId = null)
        {
            try
            {
                _logger.LogDebug("Validando solapamientos para rango {StartDate}-{EndDate}",
                    dto.StartDate.ToString("yyyy-MM-dd"), dto.EndDate.ToString("yyyy-MM-dd"));

                var existingConfigs = await _configurationRepository.GetOverlappingConfigurationsAsync(
                    dto.StartDate, dto.EndDate);

                foreach (var config in existingConfigs.Where(c => c.Id != currentId))
                {
                    foreach (var newShift in dto.Shifts)
                    {
                        if (config.Shifts.Any(s =>
                            s.DayOfWeek == newShift.DayOfWeek &&
                            s.Type == newShift.Type))
                        {
                            _logger.LogWarning("Solapamiento detectado con configuración ID {ExistingId} para {Day}/{Type}",
                                config.Id, newShift.DayOfWeek, newShift.Type);

                            throw new ConfigurationException(
                                $"Ya existe configuración para {newShift.DayOfWeek}/{newShift.Type} " +
                                $"en el rango {config.StartDate:yyyy-MM-dd} a {config.EndDate:yyyy-MM-dd}");
                        }
                    }
                }

                _logger.LogDebug("Validación de solapamientos exitosa");
            }
            catch (ConfigurationException)
            {
                _logger.LogWarning("Conflicto de solapamiento detectado");
                throw;
            }
        }

        private int GenerateSlotsForShift(DateTime date, Shift shift, Configuration configuration)
        {
            var currentTime = shift.StartTime;
            int slotsGenerated = 0;

            while (currentTime < shift.EndTime)
            {
                var slotEndTime = currentTime.Add(TimeSpan.FromMinutes(configuration.AppointmentDurationMinutes));
                if (slotEndTime > shift.EndTime)
                    break;

                shift.TimeSlots.Add(new TimeSlot
                {
                    SlotDate = date,
                    StartTime = currentTime,
                    EndTime = slotEndTime,
                    MaxCapacity = shift.StationCount,
                    CurrentBookings = 0,
                    ConfigurationId = configuration.Id,
                    ShiftId = shift.Id
                });

                currentTime = slotEndTime;
                slotsGenerated++;
            }

            _logger.LogTrace("Generados {SlotCount} slots para {Date} ({Day}) en turno {ShiftType}",
                slotsGenerated, date.ToString("yyyy-MM-dd"), date.DayOfWeek, shift.Type);

            return slotsGenerated;
        }

        private ConfigurationDto MapToDto(Configuration config)
        {
            return new ConfigurationDto
            {
                Id = config.Id,
                StartDate = config.StartDate,
                EndDate = config.EndDate,
                AppointmentDurationMinutes = config.AppointmentDurationMinutes,
                Shifts = config.Shifts.Select(s => new ShiftDto
                {
                    Id = s.Id,
                    DayOfWeek = s.DayOfWeek,
                    Type = s.Type,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    StationCount = s.StationCount
                }).ToList(),
                TimeSlotsCount = config.TimeSlots.Count
            };
        }
    }
}
