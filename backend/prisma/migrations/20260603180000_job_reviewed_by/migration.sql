-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "reviewed_by_id" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
