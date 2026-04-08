-- Nhyira Haven Test Accounts for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zuyyebiltbkzkooegbrs/sql
-- Password for all users: NhyiraHaven2026!

-- Create Roles (skip if exists)
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT 'a1b2c3d4-0001-0000-0000-000000000001', 'Admin', 'ADMIN', gen_random_uuid()::text
WHERE NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Admin');

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT 'a1b2c3d4-0002-0000-0000-000000000002', 'Staff', 'STAFF', gen_random_uuid()::text
WHERE NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Staff');

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT 'a1b2c3d4-0003-0000-0000-000000000003', 'Donor', 'DONOR', gen_random_uuid()::text
WHERE NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Donor');

-- Create Admin User (Amara Okafor)
-- Password: NhyiraHaven2026! (ASP.NET Identity PBKDF2 hash)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
SELECT 
  'u1a2b3c4-0001-0000-0000-000000000001',
  'admin@nhyirahaven.org',
  'ADMIN@NHYIRAHAVEN.ORG',
  'admin@nhyirahaven.org',
  'ADMIN@NHYIRAHAVEN.ORG',
  true,
  'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==',
  'Amara',
  'Okafor',
  'Admin',
  NOW(),
  false,
  0
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'admin@nhyirahaven.org');

-- Create Staff User (James Mensah)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
SELECT 
  'u1a2b3c4-0002-0000-0000-000000000002',
  'staff@nhyirahaven.org',
  'STAFF@NHYIRAHAVEN.ORG',
  'staff@nhyirahaven.org',
  'STAFF@NHYIRAHAVEN.ORG',
  true,
  'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==',
  'James',
  'Mensah',
  'Staff',
  NOW(),
  false,
  0
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'staff@nhyirahaven.org');

-- Create Donor User (David Mensah)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
SELECT 
  'u1a2b3c4-0003-0000-0000-000000000003',
  'donor@example.com',
  'DONOR@EXAMPLE.COM',
  'donor@example.com',
  'DONOR@EXAMPLE.COM',
  true,
  'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==',
  'David',
  'Mensah',
  'Donor',
  NOW(),
  false,
  0
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'donor@example.com');

-- Link Users to Roles (skip if exists)
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT 'u1a2b3c4-0001-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUserRoles" WHERE "UserId" = 'u1a2b3c4-0001-0000-0000-000000000001' AND "RoleId" = 'a1b2c3d4-0001-0000-0000-000000000001');

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT 'u1a2b3c4-0002-0000-0000-000000000002', 'a1b2c3d4-0002-0000-0000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUserRoles" WHERE "UserId" = 'u1a2b3c4-0002-0000-0000-000000000002' AND "RoleId" = 'a1b2c3d4-0002-0000-0000-000000000002');

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT 'u1a2b3c4-0003-0000-0000-000000000003', 'a1b2c3d4-0003-0000-0000-000000000003'
WHERE NOT EXISTS (SELECT 1 FROM "AspNetUserRoles" WHERE "UserId" = 'u1a2b3c4-0003-0000-0000-000000000003' AND "RoleId" = 'a1b2c3d4-0003-0000-0000-000000000003');

-- Verify insertion
SELECT 
  u."Email", 
  u."FirstName", 
  u."LastName", 
  u."Role",
  r."Name" as "RoleName"
FROM "AspNetUsers" u
LEFT JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
LEFT JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');
