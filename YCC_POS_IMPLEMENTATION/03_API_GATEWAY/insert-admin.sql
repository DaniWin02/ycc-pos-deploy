-- Insert admin universal user if not exists
INSERT INTO "User" ("id", "username", "email", "passwordHash", "firstName", "lastName", "role", "pin", "isActive", "canAccessPos", "canAccessKds", "canAccessAdmin", "createdAt", "updatedAt")
VALUES ('admin-universal', 'admin', 'admin@countryclub.com', '$2b$10$defaultHashForAdmin', 'Administrador', 'Universal', 'ADMIN', '0000', true, true, true, true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "pin" = '0000', "canAccessPos" = true, "canAccessKds" = true, "canAccessAdmin" = true;
