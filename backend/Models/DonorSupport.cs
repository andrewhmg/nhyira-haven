namespace NhyiraHaven.Models;

// DONOR & SUPPORT DOMAIN

public class Safehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int CurrentResidents { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public DateTime EstablishedDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Resident>? Residents { get; set; }
    public ICollection<PartnerAssignment>? PartnerAssignments { get; set; }
    public ICollection<SafehouseMonthlyMetric>? MonthlyMetrics { get; set; }
}

public class Partner
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PartnerType { get; set; } = string.Empty; // NGO, Government, Healthcare, Education, etc.
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? ServicesProvided { get; set; }
    public DateTime PartnershipStartDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<PartnerAssignment>? PartnerAssignments { get; set; }
}

public class PartnerAssignment
{
    public int Id { get; set; }
    public int SafehouseId { get; set; }
    public int PartnerId { get; set; }
    public DateTime AssignmentDate { get; set; }
    public string? Role { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public Safehouse? Safehouse { get; set; }
    public Partner? Partner { get; set; }
}

public class Supporter
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string SupporterType { get; set; } = string.Empty; // Individual, Corporate, Foundation
    public string? Country { get; set; }
    public DateTime JoinedDate { get; set; }
    public decimal TotalDonated { get; set; }
    public int DonationCount { get; set; }
    public DateTime? LastDonationDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAtRisk { get; set; } = false; // For churn prediction
    
    // Navigation properties
    public ICollection<Donation>? Donations { get; set; }
}

public class Donation
{
    public int Id { get; set; }
    public int SupporterId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string DonationType { get; set; } = string.Empty; // Monetary, InKind, Time, Skills
    public DateTime DonationDate { get; set; }
    public string? CampaignSource { get; set; }
    public int? SocialMediaPostId { get; set; }
    public string? Notes { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? RecurringFrequency { get; set; } // Monthly, Quarterly, Yearly
    
    // Navigation properties
    public Supporter? Supporter { get; set; }
    public ICollection<InKindDonationItem>? InKindDonationItems { get; set; }
    public ICollection<DonationAllocation>? DonationAllocations { get; set; }
    public ICollection<SocialMediaPost>? SocialMediaPosts { get; set; }
}

public class InKindDonationItem
{
    public int Id { get; set; }
    public int DonationId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Food, Clothing, Medical, Educational, etc.
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal EstimatedValue { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Donation? Donation { get; set; }
}

public class DonationAllocation
{
    public int Id { get; set; }
    public int DonationId { get; set; }
    public string AllocationCategory { get; set; } = string.Empty; // Food, Healthcare, Education, Operations, etc.
    public decimal Amount { get; set; }
    public DateTime AllocationDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Donation? Donation { get; set; }
}