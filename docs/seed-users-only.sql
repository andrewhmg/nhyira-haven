-- Nhyira Haven Test Users ONLY (roles already exist)
-- Password for all: NhyiraHaven2026!

-- Check if users exist first, then insert
DO $$
BEGIN
    -- Admin
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'admin@nhyirahaven.org') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('u1-admin', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'stamp1', 'conc1', false, true, 0);
        
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") 
        SELECT 'u1-admin', "Id" FROM "AspNetRoles" WHERE "Name" = 'Admin';
    END IF;

    -- Staff
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'staff@nhyirahaven.org') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('u2-staff', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'stamp2', 'conc2', false, true, 0);
        
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") 
        SELECT 'u2-staff', "Id" FROM "AspNetRoles" WHERE "Name" = 'Staff';
    END IF;

    -- Donor
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'donor@example.com') THEN
        INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
        VALUES ('u3-donor', 'donor@example.com', 'DONOR@EXAMPLE.COM', 'donor@example.com', 'DONOR@EXAMPLE.COM', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 'stamp3', 'conc3', false, true, 0);
        
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") 
        SELECT 'u3-donor', "Id" FROM "AspNetRoles" WHERE "Name" = 'Donor';
    END IF;
END $$;

-- Show results
SELECT u."Email", u."UserName", r."Name" as "Role"
FROM "AspNetUsers" u
LEFT JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
LEFT JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');
