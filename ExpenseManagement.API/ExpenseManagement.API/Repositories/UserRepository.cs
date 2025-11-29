using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.Account;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ExpenseManagement.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public UserRepository(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        public async Task<UserDto> Login(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return null;

            var isValid = await _userManager.CheckPasswordAsync(user, password);
            if (!isValid) return null;

            // get user role
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            // Id في Identity عبارة عن string
            var jwtToken = GenerateJwtToken(user.Email, role, user.Id);

            // Check for an existing active refresh token
            var activeRefreshToken = await _context.RefreshTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(rt =>
                    rt.UserId == user.Id &&
                    rt.RevokedOn == null &&
                    rt.ExpiresOn > DateTime.UtcNow);

            RefreshToken refreshToken;

            if (activeRefreshToken != null)
            {
                refreshToken = activeRefreshToken;
            }
            else
            {
                refreshToken = GenerateRefreshToken();
                refreshToken.UserId = user.Id;
                _context.RefreshTokens.Add(refreshToken);
               await _context.SaveChangesAsync();
            }


            return new UserDto
            {
                Id = user.Id,
                UserName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Token = jwtToken,
                RefreshToken = refreshToken.Token,
                ExpiresOn = refreshToken.ExpiresOn
            };
        }

        public async Task<UserDto> RefreshToken(string token)
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null)
                return null;

            var user = refreshToken.User;

            if (refreshToken.RevokedOn != null)
                throw new InvalidOperationException("Token already revoked.");

            if (refreshToken.ExpiresOn <= DateTime.UtcNow)
            {
                refreshToken.RevokedOn = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                throw new InvalidOperationException("Token expired.");
            }

            // Revoke old token
            refreshToken.RevokedOn = DateTime.UtcNow;

            // Generate a new refresh token
            var newRefreshToken = GenerateRefreshToken();
            newRefreshToken.UserId = user.Id;

            await _context.RefreshTokens.AddAsync(newRefreshToken);

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            // Generate new JWT using user's real Id
            var newJwtToken = GenerateJwtToken(user.Email, role, user.Id);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                UserName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Token = newJwtToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresOn = newRefreshToken.ExpiresOn
            };
        }

        public async Task<bool> Registeration(RegisterDto registerDto)
        {
            var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
            if (userExists != null) return false;

            var user = new ApplicationUser
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                UserName = registerDto.Email
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return false;

            var roleResult = await _userManager.AddToRoleAsync(user, registerDto.Role);
            if (!roleResult.Succeeded) return false;

            return true;
        }

        public async Task<bool> Logout(string refreshToken)
        {
            var token = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (token == null)
                return false;

            // search for user tokens
            var userTokens = await _context.RefreshTokens
                .Where(r => r.UserId == token.UserId && r.RevokedOn == null)
                .ToListAsync();

            foreach (var t in userTokens)
                t.RevokedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateJwtToken(string email, string role, string userId)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])); 

            var credentials = new SigningCredentials(
                securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],   
                audience: _configuration["Jwt:Audience"],   
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            RandomNumberGenerator.Fill(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                ExpiresOn = DateTime.UtcNow.AddDays(2),  
                CreatedOn = DateTime.UtcNow
            };
        }
    }
}
