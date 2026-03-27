CREATE TABLE IF NOT EXISTS "book_stock_alerts" (
  "id" TEXT NOT NULL,
  "booth_id" TEXT,
  "book_title" TEXT NOT NULL,
  "author_name" TEXT,
  "contact" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "book_stock_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "book_stock_alerts_created_at_idx" ON "book_stock_alerts"("created_at");

