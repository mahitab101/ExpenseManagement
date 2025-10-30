using System.ComponentModel.DataAnnotations;

namespace ExpenseManagement.API.DTOs.Account
{
    public class LoginDto
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
