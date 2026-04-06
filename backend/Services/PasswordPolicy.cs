using Microsoft.AspNetCore.Identity;

namespace NhyiraHaven.Services;

/// <summary>
/// Password policy following IS 414 requirements.
/// Minimum 12 characters, no other requirements.
/// Users can include uppercase, lowercase, digits, specials if they want.
/// </summary>
public static class PasswordPolicy
{
    public const int MinimumLength = 12;
    public const int MaximumLength = 128;

    public static bool ValidatePassword(string password, out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrEmpty(password))
        {
            errors.Add("Password is required.");
            return false;
        }

        if (password.Length < MinimumLength)
        {
            errors.Add($"Password must be at least {MinimumLength} characters long.");
        }

        if (password.Length > MaximumLength)
        {
            errors.Add($"Password must be less than {MaximumLength} characters.");
        }

        return errors.Count == 0;
    }

    public static IdentityOptions GetIdentityOptions()
    {
        return new IdentityOptions
        {
            Password = new PasswordOptions
            {
                RequiredLength = MinimumLength,
                RequiredUniqueChars = 1,
                RequireDigit = false,
                RequireLowercase = false,
                RequireNonAlphanumeric = false,
                RequireUppercase = false
            },
            User = new UserOptions
            {
                RequireUniqueEmail = true
            },
            SignIn = new SignInOptions
            {
                RequireConfirmedEmail = false,
                RequireConfirmedAccount = false
            },
            Lockout = new LockoutOptions
            {
                DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30),
                MaxFailedAccessAttempts = 5,
                AllowedForNewUsers = true
            }
        };
    }
}