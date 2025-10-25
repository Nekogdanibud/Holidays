/*
  Warnings:

  - You are about to drop the column `isCapture` on the `memories` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MemoryCaptureType" AS ENUM ('DAILY_MOMENT', 'ACTIVITY_MOMENT');

-- AlterTable
ALTER TABLE "memories" DROP COLUMN "isCapture",
ADD COLUMN     "captureType" "MemoryCaptureType";
