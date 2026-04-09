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

            // Create user (force Donor role for self-registration)
            var safeRole = new[] { "Donor" }.Contains(model.Role, StringComparer.OrdinalIgnoreCase)
                ? model.Role : "Donor";
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Role = safeRole,
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

            // Assign role (only Donor allowed via self-registration)
            var allowedSelfRegRoles = new[] { "Donor" };
            var assignedRole = allowedSelfRegRoles.Contains(model.Role, StringComparer.OrdinalIgnoreCase)
                ? model.Role
                : "Donor";

            if (!await _roleManager.RoleExistsAsync(assignedRole))
            {
                await _roleManager.CreateAsync(new IdentityRole(assignedRole));
            }
            await _userManager.AddToRoleAsync(user, assignedRole);

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

            if (result.RequiresTwoFactor)
            {
                // User has MFA enabled — issue a short-lived MFA token
                var mfaToken = GenerateMfaToken(user);
                return Ok(new AuthResponseDto
                {
                    Success = false,
                    RequiresMfa = true,
                    MfaToken = mfaToken,
                    Message = "MFA verification required."
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

    // GET: api/auth/test-accounts (admin only)
    [HttpGet("test-accounts")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
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

    // POST: api/auth/reset-seeded-passwords (admin only)
    [HttpPost("reset-seeded-passwords")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
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

    // POST: api/auth/mfa/setup
    [HttpPost("mfa/setup")]
    public async Task<ActionResult<MfaSetupResponseDto>> MfaSetup()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new MfaSetupResponseDto { Success = false, Message = "Not authenticated." });
        }

        // Reset the authenticator key so the user gets a fresh one
        await _userManager.ResetAuthenticatorKeyAsync(user);
        var unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(unformattedKey))
        {
            return StatusCode(500, new MfaSetupResponseDto { Success = false, Message = "Failed to generate authenticator key." });
        }

        var email = user.Email ?? "user";
        var qrCodeUri = $"otpauth://totp/NhyiraHaven:{email}?secret={unformattedKey}&issuer=NhyiraHaven&digits=6";

        return Ok(new MfaSetupResponseDto
        {
            Success = true,
            Message = "Scan the QR code with your authenticator app, then verify with a code.",
            SharedKey = FormatKey(unformattedKey),
            QrCodeUri = qrCodeUri
        });
    }

    // POST: api/auth/mfa/verify-setup
    [HttpPost("mfa/verify-setup")]
    public async Task<ActionResult<AuthResponseDto>> MfaVerifySetup([FromBody] MfaVerifyDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new AuthResponseDto { Success = false, Message = "Not authenticated." });
        }

        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            model.Code);

        if (!isValid)
        {
            return BadRequest(new AuthResponseDto { Success = false, Message = "Invalid verification code. Please try again." });
        }

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        var recoveryCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 5);

        return Ok(new AuthResponseDto
        {
            Success = true,
            Message = "MFA has been enabled successfully.",
            Errors = recoveryCodes // Reusing Errors field to return recovery codes
        });
    }

    // POST: api/auth/mfa/verify
    [HttpPost("mfa/verify")]
    public async Task<ActionResult<AuthResponseDto>> MfaVerify([FromBody] MfaLoginDto model)
    {
        try
        {
            // Validate the short-lived MFA token to get the user
            var userId = ValidateMfaToken(model.MfaToken);
            if (userId == null)
            {
                return Unauthorized(new AuthResponseDto { Success = false, Message = "Invalid or expired MFA session. Please login again." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized(new AuthResponseDto { Success = false, Message = "User not found." });
            }

            // Try TOTP code first, then recovery code
            var isValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                _userManager.Options.Tokens.AuthenticatorTokenProvider,
                model.Code);

            if (!isValid)
            {
                // Try as a recovery code
                var recoveryResult = await _userManager.RedeemTwoFactorRecoveryCodeAsync(user, model.Code);
                if (!recoveryResult.Succeeded)
                {
                    return Unauthorized(new AuthResponseDto { Success = false, Message = "Invalid verification code." });
                }
            }

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Generate full JWT
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
            _logger.LogError(ex, "MFA verification error");
            return StatusCode(500, new AuthResponseDto { Success = false, Message = "An error occurred during MFA verification." });
        }
    }

    // POST: api/auth/mfa/disable
    [HttpPost("mfa/disable")]
    public async Task<ActionResult<AuthResponseDto>> MfaDisable([FromBody] MfaVerifyDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new AuthResponseDto { Success = false, Message = "Not authenticated." });
        }

        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            model.Code);

        if (!isValid)
        {
            return BadRequest(new AuthResponseDto { Success = false, Message = "Invalid verification code." });
        }

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.ResetAuthenticatorKeyAsync(user);

        return Ok(new AuthResponseDto { Success = true, Message = "MFA has been disabled." });
    }

    // POST: api/auth/mfa/status
    [HttpGet("mfa/status")]
    public async Task<ActionResult> MfaStatus()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { enabled = false });
        }

        return Ok(new { enabled = user.TwoFactorEnabled });
    }

    private string GenerateMfaToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "NhyiraHaven2026SecretKeyForDevelopmentOnly!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("mfa_user_id", user.Id),
            new Claim("purpose", "mfa")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "NhyiraHaven",
            audience: _configuration["Jwt:Audience"] ?? "NhyiraHaven",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(5), // Short-lived
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string? ValidateMfaToken(string mfaToken)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "NhyiraHaven2026SecretKeyForDevelopmentOnly!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(mfaToken, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"] ?? "NhyiraHaven",
                ValidAudience = _configuration["Jwt:Audience"] ?? "NhyiraHaven",
                IssuerSigningKey = key
            }, out _);

            var purposeClaim = principal.FindFirst("purpose")?.Value;
            if (purposeClaim != "mfa") return null;

            return principal.FindFirst("mfa_user_id")?.Value;
        }
        catch
        {
            return null;
        }
    }

    private static string FormatKey(string unformattedKey)
    {
        var result = new StringBuilder();
        int currentPosition = 0;
        while (currentPosition + 4 < unformattedKey.Length)
        {
            result.Append(unformattedKey.AsSpan(currentPosition, 4)).Append(' ');
            currentPosition += 4;
        }
        if (currentPosition < unformattedKey.Length)
        {
            result.Append(unformattedKey.AsSpan(currentPosition));
        }
        return result.ToString().Trim();
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