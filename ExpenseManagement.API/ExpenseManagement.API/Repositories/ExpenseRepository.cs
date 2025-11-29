using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.Expense;
using ExpenseManagement.API.Models;
using Microsoft.EntityFrameworkCore;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ApplicationDbContext _context;

    public ExpenseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync(string userId)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId && !e.IsDelete)
            .Include(e => e.Category)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Title = e.Title,
                Amount = e.Amount,
                CategoryName = e.Category.CategoryName,
                Date = e.Date
            }).ToListAsync();
    }

    public async Task<ExpenseDto> GetExpenseByIdAsync(int id, string userId)
    {
        var e = await _context.Expenses
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId && !x.IsDelete);

        if (e == null) return null;

        return new ExpenseDto
        {
            Id = e.Id,
            Title = e.Title,
            Amount = e.Amount,
            CategoryName = e.Category.CategoryName,
            Date = e.Date
        };
    }

    public async Task<ExpenseDto> AddExpenseAsync(CreateExpenseDto dto, string userId)
    {
        var expense = new Expense
        {
            Title = dto.Title,
            Amount = dto.Amount,
            CategoryId = dto.CategoryId,
            Date = dto.Date,
            UserId = userId
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return new ExpenseDto
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            CategoryName = _context.Categories.Find(dto.CategoryId)?.CategoryName,
            Date = expense.Date
        };
    }

    public async Task<bool> UpdateExpenseAsync(int id, CreateExpenseDto dto, string userId)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return false;

        expense.Title = dto.Title;
        expense.Amount = dto.Amount;
        expense.CategoryId = dto.CategoryId;
        expense.Date = dto.Date;
        expense.UpdatedAt = DateTime.Now;

        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteExpenseAsync(int id, string userId)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return false;

        expense.IsDelete = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
