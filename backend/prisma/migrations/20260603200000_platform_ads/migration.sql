-- CreateEnum
CREATE TYPE "BannerAspectRatio" AS ENUM ('RATIO_3_2', 'RATIO_2_5');

-- CreateTable
CREATE TABLE "platform_banner_slots" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "aspect_ratio" "BannerAspectRatio" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_banner_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_banner_slides" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "href" TEXT NOT NULL DEFAULT '/jobs',
    "image_url" TEXT,
    "alt" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_banner_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_ads" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_banner_slots_key_key" ON "platform_banner_slots"("key");

-- CreateIndex
CREATE UNIQUE INDEX "sponsored_ads_job_id_key" ON "sponsored_ads"("job_id");

-- AddForeignKey
ALTER TABLE "platform_banner_slides" ADD CONSTRAINT "platform_banner_slides_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "platform_banner_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_ads" ADD CONSTRAINT "sponsored_ads_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
