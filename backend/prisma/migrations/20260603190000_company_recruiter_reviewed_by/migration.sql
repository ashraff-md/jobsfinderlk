-- AlterTable
ALTER TABLE "company_requests" ADD COLUMN "reviewed_by_id" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "reviewed_by_id" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "company_requests" ADD CONSTRAINT "company_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
