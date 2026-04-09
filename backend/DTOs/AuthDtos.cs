using System.ComponentModel.DataAnnotations;

namespace NhyiraHaven.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required")]
    [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(128, MinimumLength = 12, ErrorMessage = "Password must be at least 12 characters")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role is required")]
    public string Role { get; set; } = "Donor"; // Default to Donor
}

public class LoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public UserDto? User { get; set; }
    public IEnumerable<string>? Errors { get; set; }
    public bool RequiresMfa { get; set; }
    public string? MfaToken { get; set; }
}

public class MfaSetupResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? SharedKey { get; set; }
    public string? QrCodeUri { get; set; }
}

public class MfaVerifyDto
{
    [Required(ErrorMessage = "Verification code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be 6 digits")]
    public string Code { get; set; } = string.Empty;
}

public class MfaLoginDto
{
    [Required(ErrorMessage = "MFA token is required")]
    public string MfaToken { get; set; } = string.Empty;

    [Required(ErrorMessage = "Verification code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be 6 digits")]
    public string Code { get; set; } = string.Empty;
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
}

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [StringLength(128, MinimumLength = 12, ErrorMessage = "Password must be at least 12 characters")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Token is required")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [StringLength(128, MinimumLength = 12, ErrorMessage = "Password must be at least 12 characters")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}