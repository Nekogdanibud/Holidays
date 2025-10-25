/*
  Warnings:

  - Made the column `status` on table `activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `activity_participants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `vacation_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `vacation_members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL;

-- AlterTable
ALTER TABLE "activity_participants" ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "vacation_members" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL;
