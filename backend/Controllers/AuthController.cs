using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using NhyiraHaven.Data;
using NhyiraHaven.DTOs;
using NhyiraHaven.Models;
using NhyiraHaven.Services;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _logger = logger;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto model)
    {
        try
        {
            // Validate password length
            if (model.Password.Length < PasswordPolicy.MinimumLength)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = $"Password must be at least {PasswordPolicy.MinimumLength} characters.",
                    Errors = new[] { $"Password must be at least {PasswordPolicy.MinimumLength} characters." }
                });
            }

            // Check if email exists
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "An account with this email already exists."
                });
            }

            // Create user
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Role = model.Role,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Registration failed.",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }

            // Assign role
            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(model.Role));
            }
            await _userManager.AddToRoleAsync(user, model.Role);

            // Generate token
            var token = GenerateJwtToken(user);
            var userDto = await GetUserDto(user);

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful.",
                Token = token,
                User = userDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error for {Email}", model.Email);
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during registration."
            });
        }
    }

    // POST: api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                });
            }

            var result = await _signInManager.PasswordSignInAsync(
                user.UserName ?? user.Email!,
                model.Password,
                model.RememberMe,
                lockoutOnFailure: true);

            if (result.IsLockedOut)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Account is locked out. Please try again later."
                });
            }

            if (!result.Succeeded)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                });
            }

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Generate token
            var token = GenerateJwtToken(user);
            var userDto = await GetUserDto(user);

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                User = userDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for {Email}", model.Email);
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during login."
            });
        }
    }

    // POST: api/auth/logout
    [HttpPost("logout")]
    public async Task<ActionResult<AuthResponseDto>> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new AuthResponseDto
        {
            Success = true,
            Message = "Logout successful."
        });
    }

    // GET: api/auth/me
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponseDto>> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new AuthResponseDto
            {
                Success = false,
                Message = "Not authenticated."
            });
        }

        var userDto = await GetUserDto(user);
        return Ok(new AuthResponseDto
        {
            Success = true,
            User = userDto
        });
    }

    // POST: api/auth/change-password
    [HttpPost("change-password")]
    public async Task<ActionResult<AuthResponseDto>> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new AuthResponseDto
            {
                Success = false,
                Message = "Not authenticated."
            });
        }

        // Validate new password length
        if (model.NewPassword.Length < PasswordPolicy.MinimumLength)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = $"Password must be at least {PasswordPolicy.MinimumLength} characters.",
                Errors = new[] { $"Password must be at least {PasswordPolicy.MinimumLength} characters." }
            });
        }

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Password change failed.",
                Errors = result.Errors.Select(e => e.Description)
            });
        }

        return Ok(new AuthResponseDto
        {
            Success = true,
            Message = "Password changed successfully."
        });
    }

    // GET: api/auth/test-accounts
    [HttpGet("test-accounts")]
    [AllowAnonymous]
    public ActionResult<object> GetTestAccounts()
    {
        // For IS 414 submission - shows test account credentials
        return Ok(new
        {
            message = "Test accounts for IS 414 security demonstration",
            accounts = new[]
            {
                new { email = "admin@nhyirahaven.org", password = "NhyiraHaven2026!", role = "Admin", mfa = false, hasHistory = false },
                new { email = "staff@nhyirahaven.org", password = "NhyiraHaven2026!", role = "Staff", mfa = false, hasHistory = false },
                new { email = "donor@example.com", password = "NhyiraHaven2026!", role = "Donor", mfa = false, hasHistory = true },
                new { email = "secure@nhyirahaven.org", password = "NhyiraHaven2026!", role = "Admin", mfa = true, hasHistory = false }
            }
        });
    }

    // POST: api/auth/reset-seeded-passwords
    [HttpPost("reset-seeded-passwords")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> ResetSeededPasswords()
    {
        try
        {
            var users = new[] {
                (email: "admin@nhyirahaven.org", password: "NhyiraHaven2026!"),
                (email: "staff@nhyirahaven.org", password: "NhyiraHaven2026!"),
                (email: "donor@example.com", password: "NhyiraHaven2026!")
            };

            var results = new List<string>();
            foreach (var (email, password) in users)
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user != null)
                {
                    // Remove old password and set new one
                    var removeResult = await _userManager.RemovePasswordAsync(user);
                    if (removeResult.Succeeded)
                    {
                        var addResult = await _userManager.AddPasswordAsync(user, password);
                        if (addResult.Succeeded)
                        {
                            results.Add($"{email}: password reset");
                        }
                        else
                        {
                            results.Add($"{email}: failed - {string.Join(",", addResult.Errors.Select(e => e.Description))}");
                        }
                    }
                    else
                    {
                        results.Add($"{email}: failed to remove old password");
                    }
                }
                else
                {
                    results.Add($"{email}: user not found");
                }
            }

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = string.Join("; ", results)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reset seeded passwords");
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = $"Failed to reset passwords: {ex.Message}"
            });
        }
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "NhyiraHaven2026SecretKeyForDevelopmentOnly!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.GivenName, user.FirstName ?? ""),
            new(ClaimTypes.Surname, user.LastName ?? ""),
            new("role", user.Role ?? "Donor")
        };

        // Add role claims
        var roles = _userManager.GetRolesAsync(user).Result;
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "NhyiraHaven",
            audience: _configuration["Jwt:Audience"] ?? "NhyiraHaven",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<UserDto> GetUserDto(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Role = roles.FirstOrDefault() ?? user.Role ?? "Donor",
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin
        };
    }
}