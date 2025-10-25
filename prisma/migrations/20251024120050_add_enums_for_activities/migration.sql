-- prisma/migrations/20251024120050_add_enums_for_activities/migration.sql

-- Создаем новые ENUM типы
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MEMBER', 'CO_ORGANIZER');
CREATE TYPE "ActivityType" AS ENUM ('FLIGHT', 'HOTEL', 'RESTAURANT', 'ATTRACTION', 'TRANSPORTATION', 'EVENT', 'ACTIVITY', 'SHOPPING', 'BEACH', 'HIKING', 'MUSEUM', 'CONCERT', 'SPORTS');
CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ParticipantStatus" AS ENUM ('GOING', 'MAYBE', 'NOT_GOING');

-- Добавляем временные колонки с новыми типами
ALTER TABLE "activities" ADD COLUMN "type_new" "ActivityType";
ALTER TABLE "activities" ADD COLUMN "status_new" "ActivityStatus" DEFAULT 'PLANNED';
ALTER TABLE "activities" ADD COLUMN "priority_new" "ActivityPriority" DEFAULT 'MEDIUM';

ALTER TABLE "activity_participants" ADD COLUMN "status_new" "ParticipantStatus" DEFAULT 'GOING';

ALTER TABLE "vacation_members" ADD COLUMN "status_new" "MemberStatus" DEFAULT 'PENDING';
ALTER TABLE "vacation_members" ADD COLUMN "role_new" "MemberRole" DEFAULT 'MEMBER';

-- Копируем данные из старых колонок в новые с преобразованием
UPDATE "activities" SET 
  "type_new" = CASE 
    WHEN "type" = 'flight' THEN 'FLIGHT'::"ActivityType"
    WHEN "type" = 'hotel' THEN 'HOTEL'::"ActivityType"
    WHEN "type" = 'restaurant' THEN 'RESTAURANT'::"ActivityType"
    WHEN "type" = 'attraction' THEN 'ATTRACTION'::"ActivityType"
    WHEN "type" = 'transportation' THEN 'TRANSPORTATION'::"ActivityType"
    WHEN "type" = 'event' THEN 'EVENT'::"ActivityType"
    WHEN "type" = 'shopping' THEN 'SHOPPING'::"ActivityType"
    WHEN "type" = 'beach' THEN 'BEACH'::"ActivityType"
    WHEN "type" = 'hiking' THEN 'HIKING'::"ActivityType"
    WHEN "type" = 'museum' THEN 'MUSEUM'::"ActivityType"
    WHEN "type" = 'concert' THEN 'CONCERT'::"ActivityType"
    WHEN "type" = 'sports' THEN 'SPORTS'::"ActivityType"
    ELSE 'ACTIVITY'::"ActivityType"
  END,
  "status_new" = CASE 
    WHEN "status" = 'planned' THEN 'PLANNED'::"ActivityStatus"
    WHEN "status" = 'confirmed' THEN 'CONFIRMED'::"ActivityStatus"
    WHEN "status" = 'in_progress' THEN 'IN_PROGRESS'::"ActivityStatus"
    WHEN "status" = 'completed' THEN 'COMPLETED'::"ActivityStatus"
    WHEN "status" = 'cancelled' THEN 'CANCELLED'::"ActivityStatus"
    ELSE 'PLANNED'::"ActivityStatus"
  END,
  "priority_new" = CASE 
    WHEN "priority" = 'low' THEN 'LOW'::"ActivityPriority"
    WHEN "priority" = 'high' THEN 'HIGH'::"ActivityPriority"
    ELSE 'MEDIUM'::"ActivityPriority"
  END;

UPDATE "activity_participants" SET 
  "status_new" = CASE 
    WHEN "status" = 'going' THEN 'GOING'::"ParticipantStatus"
    WHEN "status" = 'maybe' THEN 'MAYBE'::"ParticipantStatus"
    WHEN "status" = 'not_going' THEN 'NOT_GOING'::"ParticipantStatus"
    ELSE 'GOING'::"ParticipantStatus"
  END;

UPDATE "vacation_members" SET 
  "status_new" = CASE 
    WHEN "status" = 'pending' THEN 'PENDING'::"MemberStatus"
    WHEN "status" = 'accepted' THEN 'ACCEPTED'::"MemberStatus"
    WHEN "status" = 'rejected' THEN 'REJECTED'::"MemberStatus"
    ELSE 'PENDING'::"MemberStatus"
  END,
  "role_new" = CASE 
    WHEN "role" = 'owner' THEN 'OWNER'::"MemberRole"
    WHEN "role" = 'co_organizer' THEN 'CO_ORGANIZER'::"MemberRole"
    ELSE 'MEMBER'::"MemberRole"
  END;

-- Удаляем старые колонки
ALTER TABLE "activities" DROP COLUMN "type";
ALTER TABLE "activities" DROP COLUMN "status";
ALTER TABLE "activities" DROP COLUMN "priority";

ALTER TABLE "activity_participants" DROP COLUMN "status";

ALTER TABLE "vacation_members" DROP COLUMN "status";
ALTER TABLE "vacation_members" DROP COLUMN "role";

-- Переименовываем новые колонки в старые имена
ALTER TABLE "activities" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "activities" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "activities" RENAME COLUMN "priority_new" TO "priority";

ALTER TABLE "activity_participants" RENAME COLUMN "status_new" TO "status";

ALTER TABLE "vacation_members" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "vacation_members" RENAME COLUMN "role_new" TO "role";

-- Делаем колонки NOT NULL (type уже NOT NULL по умолчанию)
ALTER TABLE "activities" ALTER COLUMN "type" SET NOT NULL;
