using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Models;

namespace NhyiraHaven.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Donor & Support Domain
    public DbSet<Safehouse> Safehouses { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<PartnerAssignment> PartnerAssignments { get; set; }
    public DbSet<Supporter> Supporters { get; set; }
    public DbSet<Donation> Donations { get; set; }
    public DbSet<InKindDonationItem> InKindDonationItems { get; set; }
    public DbSet<DonationAllocation> DonationAllocations { get; set; }

    // Case Management Domain
    public DbSet<Resident> Residents { get; set; }
    public DbSet<ProcessRecording> ProcessRecordings { get; set; }
    public DbSet<HomeVisitation> HomeVisitations { get; set; }
    public DbSet<EducationRecord> EducationRecords { get; set; }
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords { get; set; }
    public DbSet<InterventionPlan> InterventionPlans { get; set; }
    public DbSet<IncidentReport> IncidentReports { get; set; }
    public DbSet<CaseConference> CaseConferences { get; set; }

    // Outreach & Communication Domain
    public DbSet<SocialMediaPost> SocialMediaPosts { get; set; }
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics { get; set; }
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships

        // Safehouse relationships
        modelBuilder.Entity<Safehouse>()
            .HasMany(s => s.Residents)
            .WithOne(r => r.Safehouse)
            .HasForeignKey(r => r.SafehouseId);

        modelBuilder.Entity<Safehouse>()
            .HasMany(s => s.PartnerAssignments)
            .WithOne(pa => pa.Safehouse)
            .HasForeignKey(pa => pa.SafehouseId);

        // Partner relationships
        modelBuilder.Entity<Partner>()
            .HasMany(p => p.PartnerAssignments)
            .WithOne(pa => pa.Partner)
            .HasForeignKey(pa => pa.PartnerId);

        // Supporter relationships
        modelBuilder.Entity<Supporter>()
            .HasMany(s => s.Donations)
            .WithOne(d => d.Supporter)
            .HasForeignKey(d => d.SupporterId);

        modelBuilder.Entity<Supporter>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .IsRequired(false);

        modelBuilder.Entity<Supporter>()
            .HasIndex(s => s.UserId);

        // Donation relationships
        modelBuilder.Entity<Donation>()
            .HasMany(d => d.InKindDonationItems)
            .WithOne(iki => iki.Donation)
            .HasForeignKey(iki => iki.DonationId);

        modelBuilder.Entity<Donation>()
            .HasMany(d => d.DonationAllocations)
            .WithOne(da => da.Donation)
            .HasForeignKey(da => da.DonationId);

        // Resident relationships
        modelBuilder.Entity<Resident>()
            .HasMany(r => r.ProcessRecordings)
            .WithOne(pr => pr.Resident)
            .HasForeignKey(pr => pr.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.HomeVisitations)
            .WithOne(hv => hv.Resident)
            .HasForeignKey(hv => hv.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.EducationRecords)
            .WithOne(er => er.Resident)
            .HasForeignKey(er => er.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.HealthWellbeingRecords)
            .WithOne(hwr => hwr.Resident)
            .HasForeignKey(hwr => hwr.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.InterventionPlans)
            .WithOne(ip => ip.Resident)
            .HasForeignKey(ip => ip.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.IncidentReports)
            .WithOne(ir => ir.Resident)
            .HasForeignKey(ir => ir.ResidentId);

        modelBuilder.Entity<Resident>()
            .HasMany(r => r.CaseConferences)
            .WithOne(cc => cc.Resident)
            .HasForeignKey(cc => cc.ResidentId);

        // Social Media relationships
        modelBuilder.Entity<Donation>()
            .HasMany(d => d.SocialMediaPosts)
            .WithOne(smp => smp.Donation)
            .HasForeignKey(smp => smp.DonationId);

        // Safehouse metrics
        modelBuilder.Entity<Safehouse>()
            .HasMany(s => s.MonthlyMetrics)
            .WithOne(m => m.Safehouse)
            .HasForeignKey(m => m.SafehouseId);

        // Indexes for common queries
        modelBuilder.Entity<Resident>()
            .HasIndex(r => r.SafehouseId);

        modelBuilder.Entity<Donation>()
            .HasIndex(d => d.SupporterId);

        modelBuilder.Entity<Donation>()
            .HasIndex(d => d.DonationDate);

        modelBuilder.Entity<SocialMediaPost>()
            .HasIndex(smp => smp.PostDate);
    }
}