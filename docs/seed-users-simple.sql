-- Nhyira Haven Test Users - Simple Version
-- Password for all: NhyiraHaven2026!
-- Run this in Supabase SQL Editor

-- First check if tables exist
DO $$
BEGIN
    -- Create Roles if not exist
    IF NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Admin') THEN
        INSERT INTO "AspNetRoles" VALUES ('role-admin-id', 'Admin', 'ADMIN', null);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Staff') THEN
        INSERT INTO "AspNetRoles" VALUES ('role-staff-id', 'Staff', 'STAFF', null);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = 'Donor') THEN
        INSERT INTO "AspNetRoles" VALUES ('role-donor-id', 'Donor', 'DONOR', null);
    END IF;

    -- Create Admin if not exists
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'admin@nhyirahaven.org') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('user-admin-id', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'sec-stamp-1', 'conc-stamp-1', false, true, 0);
    END IF;

    -- Create Staff if not exists
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'staff@nhyirahaven.org') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('user-staff-id', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'sec-stamp-2', 'conc-stamp-2', false, true, 0);
    END IF;

    -- Create Donor if not exists
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'donor@example.com') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('user-donor-id', 'donor@example.com', 'DONOR@EXAMPLE.COM', 'donor@example.com', 'DONOR@EXAMPLE.COM', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'sec-stamp-3', 'conc-stamp-3', false, true, 0);
    END IF;
END $$;

-- Verify
SELECT "UserName", "Email", "EmailConfirmed" FROM "AspNetUsers" WHERE "Email" LIKE '%@nhyirahaven.org' OR "Email" = 'donor@example.com';
