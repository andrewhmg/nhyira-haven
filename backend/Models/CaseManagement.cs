using System.ComponentModel.DataAnnotations;

namespace NhyiraHaven.Models;

// CASE MANAGEMENT DOMAIN

public class Resident
{
    public int Id { get; set; }
    [Required, StringLength(50)]
    public string CaseNumber { get; set; } = string.Empty;
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    [Required]
    public DateTime DateOfBirth { get; set; }
    [Required, StringLength(20)]
    public string Gender { get; set; } = string.Empty;
    [Required]
    public int SafehouseId { get; set; }
    [Required]
    public DateTime IntakeDate { get; set; }
    [Required, StringLength(50)]
    public string CaseCategory { get; set; } = string.Empty;
    [Required, StringLength(100)]
    public string ReferralSource { get; set; } = string.Empty;
    [StringLength(100)]
    public string? GuardianName { get; set; }
    [StringLength(50)]
    public string? GuardianContact { get; set; }
    [Required, StringLength(30)]
    public string Status { get; set; } = string.Empty;
    public DateTime? ReintegrationDate { get; set; }
    [StringLength(2000)]
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    // Additional demographic fields
    [StringLength(500)]
    public string? DisabilityInfo { get; set; }
    public bool Is4PsBeneficiary { get; set; } = false;
    public bool IsSoloParentChild { get; set; } = false;
    public bool IsIndigenous { get; set; } = false;
    public bool IsInformalSettler { get; set; } = false;
    [StringLength(500)]
    public string? AssignedSocialWorkers { get; set; }
    
    // Navigation properties
    public Safehouse? Safehouse { get; set; }
    public ICollection<ProcessRecording>? ProcessRecordings { get; set; }
    public ICollection<HomeVisitation>? HomeVisitations { get; set; }
    public ICollection<EducationRecord>? EducationRecords { get; set; }
    public ICollection<HealthWellbeingRecord>? HealthWellbeingRecords { get; set; }
    public ICollection<InterventionPlan>? InterventionPlans { get; set; }
    public ICollection<IncidentReport>? IncidentReports { get; set; }
    public ICollection<CaseConference>? CaseConferences { get; set; }
}

public class ProcessRecording
{
    public int Id { get; set; }
    [Required]
    public int ResidentId { get; set; }
    [Required]
    public DateTime SessionDate { get; set; }
    [Required, StringLength(50)]
    public string SessionType { get; set; } = string.Empty;
    [StringLength(100)]
    public string? CounselorName { get; set; }
    [Required, StringLength(4000)]
    public string Summary { get; set; } = string.Empty;
    [StringLength(2000)]
    public string? Observations { get; set; }
    [StringLength(2000)]
    public string? ActionPlan { get; set; }
    [StringLength(500)]
    public string? FollowUpRequired { get; set; }
    public DateTime? NextSessionDate { get; set; }
    public bool IsConfidential { get; set; } = true;
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class HomeVisitation
{
    public int Id { get; set; }
    [Required]
    public int ResidentId { get; set; }
    [Required]
    public DateTime VisitDate { get; set; }
    [Required, StringLength(50)]
    public string VisitType { get; set; } = string.Empty;
    [StringLength(100)]
    public string? VisitorName { get; set; }
    [Required, StringLength(200)]
    public string Location { get; set; } = string.Empty;
    [Required, StringLength(4000)]
    public string Summary { get; set; } = string.Empty;
    [StringLength(2000)]
    public string? FamilyInteraction { get; set; }
    [StringLength(2000)]
    public string? SafetyConcerns { get; set; }
    [StringLength(2000)]
    public string? Recommendations { get; set; }
    public bool FollowUpNeeded { get; set; } = false;
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class EducationRecord
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime RecordDate { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? TeacherName { get; set; }
    public string PerformanceLevel { get; set; } = string.Empty; // Excellent, Good, Average, Needs Improvement
    public decimal? Score { get; set; }
    public string? AttendanceRate { get; set; }
    public string? Comments { get; set; }
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class HealthWellbeingRecord
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime RecordDate { get; set; }
    public string? Height { get; set; }
    public string? Weight { get; set; }
    public string? BloodType { get; set; }
    public string? MedicalConditions { get; set; }
    public string? Medications { get; set; }
    public string? Allergies { get; set; }
    public string? MentalHealthStatus { get; set; }
    public string? CounselingProgress { get; set; }
    public string? HealthConcerns { get; set; }
    public string? NextCheckupDate { get; set; }
    public string? RecordedBy { get; set; }
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class InterventionPlan
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime PlanDate { get; set; }
    public string Goal { get; set; } = string.Empty;
    public string Interventions { get; set; } = string.Empty;
    public string? ResponsibleStaff { get; set; }
    public DateTime TargetDate { get; set; }
    public string Status { get; set; } = string.Empty; // Planned, In Progress, Completed, Cancelled
    public string? Outcomes { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class CaseConference
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime ConferenceDate { get; set; }
    public string ConferenceType { get; set; } = string.Empty;
    public string? Facilitator { get; set; }
    public string? Attendees { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? Decisions { get; set; }
    public string? ActionItems { get; set; }
    public DateTime? NextConferenceDate { get; set; }
    public string? Notes { get; set; }

    public Resident? Resident { get; set; }
}

public class IncidentReport
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime IncidentDate { get; set; }
    public DateTime ReportedDate { get; set; }
    public string IncidentType { get; set; } = string.Empty; // Behavioral, Medical, Safety, Other
    public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
    public string Description { get; set; } = string.Empty;
    public string? ReportedBy { get; set; }
    public string? ActionTaken { get; set; }
    public string? FollowUpRequired { get; set; }
    public bool IsResolved { get; set; } = false;
    public DateTime? ResolutionDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Resident? Resident { get; set; }
}