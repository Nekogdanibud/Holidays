-- AlterTable
ALTER TABLE "memories" ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "isCapture" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "public"."CommentType";

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
