namespace NhyiraHaven.Models;

// OUTREACH & COMMUNICATION DOMAIN

public class SocialMediaPost
{
    public int Id { get; set; }
    public string Platform { get; set; } = string.Empty; // Facebook, Instagram, Twitter, LinkedIn
    public string Content { get; set; } = string.Empty;
    public DateTime PostDate { get; set; }
    public string? PostUrl { get; set; }
    public int? Likes { get; set; }
    public int? Shares { get; set; }
    public int? Comments { get; set; }
    public int? Reach { get; set; }
    public int? Impressions { get; set; }
    public int? Clicks { get; set; }
    public decimal? DonationsGenerated { get; set; }
    public int? DonationId { get; set; }
    public string? CampaignTag { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Donation? Donation { get; set; }
}

public class SafehouseMonthlyMetric
{
    public int Id { get; set; }
    public int SafehouseId { get; set; }
    public string YearMonth { get; set; } = string.Empty; // Format: YYYY-MM
    public int ResidentCount { get; set; }
    public int NewIntakes { get; set; }
    public int Reintegrations { get; set; }
    public int Transfers { get; set; }
    public decimal TotalDonations { get; set; }
    public int DonationCount { get; set; }
    public decimal OperatingExpenses { get; set; }
    public int StaffCount { get; set; }
    public int VolunteerHours { get; set; }
    public string? Highlights { get; set; }
    public string? Challenges { get; set; }
    public DateTime RecordedDate { get; set; }
    
    // Navigation properties
    public Safehouse? Safehouse { get; set; }
}

public class PublicImpactSnapshot
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime SnapshotDate { get; set; }
    public int TotalResidentsServed { get; set; }
    public int ActiveResidents { get; set; }
    public int SuccessfulReintegrations { get; set; }
    public decimal TotalDonationsReceived { get; set; }
    public int TotalDonors { get; set; }
    public int ActivePartners { get; set; }
    public int SafehouseCount { get; set; }
    public string? SuccessStory { get; set; }
    public string? ImpactSummary { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedDate { get; set; }
}