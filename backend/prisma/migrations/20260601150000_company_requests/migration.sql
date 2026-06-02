-- CreateEnum
CREATE TYPE "CompanyRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MERGED');

-- AlterTable
ALTER TABLE "companies"
ADD COLUMN "industry" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "company_type" TEXT,
ADD COLUMN "email_domain" TEXT;

-- CreateTable
CREATE TABLE "company_requests" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT,
    "website" TEXT,
    "email_domain" TEXT,
    "location" TEXT,
    "company_type" TEXT,
    "requested_by" TEXT NOT NULL,
    "status" "CompanyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "merged_into_id" TEXT,
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_requests" ADD CONSTRAINT "company_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_requests" ADD CONSTRAINT "company_requests_merged_into_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
