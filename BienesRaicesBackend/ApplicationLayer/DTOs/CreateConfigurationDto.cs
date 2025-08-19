using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class CreateConfigurationDto
    {

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "La duración de la cita es requerida")]
        [Range(5, 120, ErrorMessage = "La duración debe estar entre 5 y 120 minutos")]
        public int AppointmentDurationMinutes { get; set; }

        [Required(ErrorMessage = "Debe proporcionar al menos un turno")]
        [MinLength(1, ErrorMessage = "Debe haber al menos un turno")]
        public List<CreateShiftDto> Shifts { get; set; } = new();

    }
}
