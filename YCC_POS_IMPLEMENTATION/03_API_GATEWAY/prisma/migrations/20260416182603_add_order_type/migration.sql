-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MESA', 'DOMICILIO', 'LLEVAR', 'BARRA');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'MESA';
