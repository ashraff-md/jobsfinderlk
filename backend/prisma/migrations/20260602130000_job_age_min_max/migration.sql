-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "age_min" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "age_max" INTEGER;

-- DropColumn
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "age_requirement";
