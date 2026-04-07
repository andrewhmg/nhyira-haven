-- ============================================
-- Nhyira Haven - Add Foreign Key Constraints
-- Run this in Supabase SQL Editor
-- ============================================

-- PartnerAssignments FKs
ALTER TABLE "PartnerAssignments" ADD CONSTRAINT "FK_PartnerAssignments_Partners_PartnerId" 
  FOREIGN KEY ("PartnerId") REFERENCES "Partners" ("Id") ON DELETE CASCADE;

ALTER TABLE "PartnerAssignments" ADD CONSTRAINT "FK_PartnerAssignments_Safehouses_SafehouseId" 
  FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- DonationAllocations FKs
ALTER TABLE "DonationAllocations" ADD CONSTRAINT "FK_DonationAllocations_Donations_DonationId" 
  FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE;

ALTER TABLE "DonationAllocations" ADD CONSTRAINT "FK_DonationAllocations_Safehouses_SafehouseId" 
  FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- InKindDonationItems FKs
ALTER TABLE "InKindDonationItems" ADD CONSTRAINT "FK_InKindDonationItems_Donations_DonationId" 
  FOREIGN KEY ("DonationId") REFERENCES "Donations" ("Id") ON DELETE CASCADE;

-- Donations FKs
ALTER TABLE "Donations" ADD CONSTRAINT "FK_Donations_Supporters_SupporterId" 
  FOREIGN KEY ("SupporterId") REFERENCES "Supporters" ("Id") ON DELETE CASCADE;

-- Residents FKs
ALTER TABLE "Residents" ADD CONSTRAINT "FK_Residents_Safehouses_SafehouseId" 
  FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- ProcessRecordings FKs
ALTER TABLE "ProcessRecordings" ADD CONSTRAINT "FK_ProcessRecordings_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- HomeVisitations FKs
ALTER TABLE "HomeVisitations" ADD CONSTRAINT "FK_HomeVisitations_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- EducationRecords FKs
ALTER TABLE "EducationRecords" ADD CONSTRAINT "FK_EducationRecords_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- HealthWellbeingRecords FKs
ALTER TABLE "HealthWellbeingRecords" ADD CONSTRAINT "FK_HealthWellbeingRecords_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- InterventionPlans FKs
ALTER TABLE "InterventionPlans" ADD CONSTRAINT "FK_InterventionPlans_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- IncidentReports FKs
ALTER TABLE "IncidentReports" ADD CONSTRAINT "FK_IncidentReports_Residents_ResidentId" 
  FOREIGN KEY ("ResidentId") REFERENCES "Residents" ("Id") ON DELETE CASCADE;

-- SafehouseMonthlyMetrics FKs
ALTER TABLE "SafehouseMonthlyMetrics" ADD CONSTRAINT "FK_SafehouseMonthlyMetrics_Safehouses_SafehouseId" 
  FOREIGN KEY ("SafehouseId") REFERENCES "Safehouses" ("Id") ON DELETE CASCADE;

-- ASP.NET Identity FKs
ALTER TABLE "AspNetRoleClaims" ADD CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" 
  FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE;

ALTER TABLE "AspNetUserClaims" ADD CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" 
  FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;

ALTER TABLE "AspNetUserLogins" ADD CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" 
  FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;

ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" 
  FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE;

ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" 
  FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;

ALTER TABLE "AspNetUserTokens" ADD CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" 
  FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE;
