using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class CreateBookingDto
    {
        [Required(ErrorMessage = "El ID del time slot es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "El ID del time slot debe ser mayor a 0")]
        public int TimeSlotId { get; set; }
    }
}
