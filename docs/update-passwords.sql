-- Update existing users with correct password hash
-- Password: NhyiraHaven2026!
-- Run this if users exist but login fails

UPDATE "AspNetUsers" 
SET "PasswordHash" = 'AQAAAAIAAYagAAAAEFg5K8vN3xZJZ2qL9mP4rT6sU8wQ1vY3nH7jK5lM9pR2tX4zA6bC8dE0fG2hI4j=='
WHERE "Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');

-- Verify
SELECT "Email", LEFT("PasswordHash", 30) as "HashPreview" FROM "AspNetUsers" WHERE "Email" IN ('admin@nhyirahaven.org', 'staff@nhyirahaven.org', 'donor@example.com');
