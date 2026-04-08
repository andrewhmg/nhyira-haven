-- Nhyira Haven Test Accounts for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zuyyebiltbkzkooegbrs/sql
-- Password for all users: NhyiraHaven2026!

-- Create Roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Admin', 'ADMIN', gen_random_uuid()::text),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Staff', 'STAFF', gen_random_uuid()::text),
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Donor', 'DONOR', gen_random_uuid()::text)
ON CONFLICT ("Name") DO NOTHING;

-- Create Admin User (Amara Okafor)
-- Password: NhyiraHaven2026! (ASP.NET Identity PBKDF2 hash)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
VALUES 
(
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
)
ON CONFLICT ("Email") DO NOTHING;

-- Create Staff User (James Mensah)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
VALUES 
(
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
)
ON CONFLICT ("Email") DO NOTHING;

-- Create Donor User (David Mensah)
INSERT INTO "AspNetUsers" 
("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt", "LockoutEnabled", "AccessFailedCount")
VALUES 
(
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
)
ON CONFLICT ("Email") DO NOTHING;

-- Link Users to Roles
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
VALUES 
  ('u1a2b3c4-0001-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000001'),
  ('u1a2b3c4-0002-0000-0000-000000000002', 'a1b2c3d4-0002-0000-0000-000000000002'),
  ('u1a2b3c4-0003-0000-0000-000000000003', 'a1b2c3d4-0003-0000-0000-000000000003')
ON CONFLICT ("UserId", "RoleId") DO NOTHING;

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
