-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "apply_via_registered_post" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "jobs" ADD COLUMN "registered_post_details" TEXT;
