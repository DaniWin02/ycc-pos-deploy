-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "config" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT 'global',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);
