using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AccountsController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                var errorResponse = new ApiResponse<object>(
                    false,
                    "Invalid input data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                );
                return BadRequest(errorResponse);
            }

            var result = await _userRepository.Registeration(registerDto);

            if (!result)
            {
                var failResponse = new ApiResponse<object>(
                    false,
                    "User already exists or registration failed."
                );
                return BadRequest(failResponse);
            }

            var successResponse = new ApiResponse<object>(
                true,
                "User registered successfully."
            );
            return Ok(successResponse);
        }
    }

}
