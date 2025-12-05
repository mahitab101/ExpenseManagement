using AutoMapper;
using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.Expense;
using ExpenseManagement.API.Helper;
using ExpenseManagement.API.Models;
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
        private readonly IExpenseRepository _expenseRepository;
        private readonly IMapper _mapper;

        public ExpenseController(IExpenseRepository expenseRepository,IMapper mapper)
        {
            _expenseRepository = expenseRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = User.GetUserId();
            var expenses = await _expenseRepository.GetAllExpenses(userId);
            return Ok(new ApiResponse<object>(
                true,
                "Expenses retrieved successfully.",
                expenses
                ));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.GetUserId();
            var expense = await _expenseRepository.GetExpenseById(id, userId);
            if (expense == null)
            {
                return NotFound(new ApiResponse<object>(
                   false,
                   "No Data found.",
                   null
               ));
            }
            return Ok(new ApiResponse<object>(
                   true,
                   "Expense retrieved successfully.",
                   expense
                ));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateExpenseDto dto)
        {
            var userId = User.GetUserId();
            var result = await _expenseRepository.AddExpense(dto, userId);
            return Ok(new ApiResponse<object>(
                true,
                "Expense created successfully",
                result
                ));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateExpenseDto dto)
        {
            var userId = User.GetUserId();
            var updated = await _expenseRepository.UpdateExpense(id, dto, userId);
            if (!updated)
            {
                return NotFound(new ApiResponse<object>(
                    false,
                    "Expense not found.",
                    null
                    ));
            }
            return Ok(new ApiResponse<object>(
                true,
                "Expense updated successfully",
                null
                ));
        }

        [HttpPut("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.GetUserId();
            var deleted = await _expenseRepository.DeleteExpense(id, userId);
            if (!deleted)
            {
                return NotFound(new ApiResponse<object>(
        false,
        "Expense not found.",
        null
        ));
            }
            return Ok(new ApiResponse<object>(
                true,
                "Expense deleted successfully",
                null
                ));
        }
    }
}
