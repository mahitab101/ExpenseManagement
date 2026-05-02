using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.category;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SurplusAllocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SurplusAllocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /api/surplusallocation?month=4&year=2026
        // Returns total allocated this month so frontend can show history
        [HttpGet]
        public async Task<IActionResult> GetAllocations([FromQuery] int month, [FromQuery] int year)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var allocations = await _context.SurplusAllocations
                .Include(a => a.SavingsGoal)
                .Where(a => a.UserId == userId && a.Month == month && a.Year == year)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Amount,
                    a.CreatedAt,
                    SavingsGoalName = a.SavingsGoal.Name,
                    SavingsGoalColor = a.SavingsGoal.Color,
                })
                .ToListAsync();

            return Ok(allocations);
        }

        // POST /api/surplusallocation
        [HttpPost]
        public async Task<IActionResult> Allocate([FromBody] AllocateSurplusDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // 1. Validate the savings goal belongs to this user
            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(g => g.Id == dto.SavingsGoalId && g.UserId == userId);

            if (goal == null) return NotFound("Savings goal not found.");

            // 2. Get current month's budget summary to validate surplus
            var totalBudget = await _context.CategoryBudgets
                .Where(b => b.UserId == userId && b.Month == dto.Month && b.Year == dto.Year)
                .SumAsync(b => b.Amount);

            var totalSpent = await _context.Expenses
                .Where(e => e.UserId == userId && !e.IsDelete
                    && e.Date.Month == dto.Month && e.Date.Year == dto.Year)
                .SumAsync(e => e.Amount);

            var remaining = Math.Max(totalBudget - totalSpent, 0);

            // 3. Get already allocated amount this month
            var alreadyAllocated = await _context.SurplusAllocations
                .Where(a => a.UserId == userId && a.Month == dto.Month && a.Year == dto.Year)
                .SumAsync(a => a.Amount);

            var availableSurplus = Math.Max(remaining - alreadyAllocated, 0);

            // 4. Validate amount doesn't exceed available surplus
            if (dto.Amount <= 0)
                return BadRequest("Amount must be greater than zero.");

            if (dto.Amount > availableSurplus)
                return BadRequest($"Amount exceeds available surplus of {availableSurplus:C}.");

            // 5. Record the allocation
            var allocation = new SurplusAllocation
            {
                Month = dto.Month,
                Year = dto.Year,
                Amount = dto.Amount,
                SavingsGoalId = dto.SavingsGoalId,
                UserId = userId,
            };

            _context.SurplusAllocations.Add(allocation);

            // 6. Update the savings goal saved amount
            goal.Saved += dto.Amount;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"${dto.Amount} allocated to \"{goal.Name}\" successfully.",
                newSaved = goal.Saved,
                availableSurplus = availableSurplus - dto.Amount,
            });
        }
    }


}