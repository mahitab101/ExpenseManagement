using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.CategoryBudget;
using ExpenseManagement.API.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryBudgetsController : ControllerBase
    {
        private readonly ICategoryBudgetRepository _repository;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public CategoryBudgetsController(
            ICategoryBudgetRepository repository,
            IStringLocalizer<SharedResource> localizer)
        {
            _repository = repository;
            _localizer  = localizer;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("summary")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] int? month, [FromQuery] int? year)
        {
            var m       = month ?? DateTime.UtcNow.Month;
            var y       = year  ?? DateTime.UtcNow.Year;
            var summary = await _repository.GetMonthlySummary(m, y, UserId);
            return Ok(summary);
        }

        [HttpGet]
        public async Task<IActionResult> GetBudget(
            [FromQuery] int categoryId, [FromQuery] int? month, [FromQuery] int? year)
        {
            var m      = month ?? DateTime.UtcNow.Month;
            var y      = year  ?? DateTime.UtcNow.Year;
            var budget = await _repository.GetBudget(categoryId, m, y, UserId);
            if (budget == null) return NotFound();
            return Ok(budget);
        }

        [HttpPost]
        public async Task<IActionResult> SetBudget([FromBody] SetCategoryBudgetDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _repository.SetBudget(dto, UserId);
            return Ok(result);
        }

        [HttpPost("carry-forward")]
        public async Task<IActionResult> CarryForward([FromQuery] int? fromMonth, [FromQuery] int? fromYear)
        {
            var m       = fromMonth ?? DateTime.UtcNow.Month;
            var y       = fromYear  ?? DateTime.UtcNow.Year;
            var success = await _repository.CopyBudgetsToNextMonth(m, y, UserId);

            if (!success)
                return BadRequest(new { message = _localizer["budgets_not_found"].Value });

            // {0} = "April 2026"
            var monthLabel = new DateTime(y, m, 1).ToString("MMMM yyyy");
            return Ok(new { message = string.Format(_localizer["budgets_carried_forward"], monthLabel) });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _repository.DeleteBudget(id, UserId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
