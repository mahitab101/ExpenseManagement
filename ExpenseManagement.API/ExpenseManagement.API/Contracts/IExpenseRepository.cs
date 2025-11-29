using ExpenseManagement.API.DTOs.Expense;

namespace ExpenseManagement.API.Contracts
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync(string userId);
        Task<ExpenseDto> GetExpenseByIdAsync(int id, string userId);
        Task<ExpenseDto> AddExpenseAsync(CreateExpenseDto dto, string userId);
        Task<bool> UpdateExpenseAsync(int id, CreateExpenseDto dto, string userId);
        Task<bool> DeleteExpenseAsync(int id, string userId);
    }
}
