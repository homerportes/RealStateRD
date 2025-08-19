using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public object? Metadata { get; set; }
        public int StatusCode { get; set; }

        public static ApiResponseDto<T> SuccessResponse(T data, string message = "Operación exitosa", int statusCode = 200, object? metadata = null)
        {
            return new ApiResponseDto<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Metadata = metadata,
                StatusCode = statusCode
            };
        }

        public static ApiResponseDto<T> ErrorResponse(string message, int statusCode = 400, T? data = default)
        {
            return new ApiResponseDto<T>
            {
                Success = false,
                Message = message,
                Data = data,
                StatusCode = statusCode
            };
        }
    }
}
