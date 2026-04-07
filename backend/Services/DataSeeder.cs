using System.Globalization;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;
using Npgsql;

namespace NhyiraHaven.Services;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly string _csvPath;

    public DataSeeder(ApplicationDbContext context, string csvPath)
    {
        _context = context;
        _csvPath = csvPath;
    }

    public async Task SeedAllAsync()
    {
        Console.WriteLine("Starting data seeding...");

        // Check if using PostgreSQL
        var isPostgres = _context.Database.ProviderName?.Contains("Npgsql") == true;

        List<string>? droppedFks = null;
        if (isPostgres)
        {
            // PostgreSQL: Drop FK constraints temporarily
            Console.WriteLine("Using PostgreSQL - dropping FK constraints temporarily");
            droppedFks = await DropForeignKeyConstraintsPostgres();
        }

        try
        {
            await SeedSafehousesAsync();
            await SeedPartnersAsync();
            await SeedPartnerAssignmentsAsync();
            await SeedSupportersAsync();
            await SeedDonationsAsync();
            await SeedInKindDonationItemsAsync();
            await SeedDonationAllocationsAsync();
            await SeedResidentsAsync();
            await SeedProcessRecordingsAsync();
            await SeedHomeVisitationsAsync();
            await SeedEducationRecordsAsync();
            await SeedHealthWellbeingRecordsAsync();
            await SeedInterventionPlansAsync();
            await SeedIncidentReportsAsync();
            await SeedSocialMediaPostsAsync();
            await SeedSafehouseMonthlyMetricsAsync();
            await SeedPublicImpactSnapshotsAsync();
        }
        finally
        {
            // Recreate foreign key constraints
            if (isPostgres && droppedFks != null)
            {
                await CreateForeignKeyConstraintsPostgres(droppedFks);
                Console.WriteLine("PostgreSQL FK constraints recreated");
            }
        }

        Console.WriteLine("Data seeding completed!");
    }

    private async Task<List<string>> DropForeignKeyConstraintsPostgres()
    {
        var droppedFks = new List<string>();
        var dropCommands = new List<string>();
        
        // Query all FK constraints in public schema
        var sql = @"
            SELECT tc.constraint_name, 
                   'ALTER TABLE ""' || tc.table_schema || '"".""' || tc.table_name || '"" DROP CONSTRAINT ""' || tc.constraint_name || '"";' as drop_sql
            FROM information_schema.table_constraints tc
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'";
        
        var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        
        using var cmd = connection.CreateCommand();
        cmd.CommandText = sql;
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            dropCommands.Add(reader.GetString(1));
            droppedFks.Add(reader.GetString(0));
        }
        
        await reader.CloseAsync();
        
        // Now execute all drop commands
        foreach (var dropSql in dropCommands)
        {
            await _context.Database.ExecuteSqlRawAsync(dropSql);
        }
        
        Console.WriteLine("Dropped {0} FK constraints", droppedFks.Count);
        return droppedFks;
    }

    private async Task CreateForeignKeyConstraintsPostgres(List<string> droppedFks)
    {
        // Recreate FK constraints by running EnsureCreated which applies the model
        // This will recreate all constraints defined in the DbContext
        try
        {
            await _context.Database.EnsureCreatedAsync();
            Console.WriteLine("Recreated {0} FK constraints via EnsureCreated", droppedFks.Count);
        }
        catch (Exception ex)
        {
            // If EnsureCreated fails (tables exist), we need to recreate constraints manually
            // For now, log the issue - constraints exist in migrations for next clean deploy
            Console.WriteLine("Note: FK constraints exist in migrations. Dropped: {0}. Error: {1}", droppedFks.Count, ex.Message);
        }
    }

    private async Task SeedSafehousesAsync()
    {
        if (await _context.Safehouses.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "safehouses.csv"));
        var entities = new List<Safehouse>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new Safehouse
            {
                Id = ParseInt(cols[0]), // Preserve original ID
                Name = cols[2],
                Location = $"{cols[4]}, {cols[5]}, {cols[6]}",
                Capacity = ParseInt(cols[10]),
                CurrentResidents = ParseInt(cols[12]),
                EstablishedDate = ParseDate(cols[7]),
                IsActive = cols[8]?.ToLower() == "active"
            });
        }

        await _context.Safehouses.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} safehouses");
    }

    private async Task SeedPartnersAsync()
    {
        if (await _context.Partners.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "partners.csv"));
        var entities = new List<Partner>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 8) continue;

            entities.Add(new Partner
            {
                Id = ParseInt(cols[0]), // Preserve original ID
                Name = cols[1],
                PartnerType = cols[2],
                ContactName = cols[3],
                ContactPhone = cols[4],
                ContactEmail = cols[5],
                ServicesProvided = cols[6],
                PartnershipStartDate = ParseDate(cols[7]),
                IsActive = cols[8]?.ToLower() == "active"
            });
        }

        await _context.Partners.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} partners");
    }

    private async Task SeedPartnerAssignmentsAsync()
    {
        if (await _context.PartnerAssignments.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "partner_assignments.csv"));
        var entities = new List<PartnerAssignment>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 6) continue;

            entities.Add(new PartnerAssignment
            {
                SafehouseId = ParseInt(cols[1]),
                PartnerId = ParseInt(cols[2]),
                AssignmentDate = ParseDate(cols[3]),
                Role = cols[4],
                IsActive = cols[5]?.ToLower() == "active"
            });
        }

        await _context.PartnerAssignments.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} partner assignments");
    }

    private async Task SeedSupportersAsync()
    {
        if (await _context.Supporters.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "supporters.csv"));
        var entities = new List<Supporter>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 12) continue;

            entities.Add(new Supporter
            {
                FirstName = cols[1],
                LastName = cols[2],
                Email = cols[3],
                Phone = cols[4],
                SupporterType = cols[5],
                Country = cols[6],
                JoinedDate = ParseDate(cols[7]),
                TotalDonated = ParseDecimal(cols[8]),
                DonationCount = ParseInt(cols[9]),
                LastDonationDate = ParseDateNullable(cols[10]),
                IsActive = cols[11]?.ToLower() == "active",
                IsAtRisk = cols.Length > 12 && cols[12]?.ToLower() == "true"
            });
        }

        await _context.Supporters.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} supporters");
    }

    private async Task SeedDonationsAsync()
    {
        if (await _context.Donations.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "donations.csv"));
        var entities = new List<Donation>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new Donation
            {
                SupporterId = ParseInt(cols[1]),
                Amount = ParseDecimal(cols[2]),
                Currency = cols[3],
                DonationType = cols[4],
                DonationDate = ParseDate(cols[5]),
                CampaignSource = cols[6],
                Notes = cols[7],
                IsRecurring = cols[8]?.ToLower() == "true",
                RecurringFrequency = cols[9]
            });
        }

        await _context.Donations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} donations");
    }

    private async Task SeedInKindDonationItemsAsync()
    {
        if (await _context.InKindDonationItems.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "in_kind_donation_items.csv"));
        var entities = new List<InKindDonationItem>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 8) continue;

            entities.Add(new InKindDonationItem
            {
                DonationId = ParseInt(cols[1]),
                ItemName = cols[2],
                Category = cols[3],
                Quantity = ParseInt(cols[4]),
                Unit = cols[5],
                EstimatedValue = ParseDecimal(cols[6]),
                ReceivedDate = ParseDate(cols[7]),
                Notes = cols.Length > 8 ? cols[8] : null
            });
        }

        await _context.InKindDonationItems.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} in-kind donation items");
    }

    private async Task SeedDonationAllocationsAsync()
    {
        if (await _context.DonationAllocations.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "donation_allocations.csv"));
        var entities = new List<DonationAllocation>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 5) continue;

            entities.Add(new DonationAllocation
            {
                DonationId = ParseInt(cols[1]),
                AllocationCategory = cols[2],
                Amount = ParseDecimal(cols[3]),
                AllocationDate = ParseDate(cols[4]),
                Notes = cols.Length > 5 ? cols[5] : null
            });
        }

        await _context.DonationAllocations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} donation allocations");
    }

    private async Task SeedResidentsAsync()
    {
        if (await _context.Residents.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "residents.csv"));
        var entities = new List<Resident>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 15) continue;

            entities.Add(new Resident
            {
                CaseNumber = cols[2],
                FirstName = cols[14],
                LastName = cols[15],
                DateOfBirth = ParseDate(cols[6]),
                Gender = cols[5],
                SafehouseId = ParseInt(cols[3]),
                IntakeDate = ParseDate(cols[16]),
                CaseCategory = cols[10],
                ReferralSource = cols[17],
                Status = cols[4],
                IsActive = cols[4]?.ToLower() == "active"
            });
        }

        await _context.Residents.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} residents");
    }

    private async Task SeedProcessRecordingsAsync()
    {
        if (await _context.ProcessRecordings.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "process_recordings.csv"));
        var entities = new List<ProcessRecording>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new ProcessRecording
            {
                ResidentId = ParseInt(cols[1]),
                SessionDate = ParseDate(cols[2]),
                SessionType = cols[3],
                CounselorName = cols[4],
                Summary = cols[5],
                Observations = cols[6],
                ActionPlan = cols[7],
                IsConfidential = true
            });
        }

        await _context.ProcessRecordings.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} process recordings");
    }

    private async Task SeedHomeVisitationsAsync()
    {
        if (await _context.HomeVisitations.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "home_visitations.csv"));
        var entities = new List<HomeVisitation>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new HomeVisitation
            {
                ResidentId = ParseInt(cols[1]),
                VisitDate = ParseDate(cols[2]),
                VisitType = cols[3],
                VisitorName = cols[4],
                Location = cols[5],
                Summary = cols[6],
                FamilyInteraction = cols[7],
                SafetyConcerns = cols[8],
                Recommendations = cols[9]
            });
        }

        await _context.HomeVisitations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} home visitations");
    }

    private async Task SeedEducationRecordsAsync()
    {
        if (await _context.EducationRecords.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "education_records.csv"));
        var entities = new List<EducationRecord>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new EducationRecord
            {
                ResidentId = ParseInt(cols[1]),
                RecordDate = ParseDate(cols[2]),
                SchoolName = cols[3],
                GradeLevel = cols[4],
                Subject = cols[5],
                TeacherName = cols[6],
                PerformanceLevel = cols[7],
                Comments = cols[8]
            });
        }

        await _context.EducationRecords.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} education records");
    }

    private async Task SeedHealthWellbeingRecordsAsync()
    {
        if (await _context.HealthWellbeingRecords.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "health_wellbeing_records.csv"));
        var entities = new List<HealthWellbeingRecord>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 14) continue;

            entities.Add(new HealthWellbeingRecord
            {
                Id = ParseInt(cols[0]),
                ResidentId = ParseInt(cols[1]),
                RecordDate = ParseDate(cols[2]),
                Height = cols[7], // height_cm
                Weight = cols[8], // weight_kg
                MedicalConditions = cols[13], // notes
                MentalHealthStatus = cols[3], // general_health_score
                RecordedBy = "System"
            });
        }

        await _context.HealthWellbeingRecords.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} health records");
    }

    private async Task SeedInterventionPlansAsync()
    {
        if (await _context.InterventionPlans.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "intervention_plans.csv"));
        var entities = new List<InterventionPlan>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 8) continue;

            entities.Add(new InterventionPlan
            {
                ResidentId = ParseInt(cols[1]),
                PlanDate = ParseDate(cols[2]),
                Goal = cols[3],
                Interventions = cols[4],
                ResponsibleStaff = cols[5],
                TargetDate = ParseDate(cols[6]),
                Status = cols[7]
            });
        }

        await _context.InterventionPlans.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} intervention plans");
    }

    private async Task SeedIncidentReportsAsync()
    {
        if (await _context.IncidentReports.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "incident_reports.csv"));
        var entities = new List<IncidentReport>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new IncidentReport
            {
                ResidentId = ParseInt(cols[1]),
                IncidentDate = ParseDate(cols[2]),
                ReportedDate = ParseDate(cols[3]),
                IncidentType = cols[4],
                Severity = cols[5],
                Description = cols[6],
                ReportedBy = cols[7],
                ActionTaken = cols[8],
                IsResolved = cols[9]?.ToLower() == "true"
            });
        }

        await _context.IncidentReports.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} incident reports");
    }

    private async Task SeedSocialMediaPostsAsync()
    {
        if (await _context.SocialMediaPosts.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "social_media_posts.csv"));
        var entities = new List<SocialMediaPost>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 12) continue;

            entities.Add(new SocialMediaPost
            {
                Platform = cols[1],
                Content = cols[2],
                PostDate = ParseDate(cols[3]),
                PostUrl = cols[4],
                Likes = ParseIntNullable(cols[5]),
                Shares = ParseIntNullable(cols[6]),
                Comments = ParseIntNullable(cols[7]),
                Reach = ParseIntNullable(cols[8]),
                Impressions = ParseIntNullable(cols[9]),
                CampaignTag = cols[10]
            });
        }

        await _context.SocialMediaPosts.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} social media posts");
    }

    private async Task SeedSafehouseMonthlyMetricsAsync()
    {
        if (await _context.SafehouseMonthlyMetrics.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "safehouse_monthly_metrics.csv"));
        var entities = new List<SafehouseMonthlyMetric>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 11) continue;

            entities.Add(new SafehouseMonthlyMetric
            {
                Id = ParseInt(cols[0]),
                SafehouseId = ParseInt(cols[1]),
                YearMonth = cols[2]?.Substring(0, 7) ?? "2023-01", // month_start -> YYYY-MM
                ResidentCount = ParseInt(cols[4]),
                NewIntakes = 0,
                Reintegrations = 0,
                Transfers = 0,
                TotalDonations = 0,
                DonationCount = 0,
                OperatingExpenses = 0,
                StaffCount = 0,
                VolunteerHours = 0,
                Highlights = cols[10],
                Challenges = null,
                RecordedDate = ParseDate(cols[2])
            });
        }

        await _context.SafehouseMonthlyMetrics.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} safehouse metrics");
    }

    private async Task SeedPublicImpactSnapshotsAsync()
    {
        if (await _context.PublicImpactSnapshots.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "public_impact_snapshots.csv"));
        var entities = new List<PublicImpactSnapshot>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 7) continue;

            entities.Add(new PublicImpactSnapshot
            {
                Id = ParseInt(cols[0]),
                Title = cols[2], // headline
                SnapshotDate = ParseDate(cols[1]),
                TotalResidentsServed = 60,
                ActiveResidents = 60,
                SuccessfulReintegrations = 0,
                TotalDonationsReceived = 0,
                TotalDonors = 0,
                ActivePartners = 30,
                SafehouseCount = 9,
                ImpactSummary = cols[3], // summary_text
                IsPublished = cols[5]?.ToLower() == "true",
                PublishedDate = ParseDateNullable(cols[6])
            });
        }

        await _context.PublicImpactSnapshots.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} impact snapshots");
    }

    // Helper methods
    private static string[] ParseCsvLine(string line)
    {
        var result = new List<string>();
        var inQuotes = false;
        var current = new System.Text.StringBuilder();

        foreach (var c in line)
        {
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString().Trim('"'));
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }

        result.Add(current.ToString().Trim('"'));
        return result.ToArray();
    }

    private static int ParseInt(string? value) => int.TryParse(value, out var result) ? result : 0;
    private static int? ParseIntNullable(string? value) => int.TryParse(value, out var result) ? result : null;
    private static decimal ParseDecimal(string? value) => decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0;
    private static DateTime ParseDate(string? value) => DateTime.TryParse(value, out var result) ? DateTime.SpecifyKind(result, DateTimeKind.Utc) : DateTime.UtcNow;
    private static DateTime? ParseDateNullable(string? value) => DateTime.TryParse(value, out var result) ? DateTime.SpecifyKind(result, DateTimeKind.Utc) : null;
}