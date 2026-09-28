-- Persist customer-selected pickup day offset and effective pickup end window
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupOffset" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupWindowEnd" TIMESTAMP(3);
