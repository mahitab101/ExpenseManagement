using ExpenseManagement.API.DTOs.Account;

namespace ExpenseManagement.API.Contracts
{
    public interface IUserRepository
    {
        Task<bool> Registeration(RegisterDto registerDto);
    }
}
