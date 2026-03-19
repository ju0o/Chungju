-- CreateEnum
CREATE TYPE "CrowdLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateTable
CREATE TABLE "booth_crowd_status" (
    "id" TEXT NOT NULL,
    "booth_id" TEXT NOT NULL,
    "level" "CrowdLevel" NOT NULL DEFAULT 'LOW',
    "wait_min" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booth_crowd_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'banner',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "festival_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL DEFAULT '[]',
    "correct_index" INTEGER NOT NULL,
    "explanation" TEXT,
    "reward_type" TEXT,
    "reward_value" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chosen_index" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_visitors" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_moments" (
    "id" TEXT NOT NULL,
    "moment_id" TEXT NOT NULL,
    "picked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picked_by" TEXT,
    "note" TEXT,

    CONSTRAINT "featured_moments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booth_crowd_status_booth_id_key" ON "booth_crowd_status"("booth_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_submissions_quiz_id_user_id_key" ON "quiz_submissions"("quiz_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "active_visitors_session_id_key" ON "active_visitors"("session_id");

-- CreateIndex
CREATE INDEX "active_visitors_last_seen_idx" ON "active_visitors"("last_seen");

-- CreateIndex
CREATE INDEX "featured_moments_picked_at_idx" ON "featured_moments"("picked_at");

-- AddForeignKey
ALTER TABLE "booth_crowd_status" ADD CONSTRAINT "booth_crowd_status_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
