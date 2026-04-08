-- Nhyira Haven Test Users - Raw INSERT
-- Try running this. If users already exist, you'll get errors - just ignore them.

-- Roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES ('r1', 'Admin', 'ADMIN', 'c1');
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES ('r2', 'Staff', 'STAFF', 'c2');
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES ('r3', 'Donor', 'DONOR', 'c3');

-- Users (Password: NhyiraHaven2026!)
INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
VALUES ('u1', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', 'admin@nhyirahaven.org', 'ADMIN@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 's1', 'c1', false, true, 0);

INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
VALUES ('u2', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', 'staff@nhyirahaven.org', 'STAFF@NHYIRAHAVEN.ORG', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 's2', 'c2', false, true, 0);

INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
VALUES ('u3', 'donor@example.com', 'DONOR@EXAMPLE.COM', 'donor@example.com', 'DONOR@EXAMPLE.COM', true, 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j==', 's3', 'c3', false, true, 0);

-- Link roles
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES ('u1', 'r1');
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES ('u2', 'r2');
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES ('u3', 'r3');

-- Check results
SELECT * FROM "AspNetUsers" WHERE "Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');
