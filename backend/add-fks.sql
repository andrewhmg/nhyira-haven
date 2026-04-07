-- Add FK constraints for Nhyira Haven database
-- Run this in Supabase SQL Editor or psql

-- PartnerAssignments
ALTER TABLE "PartnerAssignments" ADD CONSTRAINT IF NOT EXISTS "FK_PartnerAssignments_Partners_PartnerId" FOREIGN KEY ("PartnerId") REFERENCES "Partners" ("Id") ON DELETE CASCADE;
ALTER TABLE "PartnerAssignments" ADD CONSTRAINT IF NOT EXISTS "FK_PartnerAssignments_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- DonationAllocations
ALTER TABLE "DonationAllocations" ADD CONSTRAINT IF NOT EXISTS "FK_DonationAllocations_Donations_DonationId" FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE;
ALTER TABLE "DonationAllocations" ADD CONSTRAINT IF NOT EXISTS "FK_DonationAllocations_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- InKindDonationItems
ALTER TABLE "InKindDonationItems" ADD CONSTRAINT IF NOT EXISTS "FK_InKindDonationItems_Donations_DonationId" FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE;

-- Donations
ALTER TABLE "Donations" ADD CONSTRAINT IF NOT EXISTS "FK_Donations_Supporters_SupporterId" FOREIGN KEY ("SupporterId") REFERENCES "Supporters" ("Id") ON DELETE CASCADE;

-- Residents
ALTER TABLE "Residents" ADD CONSTRAINT IF NOT EXISTS "FK_Residents_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- ProcessRecordings
ALTER TABLE "ProcessRecordings" ADD CONSTRAINT IF NOT EXISTS "FK_ProcessRecordings_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- HomeVisitations
ALTER TABLE "HomeVisitations" ADD CONSTRAINT IF NOT EXISTS "FK_HomeVisitations_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- EducationRecords
ALTER TABLE "EducationRecords" ADD CONSTRAINT IF NOT EXISTS "FK_EducationRecords_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- HealthWellbeingRecords
ALTER TABLE "HealthWellbeingRecords" ADD CONSTRAINT IF NOT EXISTS "FK_HealthWellbeingRecords_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- InterventionPlans
ALTER TABLE "InterventionPlans" ADD CONSTRAINT IF NOT EXISTS "FK_InterventionPlans_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- IncidentReports
ALTER TABLE "IncidentReports" ADD CONSTRAINT IF NOT EXISTS "FK_IncidentReports_Residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- SafehouseMonthlyMetrics
ALTER TABLE "SafehouseMonthlyMetrics" ADD CONSTRAINT IF NOT EXISTS "FK_SafehouseMonthlyMetrics_Safehouses_SafehouseId" FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- ASP.NET Identity tables
ALTER TABLE "AspNetRoleClaims" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE;
ALTER TABLE "AspNetUserClaims" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;
ALTER TABLE "AspNetUserLogins" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;
ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE;
ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;
ALTER TABLE "AspNetUserTokens" ADD CONSTRAINT IF NOT EXISTS "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;
