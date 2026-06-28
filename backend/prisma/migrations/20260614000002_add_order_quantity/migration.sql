-- Add quantity to Order (default 1 keeps all existing rows correct)
ALTER TABLE "Order" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;
