# Nhyira Haven - Database Schema

**Database:** SQLite (Development) → Azure SQL (Production)  
**ORM:** Entity Framework Core  
**Total Tables:** 20 (17 data tables + 3 Identity tables)

---

## 📊 Schema Overview

### Donor & Support Domain (7 tables)

| Table | Description | Key Fields |
|-------|-------------|------------|
| **Safehouses** | Physical locations where girls are housed | Id, Name, Location, Capacity, CurrentResidents, ContactPhone, ContactEmail, EstablishedDate, IsActive |
| **Partners** | Organizations/individuals delivering services | Id, Name, PartnerType, ContactName, ContactPhone, ContactEmail, ServicesProvided, PartnershipStartDate, IsActive |
| **PartnerAssignments** | Which partners serve which safehouses | Id, SafehouseId, PartnerId, AssignmentDate, Role, IsActive |
| **Supporters** | Donors, volunteers, advocates | Id, FirstName, LastName, Email, Phone, SupporterType, Country, JoinedDate, TotalDonated, DonationCount, LastDonationDate, IsActive, IsAtRisk |
| **Donations** | Individual donation events (monetary, in-kind, time, skills) | Id, SupporterId, Amount, Currency, DonationType, DonationDate, CampaignSource, SocialMediaPostId, Notes, IsRecurring, RecurringFrequency |
| **InKindDonationItems** | Line items for in-kind donations | Id, DonationId, ItemName, Category, Quantity, Unit, EstimatedValue, ReceivedDate, Notes |
| **DonationAllocations** | How donations are distributed | Id, DonationId, AllocationCategory, Amount, AllocationDate, Notes |

### Case Management Domain (7 tables)

| Table | Description | Key Fields |
|-------|-------------|------------|
| **Residents** | Case records for girls served | Id, CaseNumber, FirstName, LastName, DateOfBirth, Gender, SafehouseId, IntakeDate, CaseCategory, ReferralSource, GuardianName, GuardianContact, Status, ReintegrationDate, Notes, IsActive |
| **ProcessRecordings** | Counseling session notes | Id, ResidentId, SessionDate, SessionType, CounselorName, Summary, Observations, ActionPlan, FollowUpRequired, NextSessionDate, IsConfidential |
| **HomeVisitations** | Home/field visit records | Id, ResidentId, VisitDate, VisitType, VisitorName, Location, Summary, FamilyInteraction, SafetyConcerns, Recommendations, FollowUpNeeded |
| **EducationRecords** | Monthly education progress | Id, ResidentId, RecordDate, SchoolName, GradeLevel, Subject, TeacherName, PerformanceLevel, Score, AttendanceRate, Comments |
| **HealthWellbeingRecords** | Monthly health assessments | Id, ResidentId, RecordDate, Height, Weight, BloodType, MedicalConditions, Medications, Allergies, MentalHealthStatus, CounselingProgress, HealthConcerns, NextCheckupDate, RecordedBy |
| **InterventionPlans** | Intervention goals and services | Id, ResidentId, PlanDate, Goal, Interventions, ResponsibleStaff, TargetDate, Status, Outcomes, CompletionDate, Notes |
| **IncidentReports** | Safety and behavioral incidents | Id, ResidentId, IncidentDate, ReportedDate, IncidentType, Severity, Description, ReportedBy, ActionTaken, FollowUpRequired, IsResolved, ResolutionDate, Notes |

### Outreach & Communication Domain (3 tables)

| Table | Description | Key Fields |
|-------|-------------|------------|
| **SocialMediaPosts** | Social media activity and engagement | Id, Platform, Content, PostDate, PostUrl, Likes, Shares, Comments, Reach, Impressions, Clicks, DonationsGenerated, DonationId, CampaignTag, Notes |
| **SafehouseMonthlyMetrics** | Aggregated monthly outcomes per safehouse | Id, SafehouseId, YearMonth, ResidentCount, NewIntakes, Reintegrations, Transfers, TotalDonations, DonationCount, OperatingExpenses, StaffCount, VolunteerHours, Highlights, Challenges, RecordedDate |
| **PublicImpactSnapshots** | Anonymized impact reports for donors | Id, Title, SnapshotDate, TotalResidentsServed, ActiveResidents, SuccessfulReintegrations, TotalDonationsReceived, TotalDonors, ActivePartners, SafehouseCount, SuccessStory, ImpactSummary, IsPublished, PublishedDate |

### Authentication (3 tables - ASP.NET Identity)

| Table | Description | Key Fields |
|-------|-------------|------------|
| **AspNetUsers** | User accounts (Admin, Staff, Donor) | Id, UserName, NormalizedUserName, Email, NormalizedEmail, PasswordHash, SecurityStamp, FirstName, LastName, Role, CreatedAt, LastLogin |
| **AspNetRoles** | Role definitions | Id, Name, NormalizedName |
| **AspNetUserRoles** | User-role assignments | UserId, RoleId |

---

## 🔗 Entity Relationships

```
Safehouses (1) ──→ (∞) Residents
Safehouses (1) ──→ (∞) PartnerAssignments
Safehouses (1) ──→ (∞) SafehouseMonthlyMetrics

Partners (1) ──→ (∞) PartnerAssignments

Supporters (1) ──→ (∞) Donations

Donations (1) ──→ (∞) InKindDonationItems
Donations (1) ──→ (∞) DonationAllocations
Donations (1) ──→ (∞) SocialMediaPosts

Residents (1) ──→ (∞) ProcessRecordings
Residents (1) ──→ (∞) HomeVisitations
Residents (1) ──→ (∞) EducationRecords
Residents (1) ──→ (∞) HealthWellbeingRecords
Residents (1) ──→ (∞) InterventionPlans
Residents (1) ──→ (∞) IncidentReports
```

---

## 📋 Indexes

| Table | Indexed Column(s) | Reason |
|-------|-------------------|--------|
| Residents | SafehouseId | Query residents by safehouse |
| Donations | SupporterId | Query donations by donor |
| Donations | DonationDate | Time-series analysis |
| SocialMediaPosts | PostDate | Chronological feeds |

---

## 🔐 Security Considerations

- **ProcessRecordings** marked as confidential (`IsConfidential = true`)
- **Residents** contain sensitive minor data — role-based access required
- **HealthWellbeingRecords** contain medical information — HIPAA/GDPR compliance
- **AspNetUsers** passwords hashed by Identity framework

---

## 🚀 Migrations

```bash
# Create initial migration
cd backend
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

---

*Generated: April 6, 2026*  
*Team: 1-12*
