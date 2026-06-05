-- CreateTable
CREATE TABLE "platform_banner_campaigns" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "aspect_ratio" "BannerAspectRatio" NOT NULL,
    "href" TEXT NOT NULL DEFAULT '/jobs',
    "image_url" TEXT,
    "alt" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_banner_campaigns_pkey" PRIMARY KEY ("id")
);
