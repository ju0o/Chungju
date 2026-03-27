-- CreateTable
CREATE TABLE "publishing_consultations" (
    "id" TEXT NOT NULL,
    "activity_name" TEXT NOT NULL,
    "has_manuscript" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "publish_format" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publishing_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "publishing_consultations_created_at_idx" ON "publishing_consultations"("created_at");
