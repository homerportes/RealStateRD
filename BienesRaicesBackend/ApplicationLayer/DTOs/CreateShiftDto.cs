using DomainLayerr.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class CreateShiftDto
    {
        [Required(ErrorMessage = "El día de la semana es requerido")]
        public DayOfWeek DayOfWeek { get; set; }

        [Required(ErrorMessage = "El tipo de turno es requerido")]
        public ShiftType Type { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan EndTime { get; set; }

        [Required(ErrorMessage = "El número de estaciones es requerido")]
        [Range(1, 50, ErrorMessage = "Debe haber entre 1 y 50 estaciones")]
        public int StationCount { get; set; }
    }
}
