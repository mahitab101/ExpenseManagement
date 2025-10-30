using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Models;

namespace ExpenseManagement.API.Contracts
{
    public interface IUserRepository
    {
        Task<bool> Registeration(RegisterDto registerDto);
        Task<ApplicationUser> Login(string email,string password);
    }
}
