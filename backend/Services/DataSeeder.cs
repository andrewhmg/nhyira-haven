using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using NhyiraHaven.Data;
using NhyiraHaven.Models;
using Npgsql;

namespace NhyiraHaven.Services;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly string _csvPath;

    // Pseudonym names for residents (CSV doesn't include real names for privacy)
    private static readonly string[] FirstNames = {
        "Adwoa", "Ama", "Akua", "Yaa", "Afua", "Abena", "Akosua", "Esi",
        "Efua", "Nana", "Afia", "Araba", "Ekua", "Adjoa", "Serwa", "Serwaa",
        "Maame", "Kukua", "Aba", "Nyamaa", "Dede", "Korkor", "Emefa", "Edem",
        "Gifty", "Grace", "Mercy", "Blessing", "Joy", "Peace", "Faith", "Hope",
        "Patience", "Comfort", "Charity", "Vida", "Mawusi", "Edinam", "Sena", "Makafui",
        "Enyonam", "Delali", "Selorm", "Elinam", "Senam", "Kokui", "Akpene", "Fafa",
        "Esenam", "Xoese", "Selasi", "Aseye", "Dela", "Eyram", "Kafui", "Norvi",
        "Afi", "Ami", "Lali", "Dzidzor"
    };
    private static readonly string[] LastNames = {
        "Mensah", "Owusu", "Boateng", "Asante", "Osei", "Adjei", "Agyemang", "Appiah",
        "Amankwah", "Bonsu", "Darkwa", "Frimpong", "Gyasi", "Kusi", "Nyarko", "Ofori",
        "Poku", "Sarpong", "Yeboah", "Adomako", "Badu", "Dankwa", "Gyamfi", "Kwarteng",
        "Nkrumah", "Oppong", "Prempeh", "Tetteh", "Acheampong", "Antwi", "Boakye", "Duah",
        "Fordjour", "Koranteng", "Manu", "Ntow", "Sakyi", "Twumasi", "Wiredu", "Amoako",
        "Baah", "Donkor", "Konadu", "Marfo", "Nsiah", "Sarkodie", "Takyi", "Addo",
        "Baffoe", "Danso", "Kwafo", "Nti", "Obeng", "Sefa", "Tawiah", "Ankrah",
        "Bempah", "Essien", "Lartey", "Quaye"
    };

    public DataSeeder(ApplicationDbContext context, string csvPath)
    {
        _context = context;
        _csvPath = csvPath;
    }

    public async Task SeedAllAsync()
    {
        Console.WriteLine("Starting data seeding...");

        await SafeSeed("Safehouses", SeedSafehousesAsync);
        await SafeSeed("Partners", SeedPartnersAsync);
        await SafeSeed("PartnerAssignments", SeedPartnerAssignmentsAsync);
        await SafeSeed("Supporters", SeedSupportersAsync);
        await SafeSeed("Donations", SeedDonationsAsync);
        await SafeSeed("InKindDonationItems", SeedInKindDonationItemsAsync);
        await SafeSeed("DonationAllocations", SeedDonationAllocationsAsync);
        await SafeSeed("Residents", SeedResidentsAsync);
        await SafeSeed("ProcessRecordings", SeedProcessRecordingsAsync);
        await SafeSeed("HomeVisitations", SeedHomeVisitationsAsync);
        await SafeSeed("EducationRecords", SeedEducationRecordsAsync);
        await SafeSeed("HealthWellbeingRecords", SeedHealthWellbeingRecordsAsync);
        await SafeSeed("InterventionPlans", SeedInterventionPlansAsync);
        await SafeSeed("IncidentReports", SeedIncidentReportsAsync);
        await SafeSeed("SocialMediaPosts", SeedSocialMediaPostsAsync);
        await SafeSeed("SafehouseMonthlyMetrics", SeedSafehouseMonthlyMetricsAsync);
        await SafeSeed("PublicImpactSnapshots", SeedPublicImpactSnapshotsAsync);

        // Reset PostgreSQL sequences after explicit ID inserts
        await ResetSequencesAsync();

        Console.WriteLine("Data seeding completed!");
    }

    private async Task ResetSequencesAsync()
    {
        try
        {
            var tables = new[] { "Safehouses", "Partners", "Supporters", "Residents", "Donations",
                "ProcessRecordings", "HomeVisitations", "EducationRecords", "HealthWellbeingRecords",
                "InterventionPlans", "IncidentReports", "SocialMediaPosts", "SafehouseMonthlyMetrics",
                "PublicImpactSnapshots", "InKindDonationItems", "DonationAllocations", "PartnerAssignments" };

            foreach (var table in tables)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "SELECT setval(pg_get_serial_sequence('\"" + table + "\"', 'Id'), COALESCE((SELECT MAX(\"Id\") FROM \"" + table + "\"), 0) + 1, false)");
                }
                catch { /* Table might not exist or have no sequence */ }
            }
            Console.WriteLine("Reset PostgreSQL sequences");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WARNING: Failed to reset sequences: {ex.Message}");
        }
    }

    private async Task SafeSeed(string name, Func<Task> seedFunc)
    {
        try
        {
            await seedFunc();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WARNING: Failed to seed {name}: {ex.Message}");
            // Detach all tracked entities to prevent cascading failures
            foreach (var entry in _context.ChangeTracker.Entries().ToList())
                entry.State = EntityState.Detached;
        }
    }

    // ===================== Safehouses =====================
    // CSV: safehouse_id(0), safehouse_code(1), name(2), region(3), city(4), province(5), country(6),
    //      open_date(7), status(8), capacity_girls(9), capacity_staff(10), current_occupancy(11), notes(12)
    private async Task SeedSafehousesAsync()
    {
        // Disabled check: if (await _context.Safehouses.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "safehouses.csv"));
        var entities = new List<Safehouse>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 12) continue;

            entities.Add(new Safehouse
            {
                Id = ParseInt(cols[0]),
                Name = cols[2],
                Location = $"{cols[4]}, {cols[5]}, {cols[6]}".Trim(' ', ','),
                Capacity = ParseInt(cols[9]),
                CurrentResidents = ParseInt(cols[11]),
                EstablishedDate = ParseDate(cols[7]),
                IsActive = cols[8]?.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.Safehouses.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} safehouses");
    }

    // ===================== Partners =====================
    // CSV: partner_id(0), partner_name(1), partner_type(2), role_type(3), contact_name(4),
    //      email(5), phone(6), region(7), status(8), start_date(9), end_date(10), notes(11)
    private async Task SeedPartnersAsync()
    {
        // Disabled check: if (await _context.Partners.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "partners.csv"));
        var entities = new List<Partner>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 9) continue;

            entities.Add(new Partner
            {
                Id = ParseInt(cols[0]),
                Name = cols[1],
                PartnerType = cols[2],
                ContactName = cols[4],
                ContactPhone = cols[6],
                ContactEmail = cols[5],
                ServicesProvided = cols[3], // role_type
                PartnershipStartDate = ParseDate(cols[9]),
                IsActive = cols[8]?.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.Partners.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} partners");
    }

    // ===================== Partner Assignments =====================
    // CSV: assignment_id(0), partner_id(1), safehouse_id(2), program_area(3),
    //      assignment_start(4), assignment_end(5), responsibility_notes(6), is_primary(7), status(8)
    private async Task SeedPartnerAssignmentsAsync()
    {
        // Disabled check: if (await _context.PartnerAssignments.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "partner_assignments.csv"));
        var entities = new List<PartnerAssignment>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 8) continue;

            entities.Add(new PartnerAssignment
            {
                PartnerId = ParseInt(cols[1]),
                SafehouseId = ParseInt(cols[2]),
                AssignmentDate = ParseDate(cols[4]),
                Role = cols[3], // program_area
                IsActive = cols[8]?.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.PartnerAssignments.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} partner assignments");
    }

    // ===================== Supporters =====================
    // CSV: supporter_id(0), supporter_type(1), display_name(2), organization_name(3),
    //      first_name(4), last_name(5), relationship_type(6), region(7), country(8),
    //      email(9), phone(10), status(11), created_at(12), first_donation_date(13), acquisition_channel(14)
    private async Task SeedSupportersAsync()
    {
        // Disabled check: if (await _context.Supporters.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "supporters.csv"));
        var entities = new List<Supporter>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 12) continue;

            entities.Add(new Supporter
            {
                Id = ParseInt(cols[0]),
                FirstName = cols[4],
                LastName = cols[5],
                Email = cols[9],
                Phone = cols[10],
                SupporterType = cols[1],
                Country = cols[8],
                JoinedDate = ParseDate(cols[12]),
                TotalDonated = 0, // Will be computed from donations
                DonationCount = 0, // Will be computed from donations
                LastDonationDate = ParseDateNullable(cols[13]),
                IsActive = cols[11]?.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase) == true,
                IsAtRisk = false
            });
        }

        await _context.Supporters.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} supporters");

        // Now compute donation aggregates after donations are seeded (done later in UpdateSupporterAggregates)
    }

    // ===================== Donations =====================
    // CSV: donation_id(0), supporter_id(1), donation_type(2), donation_date(3), is_recurring(4),
    //      campaign_name(5), channel_source(6), currency_code(7), amount(8), estimated_value(9),
    //      impact_unit(10), notes(11), referral_post_id(12)
    private async Task SeedDonationsAsync()
    {
        // Disabled check: if (await _context.Donations.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "donations.csv"));
        var entities = new List<Donation>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            var amount = ParseDecimal(cols[8]);
            // If amount is 0 (e.g. Time/InKind), use estimated_value
            if (amount == 0 && cols.Length > 9)
                amount = ParseDecimal(cols[9]);

            entities.Add(new Donation
            {
                SupporterId = ParseInt(cols[1]),
                Amount = amount,
                Currency = cols[7],
                DonationType = cols[2],
                DonationDate = ParseDate(cols[3]),
                CampaignSource = cols[5],
                Notes = cols.Length > 11 ? cols[11] : null,
                IsRecurring = cols[4]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true,
                RecurringFrequency = null
            });
        }

        await _context.Donations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} donations");

        // Update supporter aggregates now that donations are loaded
        await UpdateSupporterAggregatesAsync();
    }

    private async Task UpdateSupporterAggregatesAsync()
    {
        var supporters = await _context.Supporters.ToListAsync();
        var donations = await _context.Donations.ToListAsync();

        foreach (var s in supporters)
        {
            var supporterDonations = donations.Where(d => d.SupporterId == s.Id).ToList();
            s.TotalDonated = supporterDonations.Sum(d => d.Amount);
            s.DonationCount = supporterDonations.Count;
            if (supporterDonations.Any())
            {
                s.LastDonationDate = supporterDonations.Max(d => d.DonationDate);
                // Flag as at-risk if no donation in last 180 days
                var daysSinceLast = (DateTime.UtcNow - s.LastDonationDate.Value).TotalDays;
                s.IsAtRisk = daysSinceLast > 180;
            }
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("Updated supporter donation aggregates");
    }

    // ===================== In-Kind Donation Items =====================
    // CSV: item_id(0), donation_id(1), item_name(2), item_category(3), quantity(4),
    //      unit_of_measure(5), estimated_unit_value(6), intended_use(7), received_condition(8)
    private async Task SeedInKindDonationItemsAsync()
    {
        // Disabled check: if (await _context.InKindDonationItems.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "in_kind_donation_items.csv"));
        var entities = new List<InKindDonationItem>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 7) continue;

            entities.Add(new InKindDonationItem
            {
                DonationId = ParseInt(cols[1]),
                ItemName = cols[2],
                Category = cols[3],
                Quantity = ParseInt(cols[4]),
                Unit = cols[5],
                EstimatedValue = ParseDecimal(cols[6]),
                ReceivedDate = DateTime.UtcNow, // No date in CSV
                Notes = cols.Length > 7 ? cols[7] : null // intended_use
            });
        }

        await _context.InKindDonationItems.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} in-kind donation items");
    }

    // ===================== Donation Allocations =====================
    // CSV: allocation_id(0), donation_id(1), safehouse_id(2), program_area(3),
    //      amount_allocated(4), allocation_date(5), allocation_notes(6)
    private async Task SeedDonationAllocationsAsync()
    {
        // Disabled check: if (await _context.DonationAllocations.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "donation_allocations.csv"));
        var entities = new List<DonationAllocation>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 6) continue;

            entities.Add(new DonationAllocation
            {
                DonationId = ParseInt(cols[1]),
                AllocationCategory = cols[3], // program_area
                Amount = ParseDecimal(cols[4]),
                AllocationDate = ParseDate(cols[5]),
                Notes = cols.Length > 6 ? cols[6] : null
            });
        }

        await _context.DonationAllocations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} donation allocations");
    }

    // ===================== Residents =====================
    // CSV: resident_id(0), case_control_no(1), internal_code(2), safehouse_id(3), case_status(4),
    //      sex(5), date_of_birth(6), birth_status(7), place_of_birth(8), religion(9),
    //      case_category(10), sub_cat_orphaned(11)..sub_cat_child_with_hiv(20), is_pwd(21),
    //      pwd_type(22), has_special_needs(23), special_needs_diagnosis(24),
    //      family_is_4ps(25)..family_informal_settler(29),
    //      date_of_admission(30), age_upon_admission(31), present_age(32), length_of_stay(33),
    //      referral_source(34), referring_agency_person(35), date_colb_registered(36), date_colb_obtained(37),
    //      assigned_social_worker(38), initial_case_assessment(39), date_case_study_prepared(40),
    //      reintegration_type(41), reintegration_status(42), initial_risk_level(43), current_risk_level(44),
    //      date_enrolled(45), date_closed(46), created_at(47), notes_restricted(48)
    //
    // NOTE: No first/last name in CSV (privacy for minors). We generate pseudonym names.
    private async Task SeedResidentsAsync()
    {
        // Disabled check: if (await _context.Residents.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "residents.csv"));
        var entities = new List<Resident>();

        var rng = new Random(42); // Deterministic seed for reproducible pseudonyms

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 35) continue;

            var id = ParseInt(cols[0]);
            var firstName = FirstNames[(id - 1) % FirstNames.Length];
            var lastName = LastNames[(id - 1) % LastNames.Length];

            DateTime? reintDate = null;
            if (cols.Length > 46 && !string.IsNullOrWhiteSpace(cols[46]))
                reintDate = ParseDateNullable(cols[46]);

            entities.Add(new Resident
            {
                Id = id,
                CaseNumber = cols[1], // case_control_no
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = ParseDate(cols[6]),
                Gender = cols[5],
                SafehouseId = ParseInt(cols[3]),
                IntakeDate = ParseDate(cols[30]), // date_of_admission
                CaseCategory = cols[10],
                ReferralSource = cols[34],
                GuardianName = cols.Length > 35 ? cols[35] : null, // referring_agency_person
                Status = cols[4], // case_status
                ReintegrationDate = reintDate,
                Notes = cols.Length > 48 ? cols[48] : null, // notes_restricted
                IsActive = cols[4]?.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.Residents.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} residents");
    }

    // ===================== Process Recordings =====================
    // CSV: recording_id(0), resident_id(1), session_date(2), social_worker(3), session_type(4),
    //      session_duration_minutes(5), emotional_state_observed(6), emotional_state_end(7),
    //      session_narrative(8), interventions_applied(9), follow_up_actions(10),
    //      progress_noted(11), concerns_flagged(12), referral_made(13), notes_restricted(14)
    private async Task SeedProcessRecordingsAsync()
    {
        // Disabled check: if (await _context.ProcessRecordings.AnyAsync()) return;

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
                SessionType = cols[4],
                CounselorName = cols[3], // social_worker
                Summary = cols.Length > 8 ? cols[8] : "Session recorded", // session_narrative
                Observations = cols.Length > 6 ? cols[6] : null, // emotional_state_observed
                ActionPlan = cols.Length > 10 ? cols[10] : null, // follow_up_actions
                IsConfidential = cols.Length > 14 && cols[14]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.ProcessRecordings.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} process recordings");
    }

    // ===================== Home Visitations =====================
    // CSV: visitation_id(0), resident_id(1), visit_date(2), social_worker(3), visit_type(4),
    //      location_visited(5), family_members_present(6), purpose(7), observations(8),
    //      family_cooperation_level(9), safety_concerns_noted(10), follow_up_needed(11),
    //      follow_up_notes(12), visit_outcome(13)
    private async Task SeedHomeVisitationsAsync()
    {
        // Disabled check: if (await _context.HomeVisitations.AnyAsync()) return;

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
                VisitType = cols[4],
                VisitorName = cols[3], // social_worker
                Location = cols[5],
                Summary = cols.Length > 8 ? cols[8] : "Visit conducted", // observations
                FamilyInteraction = cols.Length > 9 ? cols[9] : null, // family_cooperation_level
                SafetyConcerns = cols.Length > 10 && cols[10]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true
                    ? "Safety concerns noted"
                    : null,
                Recommendations = cols.Length > 12 ? cols[12] : null, // follow_up_notes
                FollowUpNeeded = cols.Length > 11 && cols[11]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true
            });
        }

        await _context.HomeVisitations.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} home visitations");
    }

    // ===================== Education Records =====================
    // CSV: education_record_id(0), resident_id(1), record_date(2), education_level(3),
    //      school_name(4), enrollment_status(5), attendance_rate(6), progress_percent(7),
    //      completion_status(8), notes(9)
    private async Task SeedEducationRecordsAsync()
    {
        // Disabled check: if (await _context.EducationRecords.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "education_records.csv"));
        var entities = new List<EducationRecord>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 9) continue;

            entities.Add(new EducationRecord
            {
                ResidentId = ParseInt(cols[1]),
                RecordDate = ParseDate(cols[2]),
                SchoolName = cols[4],
                GradeLevel = cols[3], // education_level
                Subject = cols[5], // enrollment_status
                PerformanceLevel = cols[8], // completion_status
                Score = ParseIntNullable(cols[7]?.Replace("%", "")), // progress_percent
                AttendanceRate = cols[6],
                Comments = cols.Length > 9 ? cols[9] : null
            });
        }

        await _context.EducationRecords.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} education records");
    }

    // ===================== Health Wellbeing Records =====================
    // CSV: health_record_id(0), resident_id(1), record_date(2), general_health_score(3),
    //      nutrition_score(4), sleep_quality_score(5), energy_level_score(6),
    //      height_cm(7), weight_kg(8), bmi(9), medical_checkup_done(10),
    //      dental_checkup_done(11), psychological_checkup_done(12), notes(13)
    private async Task SeedHealthWellbeingRecordsAsync()
    {
        // Disabled check: if (await _context.HealthWellbeingRecords.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "health_wellbeing_records.csv"));
        var entities = new List<HealthWellbeingRecord>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 13) continue;

            entities.Add(new HealthWellbeingRecord
            {
                ResidentId = ParseInt(cols[1]),
                RecordDate = ParseDate(cols[2]),
                Height = cols[7], // height_cm
                Weight = cols[8], // weight_kg
                MentalHealthStatus = $"Health: {cols[3]}/5, Nutrition: {cols[4]}/5, Sleep: {cols[5]}/5",
                CounselingProgress = cols.Length > 12 ? (cols[12]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true ? "Psychological checkup done" : "Pending") : null,
                HealthConcerns = cols.Length > 13 ? cols[13] : null, // notes
                RecordedBy = "System"
            });
        }

        await _context.HealthWellbeingRecords.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} health records");
    }

    // ===================== Intervention Plans =====================
    // CSV: plan_id(0), resident_id(1), plan_category(2), plan_description(3), services_provided(4),
    //      target_value(5), target_date(6), status(7), case_conference_date(8), created_at(9), updated_at(10)
    private async Task SeedInterventionPlansAsync()
    {
        // Disabled check: if (await _context.InterventionPlans.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "intervention_plans.csv"));
        var entities = new List<InterventionPlan>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 8) continue;

            entities.Add(new InterventionPlan
            {
                ResidentId = ParseInt(cols[1]),
                PlanDate = ParseDate(cols.Length > 9 ? cols[9] : ""), // created_at
                Goal = $"{cols[2]}: {cols[3]}", // plan_category: plan_description
                Interventions = cols[4], // services_provided
                ResponsibleStaff = null,
                TargetDate = ParseDate(cols[6]),
                Status = cols[7]
            });
        }

        await _context.InterventionPlans.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} intervention plans");
    }

    // ===================== Incident Reports =====================
    // CSV: incident_id(0), resident_id(1), safehouse_id(2), incident_date(3), incident_type(4),
    //      severity(5), description(6), response_taken(7), resolved(8), resolution_date(9),
    //      reported_by(10), follow_up_required(11)
    private async Task SeedIncidentReportsAsync()
    {
        // Disabled check: if (await _context.IncidentReports.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "incident_reports.csv"));
        var entities = new List<IncidentReport>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 9) continue;

            entities.Add(new IncidentReport
            {
                ResidentId = ParseInt(cols[1]),
                IncidentDate = ParseDate(cols[3]),
                ReportedDate = ParseDate(cols[3]), // Same as incident date (no separate field)
                IncidentType = cols[4],
                Severity = cols[5],
                Description = cols[6],
                ReportedBy = cols.Length > 10 ? cols[10] : null,
                ActionTaken = cols[7], // response_taken
                IsResolved = cols[8]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true,
                ResolutionDate = cols.Length > 9 ? ParseDateNullable(cols[9]) : null,
                FollowUpRequired = cols.Length > 11 ? cols[11] : null
            });
        }

        await _context.IncidentReports.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} incident reports");
    }

    // ===================== Social Media Posts =====================
    // CSV: post_id(0), platform(1), platform_post_id(2), post_url(3), created_at(4),
    //      day_of_week(5), post_hour(6), post_type(7), media_type(8), caption(9),
    //      hashtags(10), num_hashtags(11), mentions_count(12), has_call_to_action(13),
    //      call_to_action_type(14), content_topic(15), sentiment_tone(16), caption_length(17),
    //      features_resident_story(18), campaign_name(19), is_boosted(20), boost_budget_php(21),
    //      impressions(22), reach(23), likes(24), comments(25), shares(26), saves(27),
    //      click_throughs(28), video_views(29), engagement_rate(30), profile_visits(31),
    //      donation_referrals(32), estimated_donation_value_php(33), follower_count_at_post(34),
    //      watch_time_seconds(35), avg_view_duration_seconds(36), subscriber_count_at_post(37), forwards(38)
    private async Task SeedSocialMediaPostsAsync()
    {
        // Disabled check: if (await _context.SocialMediaPosts.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "social_media_posts.csv"));
        var entities = new List<SocialMediaPost>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 27) continue;

            entities.Add(new SocialMediaPost
            {
                Platform = cols[1],
                Content = cols.Length > 9 ? cols[9] : "", // caption
                PostDate = ParseDate(cols[4]), // created_at
                PostUrl = cols[3],
                Likes = ParseIntNullable(cols[24]),
                Shares = ParseIntNullable(cols[26]),
                Comments = ParseIntNullable(cols[25]),
                Reach = ParseIntNullable(cols[23]),
                Impressions = ParseIntNullable(cols[22]),
                Clicks = ParseIntNullable(cols.Length > 28 ? cols[28] : null),
                DonationsGenerated = ParseIntNullable(cols.Length > 32 ? cols[32] : null),
                CampaignTag = cols.Length > 19 ? cols[19] : null
            });
        }

        await _context.SocialMediaPosts.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} social media posts");
    }

    // ===================== Safehouse Monthly Metrics =====================
    // CSV: metric_id(0), safehouse_id(1), month_start(2), month_end(3), active_residents(4),
    //      avg_education_progress(5), avg_health_score(6), process_recording_count(7),
    //      home_visitation_count(8), incident_count(9), notes(10)
    private async Task SeedSafehouseMonthlyMetricsAsync()
    {
        // Disabled check: if (await _context.SafehouseMonthlyMetrics.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "safehouse_monthly_metrics.csv"));
        var entities = new List<SafehouseMonthlyMetric>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 10) continue;

            entities.Add(new SafehouseMonthlyMetric
            {
                Id = ParseInt(cols[0]),
                SafehouseId = ParseInt(cols[1]),
                YearMonth = cols[2]?.Length >= 7 ? cols[2].Substring(0, 7) : "2023-01",
                ResidentCount = ParseInt(cols[4]),
                NewIntakes = 0,
                Reintegrations = 0,
                Transfers = 0,
                TotalDonations = 0,
                DonationCount = 0,
                OperatingExpenses = 0,
                StaffCount = 0,
                VolunteerHours = 0,
                Highlights = cols.Length > 10 ? cols[10] : null,
                RecordedDate = ParseDate(cols[2])
            });
        }

        await _context.SafehouseMonthlyMetrics.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} safehouse metrics");
    }

    // ===================== Public Impact Snapshots =====================
    // CSV: snapshot_id(0), snapshot_date(1), headline(2), summary_text(3),
    //      metric_payload_json(4), is_published(5), published_at(6)
    private async Task SeedPublicImpactSnapshotsAsync()
    {
        // Disabled check: if (await _context.PublicImpactSnapshots.AnyAsync()) return;

        var csv = await File.ReadAllLinesAsync(Path.Combine(_csvPath, "public_impact_snapshots.csv"));
        var entities = new List<PublicImpactSnapshot>();

        foreach (var line in csv.Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Length < 6) continue;

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
                IsPublished = cols[5]?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true,
                PublishedDate = cols.Length > 6 ? ParseDateNullable(cols[6]) : null
            });
        }

        await _context.PublicImpactSnapshots.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Seeded {entities.Count} impact snapshots");
    }

    // ===================== Helpers =====================
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

    private static int ParseInt(string? value)
    {
        var trimmed = value?.Trim();
        if (int.TryParse(trimmed, out var result)) return result;
        // Handle float strings like "8.0"
        if (decimal.TryParse(trimmed, NumberStyles.Any, CultureInfo.InvariantCulture, out var dec)) return (int)dec;
        return 0;
    }
    private static int? ParseIntNullable(string? value)
    {
        var trimmed = value?.Trim();
        if (int.TryParse(trimmed, out var result)) return result;
        if (decimal.TryParse(trimmed, NumberStyles.Any, CultureInfo.InvariantCulture, out var dec)) return (int)dec;
        return null;
    }
    private static decimal ParseDecimal(string? value) => decimal.TryParse(value?.Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0;
    private static DateTime ParseDate(string? value) => DateTime.TryParse(value?.Trim(), out var result) ? DateTime.SpecifyKind(result, DateTimeKind.Utc) : DateTime.UtcNow;
    private static DateTime? ParseDateNullable(string? value) => DateTime.TryParse(value?.Trim(), out var result) ? DateTime.SpecifyKind(result, DateTimeKind.Utc) : null;
}
