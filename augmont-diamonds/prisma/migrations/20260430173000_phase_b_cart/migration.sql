-- AlterTable: orders gains Augmont order tracking fields
ALTER TABLE "orders"
  ADD COLUMN "customerName"         TEXT,
  ADD COLUMN "augmontInvoiceNumber" TEXT,
  ADD COLUMN "augmontOrderId"       TEXT,
  ADD COLUMN "cartItemIds"          JSONB,
  ADD COLUMN "orderNote"            TEXT,
  ADD COLUMN "statusLastChecked"    TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "orders_augmontInvoiceNumber_key" ON "orders"("augmontInvoiceNumber");

-- CreateTable: cart_items — per-buyer line items, scoped by sessionId
CREATE TABLE "cart_items" (
    "id"                TEXT          NOT NULL,
    "shop"              TEXT          NOT NULL,
    "sessionId"         TEXT          NOT NULL,
    "augmontCartItemId" TEXT,
    "diamondId"         TEXT          NOT NULL,
    "diamondDetails"    JSONB         NOT NULL,
    "status"            TEXT          NOT NULL DEFAULT 'active',
    "createdAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cart_items_shop_sessionId_status_idx" ON "cart_items"("shop", "sessionId", "status");
CREATE INDEX "cart_items_augmontCartItemId_idx"     ON "cart_items"("augmontCartItemId");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_shop_fkey"
  FOREIGN KEY ("shop") REFERENCES "merchants"("shopId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
