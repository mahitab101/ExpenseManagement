using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AccountsController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var loggedInUser = await _userRepository.Login(loginDto.Email, loginDto.Password);
            if (loggedInUser == null)
            {
                var failResponse = new ApiResponse<object>(
                    false,
                    "User Not Found."
                );
                return BadRequest(failResponse);
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credential = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, loginDto.Email),
                new Claim(ClaimTypes.Role, "User")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(60),
                signingCredentials: credential
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            var userDto = new UserDto
            {
                Id = loggedInUser.Id,
                UserName = loggedInUser.UserName,
                Token = jwt
            };

            var response = new ApiResponse<UserDto>(
                true,
                "Login successful.",
                userDto
            );

            return Ok(response);
        }

    }
}


