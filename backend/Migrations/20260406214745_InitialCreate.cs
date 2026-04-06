using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NhyiraHaven.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: true),
                    LastName = table.Column<string>(type: "TEXT", nullable: true),
                    Role = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    SecurityStamp = table.Column<string>(type: "TEXT", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Partners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    PartnerType = table.Column<string>(type: "TEXT", nullable: false),
                    ContactName = table.Column<string>(type: "TEXT", nullable: true),
                    ContactPhone = table.Column<string>(type: "TEXT", nullable: true),
                    ContactEmail = table.Column<string>(type: "TEXT", nullable: true),
                    ServicesProvided = table.Column<string>(type: "TEXT", nullable: true),
                    PartnershipStartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublicImpactSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    SnapshotDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalResidentsServed = table.Column<int>(type: "INTEGER", nullable: false),
                    ActiveResidents = table.Column<int>(type: "INTEGER", nullable: false),
                    SuccessfulReintegrations = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalDonationsReceived = table.Column<decimal>(type: "TEXT", nullable: false),
                    TotalDonors = table.Column<int>(type: "INTEGER", nullable: false),
                    ActivePartners = table.Column<int>(type: "INTEGER", nullable: false),
                    SafehouseCount = table.Column<int>(type: "INTEGER", nullable: false),
                    SuccessStory = table.Column<string>(type: "TEXT", nullable: true),
                    ImpactSummary = table.Column<string>(type: "TEXT", nullable: true),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    PublishedDate = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicImpactSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Safehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    Capacity = table.Column<int>(type: "INTEGER", nullable: false),
                    CurrentResidents = table.Column<int>(type: "INTEGER", nullable: false),
                    ContactPhone = table.Column<string>(type: "TEXT", nullable: true),
                    ContactEmail = table.Column<string>(type: "TEXT", nullable: true),
                    EstablishedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Safehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Supporters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: true),
                    SupporterType = table.Column<string>(type: "TEXT", nullable: false),
                    Country = table.Column<string>(type: "TEXT", nullable: true),
                    JoinedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalDonated = table.Column<decimal>(type: "TEXT", nullable: false),
                    DonationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    LastDonationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsAtRisk = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supporters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderKey = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PartnerAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SafehouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    PartnerId = table.Column<int>(type: "INTEGER", nullable: false),
                    AssignmentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartnerAssignments_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PartnerAssignments_Safehouses_SafehouseId",
                        column: x => x.SafehouseId,
                        principalTable: "Safehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Residents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CaseNumber = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Gender = table.Column<string>(type: "TEXT", nullable: false),
                    SafehouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    IntakeDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CaseCategory = table.Column<string>(type: "TEXT", nullable: false),
                    ReferralSource = table.Column<string>(type: "TEXT", nullable: false),
                    GuardianName = table.Column<string>(type: "TEXT", nullable: true),
                    GuardianContact = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    ReintegrationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Residents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Residents_Safehouses_SafehouseId",
                        column: x => x.SafehouseId,
                        principalTable: "Safehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SafehouseMonthlyMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SafehouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    YearMonth = table.Column<string>(type: "TEXT", nullable: false),
                    ResidentCount = table.Column<int>(type: "INTEGER", nullable: false),
                    NewIntakes = table.Column<int>(type: "INTEGER", nullable: false),
                    Reintegrations = table.Column<int>(type: "INTEGER", nullable: false),
                    Transfers = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalDonations = table.Column<decimal>(type: "TEXT", nullable: false),
                    DonationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    OperatingExpenses = table.Column<decimal>(type: "TEXT", nullable: false),
                    StaffCount = table.Column<int>(type: "INTEGER", nullable: false),
                    VolunteerHours = table.Column<int>(type: "INTEGER", nullable: false),
                    Highlights = table.Column<string>(type: "TEXT", nullable: true),
                    Challenges = table.Column<string>(type: "TEXT", nullable: true),
                    RecordedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SafehouseMonthlyMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SafehouseMonthlyMetrics_Safehouses_SafehouseId",
                        column: x => x.SafehouseId,
                        principalTable: "Safehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SupporterId = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", nullable: false),
                    Currency = table.Column<string>(type: "TEXT", nullable: false),
                    DonationType = table.Column<string>(type: "TEXT", nullable: false),
                    DonationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CampaignSource = table.Column<string>(type: "TEXT", nullable: true),
                    SocialMediaPostId = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    IsRecurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecurringFrequency = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_Supporters_SupporterId",
                        column: x => x.SupporterId,
                        principalTable: "Supporters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EducationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    RecordDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SchoolName = table.Column<string>(type: "TEXT", nullable: false),
                    GradeLevel = table.Column<string>(type: "TEXT", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: false),
                    TeacherName = table.Column<string>(type: "TEXT", nullable: true),
                    PerformanceLevel = table.Column<string>(type: "TEXT", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: true),
                    AttendanceRate = table.Column<string>(type: "TEXT", nullable: true),
                    Comments = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EducationRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EducationRecords_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HealthWellbeingRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    RecordDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Height = table.Column<string>(type: "TEXT", nullable: true),
                    Weight = table.Column<string>(type: "TEXT", nullable: true),
                    BloodType = table.Column<string>(type: "TEXT", nullable: true),
                    MedicalConditions = table.Column<string>(type: "TEXT", nullable: true),
                    Medications = table.Column<string>(type: "TEXT", nullable: true),
                    Allergies = table.Column<string>(type: "TEXT", nullable: true),
                    MentalHealthStatus = table.Column<string>(type: "TEXT", nullable: true),
                    CounselingProgress = table.Column<string>(type: "TEXT", nullable: true),
                    HealthConcerns = table.Column<string>(type: "TEXT", nullable: true),
                    NextCheckupDate = table.Column<string>(type: "TEXT", nullable: true),
                    RecordedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthWellbeingRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthWellbeingRecords_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeVisitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    VisitDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    VisitType = table.Column<string>(type: "TEXT", nullable: false),
                    VisitorName = table.Column<string>(type: "TEXT", nullable: true),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    Summary = table.Column<string>(type: "TEXT", nullable: false),
                    FamilyInteraction = table.Column<string>(type: "TEXT", nullable: true),
                    SafetyConcerns = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendations = table.Column<string>(type: "TEXT", nullable: true),
                    FollowUpNeeded = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeVisitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeVisitations_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IncidentReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    IncidentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReportedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IncidentType = table.Column<string>(type: "TEXT", nullable: false),
                    Severity = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ReportedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ActionTaken = table.Column<string>(type: "TEXT", nullable: true),
                    FollowUpRequired = table.Column<string>(type: "TEXT", nullable: true),
                    IsResolved = table.Column<bool>(type: "INTEGER", nullable: false),
                    ResolutionDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncidentReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IncidentReports_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterventionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlanDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Goal = table.Column<string>(type: "TEXT", nullable: false),
                    Interventions = table.Column<string>(type: "TEXT", nullable: false),
                    ResponsibleStaff = table.Column<string>(type: "TEXT", nullable: true),
                    TargetDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Outcomes = table.Column<string>(type: "TEXT", nullable: true),
                    CompletionDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterventionPlans_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessRecordings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResidentId = table.Column<int>(type: "INTEGER", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SessionType = table.Column<string>(type: "TEXT", nullable: false),
                    CounselorName = table.Column<string>(type: "TEXT", nullable: true),
                    Summary = table.Column<string>(type: "TEXT", nullable: false),
                    Observations = table.Column<string>(type: "TEXT", nullable: true),
                    ActionPlan = table.Column<string>(type: "TEXT", nullable: true),
                    FollowUpRequired = table.Column<string>(type: "TEXT", nullable: true),
                    NextSessionDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsConfidential = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessRecordings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessRecordings_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DonationAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DonationId = table.Column<int>(type: "INTEGER", nullable: false),
                    AllocationCategory = table.Column<string>(type: "TEXT", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", nullable: false),
                    AllocationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonationAllocations_Donations_DonationId",
                        column: x => x.DonationId,
                        principalTable: "Donations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InKindDonationItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DonationId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemName = table.Column<string>(type: "TEXT", nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Unit = table.Column<string>(type: "TEXT", nullable: false),
                    EstimatedValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InKindDonationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InKindDonationItems_Donations_DonationId",
                        column: x => x.DonationId,
                        principalTable: "Donations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SocialMediaPosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Platform = table.Column<string>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    PostDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PostUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Likes = table.Column<int>(type: "INTEGER", nullable: true),
                    Shares = table.Column<int>(type: "INTEGER", nullable: true),
                    Comments = table.Column<int>(type: "INTEGER", nullable: true),
                    Reach = table.Column<int>(type: "INTEGER", nullable: true),
                    Impressions = table.Column<int>(type: "INTEGER", nullable: true),
                    Clicks = table.Column<int>(type: "INTEGER", nullable: true),
                    DonationsGenerated = table.Column<decimal>(type: "TEXT", nullable: true),
                    DonationId = table.Column<int>(type: "INTEGER", nullable: true),
                    CampaignTag = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialMediaPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialMediaPosts_Donations_DonationId",
                        column: x => x.DonationId,
                        principalTable: "Donations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DonationAllocations_DonationId",
                table: "DonationAllocations",
                column: "DonationId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_DonationDate",
                table: "Donations",
                column: "DonationDate");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_SupporterId",
                table: "Donations",
                column: "SupporterId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationRecords_ResidentId",
                table: "EducationRecords",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthWellbeingRecords_ResidentId",
                table: "HealthWellbeingRecords",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeVisitations_ResidentId",
                table: "HomeVisitations",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentReports_ResidentId",
                table: "IncidentReports",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_InKindDonationItems_DonationId",
                table: "InKindDonationItems",
                column: "DonationId");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_ResidentId",
                table: "InterventionPlans",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerAssignments_PartnerId",
                table: "PartnerAssignments",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerAssignments_SafehouseId",
                table: "PartnerAssignments",
                column: "SafehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessRecordings_ResidentId",
                table: "ProcessRecordings",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Residents_SafehouseId",
                table: "Residents",
                column: "SafehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_SafehouseMonthlyMetrics_SafehouseId",
                table: "SafehouseMonthlyMetrics",
                column: "SafehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaPosts_DonationId",
                table: "SocialMediaPosts",
                column: "DonationId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaPosts_PostDate",
                table: "SocialMediaPosts",
                column: "PostDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "DonationAllocations");

            migrationBuilder.DropTable(
                name: "EducationRecords");

            migrationBuilder.DropTable(
                name: "HealthWellbeingRecords");

            migrationBuilder.DropTable(
                name: "HomeVisitations");

            migrationBuilder.DropTable(
                name: "IncidentReports");

            migrationBuilder.DropTable(
                name: "InKindDonationItems");

            migrationBuilder.DropTable(
                name: "InterventionPlans");

            migrationBuilder.DropTable(
                name: "PartnerAssignments");

            migrationBuilder.DropTable(
                name: "ProcessRecordings");

            migrationBuilder.DropTable(
                name: "PublicImpactSnapshots");

            migrationBuilder.DropTable(
                name: "SafehouseMonthlyMetrics");

            migrationBuilder.DropTable(
                name: "SocialMediaPosts");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Partners");

            migrationBuilder.DropTable(
                name: "Residents");

            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "Safehouses");

            migrationBuilder.DropTable(
                name: "Supporters");
        }
    }
}
