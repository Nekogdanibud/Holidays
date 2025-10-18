-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "bgColor" TEXT,
ADD COLUMN     "isExclusive" BOOLEAN NOT NULL DEFAULT false;
