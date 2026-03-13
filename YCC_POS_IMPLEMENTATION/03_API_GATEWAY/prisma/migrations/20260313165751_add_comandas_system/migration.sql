-- CreateEnum
CREATE TYPE "ComandaTipo" AS ENUM ('MESA', 'DOMICILIO', 'LLEVAR');

-- CreateEnum
CREATE TYPE "ComandaEstado" AS ENUM ('PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ItemEstado" AS ENUM ('PENDIENTE', 'PREPARANDO', 'LISTO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "Comanda" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "mesa" TEXT,
    "domicilio" TEXT,
    "telefono" TEXT,
    "tipo" "ComandaTipo" NOT NULL DEFAULT 'MESA',
    "estado" "ComandaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "total" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "mesero" TEXT,
    "delivery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComandaItem" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "estado" "ItemEstado" NOT NULL DEFAULT 'PENDIENTE',
    "image" TEXT,
    "comandaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComandaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comanda_folio_key" ON "Comanda"("folio");

-- AddForeignKey
ALTER TABLE "ComandaItem" ADD CONSTRAINT "ComandaItem_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "Comanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
