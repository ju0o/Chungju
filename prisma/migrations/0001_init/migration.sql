-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN', 'DELETED');

CREATE TYPE "PhotocardRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

CREATE TYPE "PhotocardConditionType" AS ENUM ('BOOTH_VISIT', 'STAMP_COUNT', 'CAMPAIGN_COMPLETE', 'REVIEW_WRITE', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT '방문객',
    "device_id" TEXT,
    "session_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "festivals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "map_image_url" TEXT,
    "hero_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notices" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "festivals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booths" (
    "id" TEXT NOT NULL,
    "festival_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '일반',
    "location" TEXT NOT NULL,
    "map_x" DOUBLE PRECISION,
    "map_y" DOUBLE PRECISION,
    "operating_hours" TEXT,
    "image_url" TEXT,
    "contact_info" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booth_qr_codes" (
    "id" TEXT NOT NULL,
    "booth_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "scan_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booth_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamp_campaigns" (
    "id" TEXT NOT NULL,
    "festival_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_stamps" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "allow_duplicate_scan" BOOLEAN NOT NULL DEFAULT false,
    "reward_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stamp_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamp_scans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "stamp_campaign_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "stamp_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stamp_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stamp_campaign_id" TEXT NOT NULL,
    "total_stamps" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "reward_claimed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stamp_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booth_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "image_urls" JSONB NOT NULL DEFAULT '[]',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photocards" (
    "id" TEXT NOT NULL,
    "festival_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "rarity" "PhotocardRarity" NOT NULL DEFAULT 'COMMON',
    "condition_type" "PhotocardConditionType" NOT NULL,
    "condition_value" JSONB NOT NULL DEFAULT '{}',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "max_issuance" INTEGER,
    "issued_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_photocards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "photocard_id" TEXT NOT NULL,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_photocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "festival_id" TEXT NOT NULL,
    "stamp_campaign_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_stamps" INTEGER NOT NULL,
    "image_url" TEXT,
    "total_quantity" INTEGER,
    "claimed_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "target_id" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_device_id_key" ON "users"("device_id");
CREATE UNIQUE INDEX "users_session_token_key" ON "users"("session_token");
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
CREATE UNIQUE INDEX "admin_sessions_token_hash_key" ON "admin_sessions"("token_hash");
CREATE UNIQUE INDEX "booth_qr_codes_booth_id_key" ON "booth_qr_codes"("booth_id");
CREATE UNIQUE INDEX "booth_qr_codes_token_key" ON "booth_qr_codes"("token");
CREATE UNIQUE INDEX "stamp_scans_user_id_qr_code_id_stamp_campaign_id_key" ON "stamp_scans"("user_id", "qr_code_id", "stamp_campaign_id");
CREATE UNIQUE INDEX "user_stamp_progress_user_id_stamp_campaign_id_key" ON "user_stamp_progress"("user_id", "stamp_campaign_id");
CREATE UNIQUE INDEX "user_photocards_user_id_photocard_id_key" ON "user_photocards"("user_id", "photocard_id");

-- CreateIndex (audit_logs)
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_target_target_id_idx" ON "audit_logs"("target", "target_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booths" ADD CONSTRAINT "booths_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booth_qr_codes" ADD CONSTRAINT "booth_qr_codes_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stamp_campaigns" ADD CONSTRAINT "stamp_campaigns_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stamp_scans" ADD CONSTRAINT "stamp_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stamp_scans" ADD CONSTRAINT "stamp_scans_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "booth_qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stamp_scans" ADD CONSTRAINT "stamp_scans_stamp_campaign_id_fkey" FOREIGN KEY ("stamp_campaign_id") REFERENCES "stamp_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_stamp_progress" ADD CONSTRAINT "user_stamp_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_stamp_progress" ADD CONSTRAINT "user_stamp_progress_stamp_campaign_id_fkey" FOREIGN KEY ("stamp_campaign_id") REFERENCES "stamp_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "photocards" ADD CONSTRAINT "photocards_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_photocards" ADD CONSTRAINT "user_photocards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_photocards" ADD CONSTRAINT "user_photocards_photocard_id_fkey" FOREIGN KEY ("photocard_id") REFERENCES "photocards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_stamp_campaign_id_fkey" FOREIGN KEY ("stamp_campaign_id") REFERENCES "stamp_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
