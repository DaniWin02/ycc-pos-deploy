-- Find existing admin user and update it, or create new one
-- First, try to find user with username 'admin'
DO $$
DECLARE
  admin_id TEXT;
BEGIN
  SELECT id INTO admin_id FROM "User" WHERE username = 'admin' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    UPDATE "User" SET 
      "pin" = '0000',
      "canAccessPos" = true,
      "canAccessKds" = true,
      "canAccessAdmin" = true,
      "role" = 'ADMIN',
      "firstName" = 'Administrador',
      "lastName" = 'Universal'
    WHERE id = admin_id;
    RAISE NOTICE 'Admin user updated: %', admin_id;
  ELSE
    INSERT INTO "User" ("id", "username", "email", "passwordHash", "firstName", "lastName", "role", "pin", "isActive", "canAccessPos", "canAccessKds", "canAccessAdmin", "createdAt", "updatedAt")
    VALUES ('admin-universal', 'admin', 'admin@countryclub.com', '$2b$10$defaultHashForAdmin', 'Administrador', 'Universal', 'ADMIN', '0000', true, true, true, true, NOW(), NOW());
    RAISE NOTICE 'Admin user created';
  END IF;
END $$;
