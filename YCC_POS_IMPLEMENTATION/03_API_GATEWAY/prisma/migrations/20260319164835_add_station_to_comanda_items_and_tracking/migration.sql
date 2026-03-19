-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemEstado" ADD VALUE 'RECOGIDO';
ALTER TYPE "ItemEstado" ADD VALUE 'ENTREGADO';

-- AlterTable
ALTER TABLE "ComandaItem" ADD COLUMN     "pickedAt" TIMESTAMP(3),
ADD COLUMN     "preparadoPor" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "readyAt" TIMESTAMP(3),
ADD COLUMN     "recogidoPor" TEXT,
ADD COLUMN     "station" TEXT;
