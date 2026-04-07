CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "AspNetRoles" (
    "Id" TEXT NOT NULL,
    "Name" TEXT,
    "NormalizedName" TEXT,
    "ConcurrencyStamp" TEXT,
    CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetUsers" (
    "Id" TEXT NOT NULL,
    "FirstName" TEXT,
    "LastName" TEXT,
    "Role" TEXT,
    "CreatedAt" TEXT NOT NULL,
    "LastLogin" TEXT,
    "UserName" TEXT,
    "NormalizedUserName" TEXT,
    "Email" TEXT,
    "NormalizedEmail" TEXT,
    "EmailConfirmed" INTEGER NOT NULL,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" INTEGER NOT NULL,
    "TwoFactorEnabled" INTEGER NOT NULL,
    "LockoutEnd" TEXT,
    "LockoutEnabled" INTEGER NOT NULL,
    "AccessFailedCount" INTEGER NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
);

CREATE TABLE "Partners" (
    "Id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "PartnerType" TEXT NOT NULL,
    "ContactName" TEXT,
    "ContactPhone" TEXT,
    "ContactEmail" TEXT,
    "ServicesProvided" TEXT,
    "PartnershipStartDate" TEXT NOT NULL,
    "IsActive" INTEGER NOT NULL,
    CONSTRAINT "PK_Partners" PRIMARY KEY ("Id")
);

CREATE TABLE "PublicImpactSnapshots" (
    "Id" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "SnapshotDate" TEXT NOT NULL,
    "TotalResidentsServed" INTEGER NOT NULL,
    "ActiveResidents" INTEGER NOT NULL,
    "SuccessfulReintegrations" INTEGER NOT NULL,
    "TotalDonationsReceived" TEXT NOT NULL,
    "TotalDonors" INTEGER NOT NULL,
    "ActivePartners" INTEGER NOT NULL,
    "SafehouseCount" INTEGER NOT NULL,
    "SuccessStory" TEXT,
    "ImpactSummary" TEXT,
    "IsPublished" INTEGER NOT NULL,
    "PublishedDate" TEXT,
    CONSTRAINT "PK_PublicImpactSnapshots" PRIMARY KEY ("Id")
);

CREATE TABLE "Safehouses" (
    "Id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Capacity" INTEGER NOT NULL,
    "CurrentResidents" INTEGER NOT NULL,
    "ContactPhone" TEXT,
    "ContactEmail" TEXT,
    "EstablishedDate" TEXT NOT NULL,
    "IsActive" INTEGER NOT NULL,
    CONSTRAINT "PK_Safehouses" PRIMARY KEY ("Id")
);

CREATE TABLE "Supporters" (
    "Id" INTEGER NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Phone" TEXT,
    "SupporterType" TEXT NOT NULL,
    "Country" TEXT,
    "JoinedDate" TEXT NOT NULL,
    "TotalDonated" TEXT NOT NULL,
    "DonationCount" INTEGER NOT NULL,
    "LastDonationDate" TEXT,
    "IsActive" INTEGER NOT NULL,
    "IsAtRisk" INTEGER NOT NULL,
    CONSTRAINT "PK_Supporters" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetRoleClaims" (
    "Id" INTEGER NOT NULL,
    "RoleId" TEXT NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,
    CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserClaims" (
    "Id" INTEGER NOT NULL,
    "UserId" TEXT NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,
    CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" TEXT NOT NULL,
    "ProviderKey" TEXT NOT NULL,
    "ProviderDisplayName" TEXT,
    "UserId" TEXT NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserRoles" (
    "UserId" TEXT NOT NULL,
    "RoleId" TEXT NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserTokens" (
    "UserId" TEXT NOT NULL,
    "LoginProvider" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Value" TEXT,
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "PartnerAssignments" (
    "Id" INTEGER NOT NULL,
    "SafehouseId" INTEGER NOT NULL,
    "PartnerId" INTEGER NOT NULL,
    "AssignmentDate" TEXT NOT NULL,
    "Role" TEXT,
    "IsActive" INTEGER NOT NULL,
    CONSTRAINT "PK_PartnerAssignments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_PartnerAssignments_Partners_PartnerId" FOREIGN KEY ("PartnerId") REFERENCES "Partners" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PartnerAssignments_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Residents" (
    "Id" INTEGER NOT NULL,
    "CaseNumber" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "DateOfBirth" TEXT NOT NULL,
    "Gender" TEXT NOT NULL,
    "SafehouseId" INTEGER NOT NULL,
    "IntakeDate" TEXT NOT NULL,
    "CaseCategory" TEXT NOT NULL,
    "ReferralSource" TEXT NOT NULL,
    "GuardianName" TEXT,
    "GuardianContact" TEXT,
    "Status" TEXT NOT NULL,
    "ReintegrationDate" TEXT,
    "Notes" TEXT,
    "IsActive" INTEGER NOT NULL,
    CONSTRAINT "PK_Residents" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Residents_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE
);

CREATE TABLE "SafehouseMonthlyMetrics" (
    "Id" INTEGER NOT NULL,
    "SafehouseId" INTEGER NOT NULL,
    "YearMonth" TEXT NOT NULL,
    "ResidentCount" INTEGER NOT NULL,
    "NewIntakes" INTEGER NOT NULL,
    "Reintegrations" INTEGER NOT NULL,
    "Transfers" INTEGER NOT NULL,
    "TotalDonations" TEXT NOT NULL,
    "DonationCount" INTEGER NOT NULL,
    "OperatingExpenses" TEXT NOT NULL,
    "StaffCount" INTEGER NOT NULL,
    "VolunteerHours" INTEGER NOT NULL,
    "Highlights" TEXT,
    "Challenges" TEXT,
    "RecordedDate" TEXT NOT NULL,
    CONSTRAINT "PK_SafehouseMonthlyMetrics" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SafehouseMonthlyMetrics_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Donations" (
    "Id" INTEGER NOT NULL,
    "SupporterId" INTEGER NOT NULL,
    "Amount" TEXT NOT NULL,
    "Currency" TEXT NOT NULL,
    "DonationType" TEXT NOT NULL,
    "DonationDate" TEXT NOT NULL,
    "CampaignSource" TEXT,
    "SocialMediaPostId" INTEGER,
    "Notes" TEXT,
    "IsRecurring" INTEGER NOT NULL,
    "RecurringFrequency" TEXT,
    CONSTRAINT "PK_Donations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Donations_Supporters_SupporterId" FOREIGN KEY ("SupporterId") REFERENCES "Supporters" ("Id") ON DELETE CASCADE
);

CREATE TABLE "EducationRecords" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "RecordDate" TEXT NOT NULL,
    "SchoolName" TEXT NOT NULL,
    "GradeLevel" TEXT NOT NULL,
    "Subject" TEXT NOT NULL,
    "TeacherName" TEXT,
    "PerformanceLevel" TEXT NOT NULL,
    "Score" TEXT,
    "AttendanceRate" TEXT,
    "Comments" TEXT,
    CONSTRAINT "PK_EducationRecords" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_EducationRecords_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "HealthWellbeingRecords" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "RecordDate" TEXT NOT NULL,
    "Height" TEXT,
    "Weight" TEXT,
    "BloodType" TEXT,
    "MedicalConditions" TEXT,
    "Medications" TEXT,
    "Allergies" TEXT,
    "MentalHealthStatus" TEXT,
    "CounselingProgress" TEXT,
    "HealthConcerns" TEXT,
    "NextCheckupDate" TEXT,
    "RecordedBy" TEXT,
    CONSTRAINT "PK_HealthWellbeingRecords" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_HealthWellbeingRecords_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "HomeVisitations" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "VisitDate" TEXT NOT NULL,
    "VisitType" TEXT NOT NULL,
    "VisitorName" TEXT,
    "Location" TEXT NOT NULL,
    "Summary" TEXT NOT NULL,
    "FamilyInteraction" TEXT,
    "SafetyConcerns" TEXT,
    "Recommendations" TEXT,
    "FollowUpNeeded" INTEGER NOT NULL,
    CONSTRAINT "PK_HomeVisitations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_HomeVisitations_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "IncidentReports" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "IncidentDate" TEXT NOT NULL,
    "ReportedDate" TEXT NOT NULL,
    "IncidentType" TEXT NOT NULL,
    "Severity" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "ReportedBy" TEXT,
    "ActionTaken" TEXT,
    "FollowUpRequired" TEXT,
    "IsResolved" INTEGER NOT NULL,
    "ResolutionDate" TEXT,
    "Notes" TEXT,
    CONSTRAINT "PK_IncidentReports" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_IncidentReports_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "InterventionPlans" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "PlanDate" TEXT NOT NULL,
    "Goal" TEXT NOT NULL,
    "Interventions" TEXT NOT NULL,
    "ResponsibleStaff" TEXT,
    "TargetDate" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Outcomes" TEXT,
    "CompletionDate" TEXT,
    "Notes" TEXT,
    CONSTRAINT "PK_InterventionPlans" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_InterventionPlans_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "ProcessRecordings" (
    "Id" INTEGER NOT NULL,
    "ResidentId" INTEGER NOT NULL,
    "SessionDate" TEXT NOT NULL,
    "SessionType" TEXT NOT NULL,
    "CounselorName" TEXT,
    "Summary" TEXT NOT NULL,
    "Observations" TEXT,
    "ActionPlan" TEXT,
    "FollowUpRequired" TEXT,
    "NextSessionDate" TEXT,
    "IsConfidential" INTEGER NOT NULL,
    CONSTRAINT "PK_ProcessRecordings" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ProcessRecordings_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "DonationAllocations" (
    "Id" INTEGER NOT NULL,
    "DonationId" INTEGER NOT NULL,
    "AllocationCategory" TEXT NOT NULL,
    "Amount" TEXT NOT NULL,
    "AllocationDate" TEXT NOT NULL,
    "Notes" TEXT,
    CONSTRAINT "PK_DonationAllocations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_DonationAllocations_Donations_DonationId" FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE
);

CREATE TABLE "InKindDonationItems" (
    "Id" INTEGER NOT NULL,
    "DonationId" INTEGER NOT NULL,
    "ItemName" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Unit" TEXT NOT NULL,
    "EstimatedValue" TEXT NOT NULL,
    "ReceivedDate" TEXT NOT NULL,
    "Notes" TEXT,
    CONSTRAINT "PK_InKindDonationItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_InKindDonationItems_Donations_DonationId" FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE
);

CREATE TABLE "SocialMediaPosts" (
    "Id" INTEGER NOT NULL,
    "Platform" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "PostDate" TEXT NOT NULL,
    "PostUrl" TEXT,
    "Likes" INTEGER,
    "Shares" INTEGER,
    "Comments" INTEGER,
    "Reach" INTEGER,
    "Impressions" INTEGER,
    "Clicks" INTEGER,
    "DonationsGenerated" TEXT,
    "DonationId" INTEGER,
    "CampaignTag" TEXT,
    "Notes" TEXT,
    CONSTRAINT "PK_SocialMediaPosts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SocialMediaPosts_Donations_DonationId" FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id")
);

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");

CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");

CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");

CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");

CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");

CREATE INDEX "IX_DonationAllocations_DonationId" ON "DonationAllocations" ("DonationId");

CREATE INDEX "IX_Donations_DonationDate" ON "Donations" ("DonationDate");

CREATE INDEX "IX_Donations_SupporterId" ON "Donations" ("SupporterId");

CREATE INDEX "IX_EducationRecords_ResidentId" ON "EducationRecords" ("ResidentId");

CREATE INDEX "IX_HealthWellbeingRecords_ResidentId" ON "HealthWellbeingRecords" ("ResidentId");

CREATE INDEX "IX_HomeVisitations_ResidentId" ON "HomeVisitations" ("ResidentId");

CREATE INDEX "IX_IncidentReports_ResidentId" ON "IncidentReports" ("ResidentId");

CREATE INDEX "IX_InKindDonationItems_DonationId" ON "InKindDonationItems" ("DonationId");

CREATE INDEX "IX_InterventionPlans_ResidentId" ON "InterventionPlans" ("ResidentId");

CREATE INDEX "IX_PartnerAssignments_PartnerId" ON "PartnerAssignments" ("PartnerId");

CREATE INDEX "IX_PartnerAssignments_SafehouseId" ON "PartnerAssignments" ("SafehouseId");

CREATE INDEX "IX_ProcessRecordings_ResidentId" ON "ProcessRecordings" ("ResidentId");

CREATE INDEX "IX_Residents_SafehouseId" ON "Residents" ("SafehouseId");

CREATE INDEX "IX_SafehouseMonthlyMetrics_SafehouseId" ON "SafehouseMonthlyMetrics" ("SafehouseId");

CREATE INDEX "IX_SocialMediaPosts_DonationId" ON "SocialMediaPosts" ("DonationId");

CREATE INDEX "IX_SocialMediaPosts_PostDate" ON "SocialMediaPosts" ("PostDate");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260407160213_InitialCreate', '9.0.5');

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260407161820_RecreateForeignKeys', '9.0.5');

COMMIT;

