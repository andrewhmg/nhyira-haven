using Microsoft.AspNetCore.Identity;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Data;

public static class DbInitializer
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        // Seed roles
        string[] roles = { "Admin", "Staff", "Donor" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed Admin account (no MFA)
        var adminEmail = "admin@nhyirahaven.org";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Amara",
                LastName = "Okafor",
                Role = "Admin",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(adminUser, "NhyiraHaven2026!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed Staff account
        var staffEmail = "staff@nhyirahaven.org";
        var staffUser = await userManager.FindByEmailAsync(staffEmail);
        if (staffUser == null)
        {
            staffUser = new ApplicationUser
            {
                UserName = staffEmail,
                Email = staffEmail,
                FirstName = "James",
                LastName = "Mensah",
                Role = "Staff",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(staffUser, "NhyiraHaven2026!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(staffUser, "Staff");
            }
        }

        // Seed Donor account (no MFA, with history)
        var donorEmail = "donor@example.com";
        var donorUser = await userManager.FindByEmailAsync(donorEmail);
        if (donorUser == null)
        {
            donorUser = new ApplicationUser
            {
                UserName = donorEmail,
                Email = donorEmail,
                FirstName = "David",
                LastName = "Mensah",
                Role = "Donor",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(donorUser, "NhyiraHaven2026!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(donorUser, "Donor");
            }
        }

        // Seed Account WITH MFA
        var mfaEmail = "secure@nhyirahaven.org";
        var mfaUser = await userManager.FindByEmailAsync(mfaEmail);
        if (mfaUser == null)
        {
            mfaUser = new ApplicationUser
            {
                UserName = mfaEmail,
                Email = mfaEmail,
                FirstName = "Security",
                LastName = "Admin",
                Role = "Admin",
                EmailConfirmed = true,
                TwoFactorEnabled = true, // MFA enabled
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(mfaUser, "NhyiraHaven2026!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(mfaUser, "Admin");
            }
        }

        await context.SaveChangesAsync();
    }
}