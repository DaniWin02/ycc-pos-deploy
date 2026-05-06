ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pin" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canAccessPos" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canAccessKds" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canAccessAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Insert admin universal user if not exists
INSERT INTO "User" ("id", "username", "email", "passwordHash", "firstName", "lastName", "role", "pin", "isActive", "canAccessPos", "canAccessKds", "canAccessAdmin")
VALUES ('admin-universal', 'admin', 'admin@countryclub.com', '$2b$10$defaultHashForAdmin', 'Administrador', 'Universal', 'ADMIN', '0000', true, true, true, true)
ON CONFLICT ("id") DO UPDATE SET "pin" = '0000', "canAccessPos" = true, "canAccessKds" = true, "canAccessAdmin" = true;
