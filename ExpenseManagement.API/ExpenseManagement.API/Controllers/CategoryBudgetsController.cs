using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.CategoryBudget;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryBudgetsController : ControllerBase
    {
        private readonly ICategoryBudgetRepository _repository;

        public CategoryBudgetsController(ICategoryBudgetRepository repository)
        {
            _repository = repository;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/categorybudgets/summary?month=4&year=2026
        [HttpGet("summary")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] int? month, [FromQuery] int? year)
        {
            var m = month ?? DateTime.UtcNow.Month;
            var y = year  ?? DateTime.UtcNow.Year;
            var summary = await _repository.GetMonthlySummary(m, y, UserId);
            return Ok(summary);
        }

        // GET api/categorybudgets?categoryId=1&month=4&year=2026
        [HttpGet]
        public async Task<IActionResult> GetBudget([FromQuery] int categoryId, [FromQuery] int? month, [FromQuery] int? year)
        {
            var m = month ?? DateTime.UtcNow.Month;
            var y = year  ?? DateTime.UtcNow.Year;
            var budget = await _repository.GetBudget(categoryId, m, y, UserId);
            if (budget == null) return NotFound();
            return Ok(budget);
        }

        // POST api/categorybudgets  — creates or updates (upsert)
        [HttpPost]
        public async Task<IActionResult> SetBudget([FromBody] SetCategoryBudgetDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _repository.SetBudget(dto, UserId);
            return Ok(result);
        }

        // POST api/categorybudgets/carry-forward?fromMonth=3&fromYear=2026
        [HttpPost("carry-forward")]
        public async Task<IActionResult> CarryForward([FromQuery] int? fromMonth, [FromQuery] int? fromYear)
        {

            var m = fromMonth ?? DateTime.UtcNow.Month;
            var y = fromYear  ?? DateTime.UtcNow.Year;
            var success = await _repository.CopyBudgetsToNextMonth(m, y, UserId);
            if (!success) return BadRequest("No budgets found for the specified month.");
            return Ok(new { message = $"Budgets copied from {new DateTime(y, m, 1):MMMM yyyy} to next month." });
        }

        // DELETE api/categorybudgets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _repository.DeleteBudget(id, UserId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
