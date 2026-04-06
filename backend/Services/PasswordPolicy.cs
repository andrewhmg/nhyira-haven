using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace NhyiraHaven.Services;

/// <summary>
/// Custom password policies following IS 414 requirements.
/// IMPORTANT: Follow class/lab instructions, NOT AI suggestions.
/// </summary>
public static class PasswordPolicy
{
    // Password requirements based on class instructions
    public const int MinimumLength = 12;
    public const int MaximumLength = 128;
    public const int RequiredUniqueChars = 4;
    
    public static bool RequiresUpper { get; } = true;
    public static bool RequiresLower { get; } = true;
    public static bool RequiresDigit { get; } = true;
    public static bool RequiresSpecial { get; } = true;
    
    public static readonly string SpecialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

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

        if (RequiresUpper && !password.Any(char.IsUpper))
        {
            errors.Add("Password must contain at least one uppercase letter.");
        }

        if (RequiresLower && !password.Any(char.IsLower))
        {
            errors.Add("Password must contain at least one lowercase letter.");
        }

        if (RequiresDigit && !password.Any(char.IsDigit))
        {
            errors.Add("Password must contain at least one number.");
        }

        if (RequiresSpecial && !password.Any(c => SpecialChars.Contains(c)))
        {
            errors.Add($"Password must contain at least one special character: {SpecialChars}");
        }

        // Check for common passwords
        var commonPasswords = new[]
        {
            "password", "password1", "password123", "123456789", "qwerty",
            "abc123", "letmein", "welcome", "monkey", "sunshine"
        };
        
        if (commonPasswords.Any(common => password.ToLower().Contains(common)))
        {
            errors.Add("Password contains a common pattern. Please choose a stronger password.");
        }

        // Check for sequential characters
        if (HasSequentialChars(password))
        {
            errors.Add("Password cannot contain sequential characters (e.g., 'abc', '123').");
        }

        return errors.Count == 0;
    }

    private static bool HasSequentialChars(string password)
    {
        for (int i = 0; i < password.Length - 2; i++)
        {
            if (password[i] + 1 == password[i + 1] && password[i + 1] + 1 == password[i + 2])
            {
                return true;
            }
        }
        return false;
    }

    public static IdentityOptions GetIdentityOptions()
    {
        return new IdentityOptions
        {
            Password = new PasswordOptions
            {
                RequiredLength = MinimumLength,
                RequiredUniqueChars = RequiredUniqueChars,
                RequireDigit = RequiresDigit,
                RequireLowercase = RequiresLower,
                RequireNonAlphanumeric = RequiresSpecial,
                RequireUppercase = RequiresUpper
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