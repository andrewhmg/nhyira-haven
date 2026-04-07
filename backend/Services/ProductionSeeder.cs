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
                new() { FirstName = "Amara", LastName = "O.", DateOfBirth = DateTime.UtcNow.AddYears(-16), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-6), SafehouseId = 1, IsActive = true, CaseSummary = "Rescued from trafficking situation. Making excellent progress in counseling and education." },
                new() { FirstName = "Chioma", LastName = "N.", DateOfBirth = DateTime.UtcNow.AddYears(-14), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-8), SafehouseId = 1, IsActive = true, CaseSummary = "Survivor of abuse. Thriving in school and art therapy programs." },
                new() { FirstName = "Fatima", LastName = "A.", DateOfBirth = DateTime.UtcNow.AddYears(-15), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-4), SafehouseId = 2, IsActive = true, CaseSummary = "Recently admitted. Beginning trauma-informed care and stabilization." },
                new() { FirstName = "Grace", LastName = "E.", DateOfBirth = DateTime.UtcNow.AddYears(-17), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-10), SafehouseId = 2, IsActive = true, CaseSummary = "Long-term resident. Preparing for vocational training program." },
                new() { FirstName = "Khadija", LastName = "M.", DateOfBirth = DateTime.UtcNow.AddYears(-13), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-2), SafehouseId = 3, IsActive = true, CaseSummary = "New arrival. Responding well to initial interventions." },
                new() { FirstName = "Blessing", LastName = "O.", DateOfBirth = DateTime.UtcNow.AddYears(-16), Gender = "Female", AdmissionDate = DateTime.UtcNow.AddMonths(-5), SafehouseId = 3, IsActive = true, CaseSummary = "Showing remarkable resilience. Exceling in mathematics and science." }
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
                new() { FirstName = "John", LastName = "Smith", Email = "john.smith@email.com", SupporterType = "Individual", TotalDonated = 5000, IsRecurring = true, MonthlyAmount = 100 },
                new() { FirstName = "Sarah", LastName = "Johnson", Email = "sarah.j@email.com", SupporterType = "Individual", TotalDonated = 2500, IsRecurring = true, MonthlyAmount = 50 },
                new() { FirstName = "Michael", LastName = "Chen", Email = "m.chen@email.com", SupporterType = "Individual", TotalDonated = 10000, IsRecurring = false, MonthlyAmount = 0 },
                new() { FirstName = "Emma", LastName = "Williams", Email = "emma.w@email.com", SupporterType = "Individual", TotalDonated = 1200, IsRecurring = true, MonthlyAmount = 25 },
                new() { Name = "TechCorp Foundation", Email = "giving@techcorp.com", SupporterType = "Corporate", TotalDonated = 50000, IsRecurring = false, MonthlyAmount = 0 },
                new() { Name = "Global Aid Partners", Email = "contact@globalaid.org", SupporterType = "Organization", TotalDonated = 75000, IsRecurring = true, MonthlyAmount = 5000 }
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
                SnapshotDate = DateTime.UtcNow,
                TotalGirlsServed = 247,
                ActiveSafehouses = 3,
                TotalSupporters = 156,
                TotalRaised = 425000
            };
            await _context.PublicImpactSnapshots.AddAsync(snapshots);
            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Seeded impact statistics");
        }

        Console.WriteLine("🎉 Sample data seeding completed!");
    }
}
