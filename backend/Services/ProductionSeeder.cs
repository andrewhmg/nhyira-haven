using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Services;

public class ProductionSeeder
{
    private readonly ApplicationDbContext _context;

    public ProductionSeeder(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedSampleDataAsync()
    {
        Console.WriteLine("🌱 Seeding sample data for production...");

        // Seed Safehouses
        if (!await _context.Safehouses.AnyAsync())
        {
            var safehouses = new List<Safehouse>
            {
                new() { Name = "Accra Safehouse", Location = "Accra, Ghana", Capacity = 25, CurrentResidents = 18, EstablishedDate = DateTime.UtcNow.AddYears(-3), IsActive = true },
                new() { Name = "Lagos Haven", Location = "Lagos, Nigeria", Capacity = 30, CurrentResidents = 22, EstablishedDate = DateTime.UtcNow.AddYears(-2), IsActive = true },
                new() { Name = "Abuja Recovery Center", Location = "Abuja, Nigeria", Capacity = 20, CurrentResidents = 15, EstablishedDate = DateTime.UtcNow.AddYears(-1), IsActive = true }
            };
            await _context.Safehouses.AddRangeAsync(safehouses);
            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ Seeded {safehouses.Count} safehouses");
        }

        // Seed Residents
        if (!await _context.Residents.AnyAsync())
        {
            var residents = new List<Resident>
            {
                new() { CaseNumber = "NH-2025-001", FirstName = "Amara", LastName = "O.", DateOfBirth = DateTime.UtcNow.AddYears(-16), Gender = "Female", SafehouseId = 1, IntakeDate = DateTime.UtcNow.AddMonths(-6), CaseCategory = "Trafficking", ReferralSource = "Law Enforcement", Status = "Active", IsActive = true },
                new() { CaseNumber = "NH-2025-002", FirstName = "Chioma", LastName = "N.", DateOfBirth = DateTime.UtcNow.AddYears(-14), Gender = "Female", SafehouseId = 1, IntakeDate = DateTime.UtcNow.AddMonths(-8), CaseCategory = "Abuse", ReferralSource = "Social Services", Status = "Active", IsActive = true },
                new() { CaseNumber = "NH-2025-003", FirstName = "Fatima", LastName = "A.", DateOfBirth = DateTime.UtcNow.AddYears(-15), Gender = "Female", SafehouseId = 2, IntakeDate = DateTime.UtcNow.AddMonths(-4), CaseCategory = "Trafficking", ReferralSource = "NGO Partner", Status = "Active", IsActive = true },
                new() { CaseNumber = "NH-2025-004", FirstName = "Grace", LastName = "E.", DateOfBirth = DateTime.UtcNow.AddYears(-17), Gender = "Female", SafehouseId = 2, IntakeDate = DateTime.UtcNow.AddMonths(-10), CaseCategory = "Abuse", ReferralSource = "Family", Status = "Active", IsActive = true },
                new() { CaseNumber = "NH-2025-005", FirstName = "Khadija", LastName = "M.", DateOfBirth = DateTime.UtcNow.AddYears(-13), Gender = "Female", SafehouseId = 3, IntakeDate = DateTime.UtcNow.AddMonths(-2), CaseCategory = "Trafficking", ReferralSource = "Hotline", Status = "Active", IsActive = true },
                new() { CaseNumber = "NH-2025-006", FirstName = "Blessing", LastName = "O.", DateOfBirth = DateTime.UtcNow.AddYears(-16), Gender = "Female", SafehouseId = 3, IntakeDate = DateTime.UtcNow.AddMonths(-5), CaseCategory = "Abuse", ReferralSource = "School", Status = "Active", IsActive = true }
            };
            await _context.Residents.AddRangeAsync(residents);
            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ Seeded {residents.Count} residents");
        }

        // Seed Supporters (Donors)
        if (!await _context.Supporters.AnyAsync())
        {
            var supporters = new List<Supporter>
            {
                new() { FirstName = "John", LastName = "Smith", Email = "john.smith@email.com", SupporterType = "Individual", TotalDonated = 5000, JoinedDate = DateTime.UtcNow.AddYears(-2), IsActive = true },
                new() { FirstName = "Sarah", LastName = "Johnson", Email = "sarah.j@email.com", SupporterType = "Individual", TotalDonated = 2500, JoinedDate = DateTime.UtcNow.AddYears(-1), IsActive = true },
                new() { FirstName = "Michael", LastName = "Chen", Email = "m.chen@email.com", SupporterType = "Individual", TotalDonated = 10000, JoinedDate = DateTime.UtcNow.AddMonths(-6), IsActive = true },
                new() { FirstName = "Emma", LastName = "Williams", Email = "emma.w@email.com", SupporterType = "Individual", TotalDonated = 1200, JoinedDate = DateTime.UtcNow.AddMonths(-3), IsActive = true },
                new() { FirstName = "Corporate", LastName = "Donor", Email = "giving@techcorp.com", SupporterType = "Corporate", TotalDonated = 50000, JoinedDate = DateTime.UtcNow.AddYears(-1), IsActive = true },
                new() { FirstName = "Global", LastName = "Aid", Email = "contact@globalaid.org", SupporterType = "Foundation", TotalDonated = 75000, JoinedDate = DateTime.UtcNow.AddMonths(-8), IsActive = true }
            };
            await _context.Supporters.AddRangeAsync(supporters);
            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ Seeded {supporters.Count} supporters");
        }

        // Seed Donations
        if (!await _context.Donations.AnyAsync())
        {
            var donations = new List<Donation>
            {
                new() { SupporterId = 1, Amount = 100, DonationDate = DateTime.UtcNow.AddDays(-5), DonationType = "Recurring" },
                new() { SupporterId = 2, Amount = 50, DonationDate = DateTime.UtcNow.AddDays(-3), DonationType = "Recurring" },
                new() { SupporterId = 3, Amount = 10000, DonationDate = DateTime.UtcNow.AddMonths(-2), DonationType = "One-time" },
                new() { SupporterId = 4, Amount = 25, DonationDate = DateTime.UtcNow.AddDays(-1), DonationType = "Recurring" },
                new() { SupporterId = 5, Amount = 50000, DonationDate = DateTime.UtcNow.AddMonths(-1), DonationType = "Grant" },
                new() { SupporterId = 6, Amount = 5000, DonationDate = DateTime.UtcNow.AddDays(-10), DonationType = "Recurring" }
            };
            await _context.Donations.AddRangeAsync(donations);
            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ Seeded {donations.Count} donations");
        }

        // Seed Public Impact Snapshots (for homepage stats)
        if (!await _context.PublicImpactSnapshots.AnyAsync())
        {
            var snapshots = new PublicImpactSnapshot
            {
                Id = 1,
                Title = "Q1 2026 Impact Report",
                SnapshotDate = DateTime.UtcNow,
                TotalResidentsServed = 247,
                ActiveResidents = 55,
                SuccessfulReintegrations = 89,
                TotalDonationsReceived = 425000,
                TotalDonors = 156,
                ActivePartners = 23,
                SafehouseCount = 3,
                IsPublished = true,
                PublishedDate = DateTime.UtcNow
            };
            await _context.PublicImpactSnapshots.AddAsync(snapshots);
            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Seeded impact statistics");
        }

        Console.WriteLine("🎉 Sample data seeding completed!");
    }
}
