using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Helpers;
using ExpenseManagement.API.Models;
using ExpenseManagement.API.Resources;
using ExpenseManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Security.Claims;
using System.Text;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailTemplateService _emailTemplate;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public AccountsController(
            IUserRepository userRepository,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IEmailTemplateService emailTemplate,
            IEmailService emailService,
            ApplicationDbContext context,
            IStringLocalizer<SharedResource> localizer)
        {
            _userRepository = userRepository;
            _userManager    = userManager;
            _configuration  = configuration;
            _emailTemplate  = emailTemplate;
            _emailService   = emailService;
            _context        = context;
            _localizer      = localizer;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                var errorResponse = new ApiResponse<object>(
                    false,
                    _localizer["invalid_input"],
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                );
                return BadRequest(errorResponse);
            }

            var result = await _userRepository.Registeration(registerDto);

            if (!result.Success)
                return BadRequest(new ApiResponse<object>(false, result.Message));

            return Ok(new ApiResponse<object>(true, result.Message, new { emailSent = result.EmailSent }));
        }

        [HttpGet("confirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest(new ApiResponse<object>(false, _localizer["user_not_found"]));

            try
            {
                var decodedBytes = WebEncoders.Base64UrlDecode(token);
                var decodedToken = Encoding.UTF8.GetString(decodedBytes);
                var result       = await _userManager.ConfirmEmailAsync(user, decodedToken);

                if (!result.Succeeded)
                    return BadRequest(new ApiResponse<object>(false, _localizer["invalid_token"]));

                return Ok(new ApiResponse<object>(true, _localizer["email_confirmed"]));
            }
            catch
            {
                return BadRequest(new ApiResponse<object>(false, _localizer["invalid_confirmation_link"]));
            }
        }

        [HttpPost("send-confirmation-email")]
        public async Task<IActionResult> SendConfirmationEmail([FromBody] SendConfirmationEmailDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest(new ApiResponse<object>(false, _localizer["user_not_found"]));

            if (await _userManager.IsEmailConfirmedAsync(user))
                return BadRequest(new ApiResponse<object>(false, _localizer["email_already_confirmed"]));

            var token        = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var confirmLink  = $"{_configuration["FrontendBaseUrl"]}/confirm-email?userId={user.Id}&token={encodedToken}";

            var templateValues = new Dictionary<string, string>
            {
                { "UserName",           $"{user.FirstName} {user.LastName}" },
                { "ConfirmationLink",   confirmLink },
                { "TokenExpiryMinutes", "15" }
            };

            string html = await _emailTemplate.LoadTemplateAsync("ConfirmEmailTemplate", templateValues);
            await _emailService.SendEmailAsync(user.Email!, "Confirm Your Email", html);

            return Ok(new ApiResponse<object>(true, _localizer["email_confirmation_sent"]));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var loggedInUser = await _userRepository.Login(loginDto.Email, loginDto.Password);
            if (loggedInUser == null)
                return BadRequest(new ApiResponse<object>(false, _localizer["user_not_found"]));

            var userAgent  = Request.Headers["User-Agent"].ToString();
            var (browser, os) = UserAgentParser.Parse(userAgent);
            var deviceType = UserAgentParser.GetDeviceType(userAgent);

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                ip = Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();

            var oldSessions = await _context.UserSessions
                .Where(s => s.UserId == loggedInUser.Id && s.IsActive)
                .ToListAsync();
            oldSessions.ForEach(s => s.IsActive = false);

            _context.UserSessions.Add(new UserSession
            {
                UserId     = loggedInUser.Id,
                IpAddress  = ip,
                Browser    = browser,
                OS         = os,
                DeviceInfo = deviceType,
                LoginAt    = DateTime.UtcNow,
                IsActive   = true,
            });

            await _context.SaveChangesAsync();

            SetRefreshTokenInCookie(loggedInUser.RefreshToken, loggedInUser.ExpiresOn);
            return Ok(new ApiResponse<UserDto>(true, _localizer["user_logged_in"], loggedInUser));
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest(new ApiResponse<object>(false, _localizer["no_refresh_token"]));

            var result = await _userRepository.Logout(refreshToken);
            if (!result)
                return BadRequest(new ApiResponse<object>(false, _localizer["logout_failed"]));

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var sessions = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .ToListAsync();

                sessions.ForEach(s =>
                {
                    s.IsActive     = false;
                    s.LastActiveAt = DateTime.UtcNow;
                });

                await _context.SaveChangesAsync();
            }

            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly  = true,
                Secure    = true,
                SameSite  = SameSiteMode.None
            });

            return Ok(new ApiResponse<object>(true, _localizer["user_logged_out"]));
        }

        [AllowAnonymous]
        [HttpPost("refreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new ApiResponse<object>(false, _localizer["no_refresh_token"]));

            try
            {
                var result = await _userRepository.RefreshToken(refreshToken);
                if (result == null)
                    return Unauthorized(new ApiResponse<object>(false, _localizer["invalid_session"]));

                SetRefreshTokenInCookie(result.RefreshToken, result.ExpiresOn);
                return Ok(new ApiResponse<UserDto>(true, _localizer["token_refreshed"], result));
            }
            catch (InvalidOperationException ex)
            {
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(new ApiResponse<object>(false, ex.Message));
            }
        }

        [HttpGet("sessions")]
        [Authorize]
        public async Task<IActionResult> GetSessions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var sessions = await _context.UserSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.LoginAt)
                .Take(10)
                .Select(s => new
                {
                    s.Id, s.IpAddress, s.Browser, s.OS,
                    s.DeviceInfo, s.LoginAt, s.LastActiveAt, s.IsActive,
                })
                .ToListAsync();

            return Ok(sessions);
        }

        private void SetRefreshTokenInCookie(string refreshToken, DateTime expires)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly  = true,
                Expires   = expires.ToLocalTime(),
                Secure    = true,
                IsEssential = true,
                SameSite  = SameSiteMode.None
            });
        }
    }
}
