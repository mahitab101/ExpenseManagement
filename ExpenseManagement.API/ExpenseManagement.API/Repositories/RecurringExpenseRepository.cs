using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.RecurringExpense;
using ExpenseManagement.API.Hubs;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManagement.API.Repositories
{
    public class RecurringExpenseRepository : IRecurringExpenseRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public RecurringExpenseRepository(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // ── CRUD ──────────────────────────────────────────────────────────────

        public async Task<IEnumerable<RecurringExpenseDto>> GetAll(string userId)
        {
            return await _context.RecurringExpenses
                .Where(r => r.UserId == userId && !r.IsDelete)
                .Include(r => r.Category)
                .Select(r => new RecurringExpenseDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Amount = r.Amount,
                    Interval = r.Interval.ToString(),
                    DayOfPeriod = r.DayOfPeriod,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    NextDue = r.NextDue,
                    IsActive = r.IsActive,
                    CategoryId = r.CategoryId,
                    CategoryName = r.Category.CategoryName
                })
                .ToListAsync();
        }

        public async Task<RecurringExpenseDto?> GetById(int id, string userId)
        {
            var r = await _context.RecurringExpenses
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId && !x.IsDelete);

            if (r == null) return null;

            return new RecurringExpenseDto
            {
                Id = r.Id,
                Title = r.Title,
                Amount = r.Amount,
                Interval = r.Interval.ToString(),
                DayOfPeriod = r.DayOfPeriod,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                NextDue = r.NextDue,
                IsActive = r.IsActive,
                CategoryId = r.CategoryId,
                CategoryName = r.Category.CategoryName
            };
        }

        public async Task<RecurringExpenseDto> Create(CreateRecurringExpenseDto dto, string userId)
        {
            var nextDue = CalculateNextDue(dto.StartDate, dto.Interval, dto.DayOfPeriod);

            var recurring = new RecurringExpense
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Interval = dto.Interval,
                DayOfPeriod = dto.DayOfPeriod,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                LastProcessed = dto.StartDate.AddDays(-1),
                NextDue = nextDue,
                CategoryId = dto.CategoryId,
                UserId = userId
            };

            _context.RecurringExpenses.Add(recurring);
            await _context.SaveChangesAsync();

            var category = await _context.Categories.FindAsync(dto.CategoryId);

            return new RecurringExpenseDto
            {
                Id = recurring.Id,
                Title = recurring.Title,
                Amount = recurring.Amount,
                Interval = recurring.Interval.ToString(),
                DayOfPeriod = recurring.DayOfPeriod,
                StartDate = recurring.StartDate,
                EndDate = recurring.EndDate,
                NextDue = recurring.NextDue,
                IsActive = recurring.IsActive,
                CategoryId = recurring.CategoryId,
                CategoryName = category?.CategoryName ?? string.Empty
            };
        }

        public async Task<bool> Update(int id, UpdateRecurringExpenseDto dto, string userId)
        {
            var recurring = await _context.RecurringExpenses
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId && !r.IsDelete);

            if (recurring == null) return false;

            recurring.Title = dto.Title;
            recurring.Amount = dto.Amount;
            recurring.Interval = dto.Interval;
            recurring.DayOfPeriod = dto.DayOfPeriod;
            recurring.StartDate = dto.StartDate;
            recurring.EndDate = dto.EndDate;
            recurring.IsActive = dto.IsActive;
            recurring.NextDue = CalculateNextDue(DateTime.UtcNow, dto.Interval, dto.DayOfPeriod);
            recurring.CategoryId = dto.CategoryId;
            recurring.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Delete(int id, string userId)
        {
            var recurring = await _context.RecurringExpenses
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (recurring == null) return false;

            recurring.IsDelete = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleActive(int id, string userId)
        {
            var recurring = await _context.RecurringExpenses
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId && !r.IsDelete);

            if (recurring == null) return false;

            recurring.IsActive = !recurring.IsActive;
            recurring.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ── Background job ────────────────────────────────────────────────────

        public async Task ProcessDueRecurringExpenses()
        {
            var now = DateTime.UtcNow;

            var dueItems = await _context.RecurringExpenses
                .Include(r => r.Category)
                .Where(r => r.IsActive && !r.IsDelete && r.NextDue <= now
                            && (r.EndDate == null || r.EndDate >= now))
                .ToListAsync();

            foreach (var item in dueItems)
            {
                // Create the actual expense entry
                var expense = new Expense
                {
                    Title = item.Title,
                    Amount = item.Amount,
                    CategoryId = item.CategoryId,
                    Date = item.NextDue,
                    UserId = item.UserId
                };

                _context.Expenses.Add(expense);

                // Advance NextDue
                item.LastProcessed = now;
                item.NextDue = CalculateNextDue(item.NextDue, item.Interval, item.DayOfPeriod);

                // Notify via SignalR
                await _hubContext.Clients.User(item.UserId).SendAsync("ReceiveNotification",
                    $"🔄 Recurring expense added: {item.Title} — ${item.Amount:0.00}");
            }

            if (dueItems.Any())
                await _context.SaveChangesAsync();
        }

        // ── NextDue calculator ────────────────────────────────────────────────

        private static DateTime CalculateNextDue(DateTime from, RecurrenceInterval interval, int dayOfPeriod)
        {
            return interval switch
            {
                RecurrenceInterval.Daily   => from.AddDays(1),
                RecurrenceInterval.Weekly  => from.AddDays(7),
                RecurrenceInterval.Monthly => new DateTime(
                    from.Year,
                    from.Month,
                    Math.Min(dayOfPeriod, DateTime.DaysInMonth(from.Year, from.Month))
                ).AddMonths(1),
                RecurrenceInterval.Yearly  => from.AddYears(1),
                _                          => from.AddMonths(1)
            };
        }
    }
}
