using ExpenseManagement.API.Models;

namespace ExpenseManagement.API.Contracts
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(Guid userId);
        Task<Category?> GetByIdAsync(int id, Guid userId);
        Task<bool> AddAsync(Category category);
        Task<bool> UpdateAsync(Category category, Guid userId);
        Task<bool> DeleteAsync(int id,Guid userId);
    }
}
