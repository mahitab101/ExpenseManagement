using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.Expense;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseRepository _repo;

        public ExpenseController(IExpenseRepository repo)
        {
            _repo = repo;
        }

        private string GetUserId() =>
                   User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var expenses = await _repo.GetAllExpensesAsync(userId);
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var userId = GetUserId();
            var expense = await _repo.GetExpenseByIdAsync(id, userId);
            if (expense == null) return NotFound();
            return Ok(expense);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateExpenseDto dto)
        {
            var userId = GetUserId();
            var result = await _repo.AddExpenseAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateExpenseDto dto)
        {
            var userId = GetUserId();
            var updated = await _repo.UpdateExpenseAsync(id, dto, userId);
            if (!updated) return NotFound();
            return Ok("Expense updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var deleted = await _repo.DeleteExpenseAsync(id, userId);
            if (!deleted) return NotFound();
            return Ok("Expense deleted successfully");
        }
    }
}
