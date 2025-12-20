using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountsController(IUserRepository userRepository, UserManager<ApplicationUser> userManager)
        {
            _userRepository = userRepository;
            _userManager = userManager;
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


        [HttpGet("confirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest("User not found");

            // Decode the token
            var decodedBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedBytes);

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded)
                return BadRequest("Invalid token");

            return Ok("Email confirmed successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var loggedInUser = await _userRepository.Login(loginDto.Email, loginDto.Password);
            if (loggedInUser == null)
            {
                return BadRequest(new ApiResponse<object>(false, "User Not Found."));
            }

            if (!string.IsNullOrEmpty(loggedInUser.RefreshToken))
                SetRefreshTokenInCookie(loggedInUser.RefreshToken, loggedInUser.ExpiresOn);

            return Ok(new ApiResponse<UserDto>(true, "User LogedIn successfully.", loggedInUser));
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest(new ApiResponse<object>(false, "No refresh token found."));

            var result = await _userRepository.Logout(refreshToken);

            if (!result)
                return BadRequest(new ApiResponse<object>(false, "Logout failed or token already revoked."));

            // delete the refresh token cookie
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(new ApiResponse<object>(true, "Logged out successfully."));
        }

        [HttpPost("refreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var refreshToken = Request.Cookies["refreshToken"];
          
                if (string.IsNullOrEmpty(refreshToken))
                    return BadRequest(new ApiResponse<object>(false, "Refresh token is required."));

                var result = await _userRepository.RefreshToken(refreshToken);

            if (result == null)
            {
                return BadRequest(new ApiResponse<object>(false, "Invalid or expired refresh token."));
            }
                SetRefreshTokenInCookie(result.RefreshToken, result.ExpiresOn);
                return Ok(new ApiResponse<UserDto>(true, "Token refreshed successfully.", result));
           
        }
        private void SetRefreshTokenInCookie(string refreshToken, DateTime expires)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = expires.ToLocalTime(),
                Secure = true,
                IsEssential = true,
                SameSite = SameSiteMode.None
            };

            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}


