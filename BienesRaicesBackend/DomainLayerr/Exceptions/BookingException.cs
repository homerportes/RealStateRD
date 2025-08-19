using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayerr.Exceptions
{
    public class BookingException : Exception
    {
        public BookingException(string message) : base(message) { }

    }
}
