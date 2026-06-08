-- CreateTable
CREATE TABLE "government_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organization_type" TEXT NOT NULL,
    "parent_organization_id" TEXT,
    "short_name" TEXT,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "contact_number" TEXT,
    "head_office_address" TEXT,
    "district" TEXT,
    "province" TEXT,
    "logo_url" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_organizations_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "government_organization_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "government_organizations_slug_key" ON "government_organizations"("slug");

-- CreateIndex
CREATE INDEX "government_organizations_name_idx" ON "government_organizations"("name");

-- AddForeignKey
ALTER TABLE "government_organizations" ADD CONSTRAINT "government_organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "government_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_organizations" ADD CONSTRAINT "government_organizations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_government_organization_id_fkey" FOREIGN KEY ("government_organization_id") REFERENCES "government_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
