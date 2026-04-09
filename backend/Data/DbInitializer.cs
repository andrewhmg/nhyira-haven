using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(mfaUser, "NhyiraHaven2026!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(mfaUser, "Admin");
                // Set up authenticator key so MFA actually works
                await userManager.ResetAuthenticatorKeyAsync(mfaUser);
                await userManager.SetTwoFactorEnabledAsync(mfaUser, true);
            }
        }

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Creates a Donor user account for every Supporter that doesn't have one yet,
    /// and links the Supporter.UserId to the new account.
    /// Password = FirstNameLastName2026! (e.g. DavidMensah2026!)
    /// </summary>
    public static async Task SeedDonorAccountsAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        if (!await roleManager.RoleExistsAsync("Donor"))
        {
            await roleManager.CreateAsync(new IdentityRole("Donor"));
        }

        // Get all supporters that don't yet have a linked user account
        var unlinkedSupporters = await context.Supporters
            .Where(s => s.UserId == null)
            .ToListAsync();

        foreach (var supporter in unlinkedSupporters)
        {
            // Check if a user with this email already exists (e.g. the seeded donor@example.com)
            var existingUser = await userManager.FindByEmailAsync(supporter.Email);
            if (existingUser != null)
            {
                // Link existing user account to this supporter
                supporter.UserId = existingUser.Id;
                continue;
            }

            // Create a new Donor user account
            var password = $"{supporter.FirstName}{supporter.LastName}2026!";
            var newUser = new ApplicationUser
            {
                UserName = supporter.Email,
                Email = supporter.Email,
                FirstName = supporter.FirstName,
                LastName = supporter.LastName,
                Role = "Donor",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(newUser, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newUser, "Donor");
                supporter.UserId = newUser.Id;
            }
        }

        await context.SaveChangesAsync();
    }
}