-- Update passwords with REAL ASP.NET Identity hashes
-- Password for all: NhyiraHaven2026!
-- Generated using Microsoft.AspNetCore.Identity.PasswordHasher

-- Update all three users with the correct password hash
UPDATE "AspNetUsers" 
SET "PasswordHash" = 'AQAAAAEAACcQAAAAEKMK/klF9HxCxmfZpXo7kLC6L0OKe64L09xioDIHObD05PE9GhOOPKfnw1mXKMWuVQ==',
    "SecurityStamp" = 'stamp-' || md5(random()::text),
    "ConcurrencyStamp" = md5(random()::text),
    "EmailConfirmed" = true,
    "TwoFactorEnabled" = false,
    "LockoutEnabled" = false,
    "AccessFailedCount" = 0
WHERE "Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');

-- Verify the update
SELECT "Email", LEFT("PasswordHash", 40) as "Hash_Preview", "EmailConfirmed", "LockoutEnabled"
FROM "AspNetUsers" 
WHERE "Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');
