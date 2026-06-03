-- AlterTable
ALTER TABLE "companies" ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT;

-- AlterTable
ALTER TABLE "company_requests" ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT;

-- Backfill city from legacy location
UPDATE "companies" SET "city" = "location" WHERE "location" IS NOT NULL AND "city" IS NULL;
UPDATE "company_requests" SET "city" = "location" WHERE "location" IS NOT NULL AND "city" IS NULL;
