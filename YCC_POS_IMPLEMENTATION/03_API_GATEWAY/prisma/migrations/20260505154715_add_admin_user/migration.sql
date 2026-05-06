-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canAccessAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canAccessKds" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canAccessPos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pin" TEXT;

-- Insertar usuario admin universal con PIN 0000 (solo si no existe)
DO $$
BEGIN
  -- Verificar si el usuario admin-universal ya existe
  IF NOT EXISTS (SELECT 1 FROM "User" WHERE "id" = 'admin-universal') THEN
    INSERT INTO "User" (
      "id", "username", "email", "passwordHash", "firstName", "lastName", 
      "role", "pin", "isActive", "canAccessPos", "canAccessKds", "canAccessAdmin", "createdAt", "updatedAt"
    ) VALUES (
      'admin-universal', 
      'admin-universal', 
      'admin-universal@countryclub.com', 
      '$2b$10$defaultHashForAdmin', 
      'Administrador', 
      'Universal',
      'ADMIN', 
      '0000', 
      true, 
      true, 
      true, 
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  ELSE
    -- Actualizar el PIN si ya existe
    UPDATE "User" SET 
      "pin" = '0000',
      "canAccessPos" = true,
      "canAccessKds" = true,
      "canAccessAdmin" = true
    WHERE "id" = 'admin-universal';
  END IF;
END $$;
