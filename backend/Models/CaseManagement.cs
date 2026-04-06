namespace NhyiraHaven.Models;

// CASE MANAGEMENT DOMAIN

public class Resident
{
    public int Id { get; set; }
    public string CaseNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public int SafehouseId { get; set; }
    public DateTime IntakeDate { get; set; }
    public string CaseCategory { get; set; } = string.Empty; // Trafficking, Abuse, Other
    public string ReferralSource { get; set; } = string.Empty;
    public string? GuardianName { get; set; }
    public string? GuardianContact { get; set; }
    public string Status { get; set; } = string.Empty; // Active, Reintegrated, Transferred, Closed
    public DateTime? ReintegrationDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public Safehouse? Safehouse { get; set; }
    public ICollection<ProcessRecording>? ProcessRecordings { get; set; }
    public ICollection<HomeVisitation>? HomeVisitations { get; set; }
    public ICollection<EducationRecord>? EducationRecords { get; set; }
    public ICollection<HealthWellbeingRecord>? HealthWellbeingRecords { get; set; }
    public ICollection<InterventionPlan>? InterventionPlans { get; set; }
    public ICollection<IncidentReport>? IncidentReports { get; set; }
}

public class ProcessRecording
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime SessionDate { get; set; }
    public string SessionType { get; set; } = string.Empty; // Counseling, Therapy, Case Conference
    public string? CounselorName { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? Observations { get; set; }
    public string? ActionPlan { get; set; }
    public string? FollowUpRequired { get; set; }
    public DateTime? NextSessionDate { get; set; }
    public bool IsConfidential { get; set; } = true;
    
    // Navigation properties
    public Resident? Resident { get; set; }
}

public class HomeVisitation
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime VisitDate { get; set; }
    public string VisitType { get; set; } = string.Empty; // Home Visit, Field Visit, Family Meeting
    public string? VisitorName { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? FamilyInteraction { get; set; }
    public string? SafetyConcerns { get; set; }
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