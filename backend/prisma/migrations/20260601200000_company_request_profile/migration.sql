-- AlterTable
ALTER TABLE "company_requests"
ADD COLUMN "description" TEXT,
ADD COLUMN "life_at_company_images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "companies"
ADD COLUMN "life_at_company_images" TEXT[] DEFAULT ARRAY[]::TEXT[];
