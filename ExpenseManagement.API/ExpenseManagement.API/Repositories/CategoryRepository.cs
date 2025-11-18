using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManagement.API.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public CategoryRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<bool> AddAsync(Category category)
        {
            await _dbContext.Categories.AddAsync(category);
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id, Guid userId)
        {
            var existingCategory = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (existingCategory == null)
            {
                return false;
            }

            existingCategory.IsDelete = true;
            existingCategory.UpdatedAt = DateTime.UtcNow;

            _dbContext.Categories.Update(existingCategory);
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Category>> GetAllAsync(Guid userId)
        {
            return await _dbContext.Categories.Where(c=>c.UserId==userId).ToListAsync();
        }

        public Task<Category> GetByIdAsync(int id, Guid userId)
        {
           return _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        }

        public async Task<bool> UpdateAsync(Category category, Guid userId)
        {
            var existingCategory = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == category.Id && c.UserId == userId);
            if (existingCategory == null)
            {
                return false;
            }

            existingCategory.CategoryName = category.CategoryName;
            existingCategory.CategoryDescription = category.CategoryDescription;
            existingCategory.UpdatedAt = DateTime.UtcNow;

            _dbContext.Categories.Update(existingCategory);
            return await _dbContext.SaveChangesAsync() > 0;
        }
    }
}
