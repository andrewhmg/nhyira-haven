using Microsoft.AspNetCore.Identity;

namespace NhyiraHaven.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Role { get; set; } // Admin, Staff, Donor
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
}