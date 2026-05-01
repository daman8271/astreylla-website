-- Phase C / C2: drop the unique constraint on sessions.shop so the Shopify
-- Prisma session adapter can store multiple sessions per shop (offline +
-- online + multiple users + refresh-token rotation, all of which are
-- legitimate Shopify patterns the adapter relies on).
--
-- The FK from merchants.shopId → sessions.shop is removed first since the
-- referenced unique key is going away. Merchant.shopId remains @unique on
-- its own table, and Order/Subscription/CartItem still FK to it.
--
-- A non-unique index on sessions.shop replaces the unique index for query
-- performance (session lookups by shop happen on every public storefront
-- request via cart/diamonds/enquiry routes).
--
-- All three operations are non-destructive — no row data is changed.

-- DropForeignKey
ALTER TABLE "merchants" DROP CONSTRAINT "merchants_shopId_fkey";

-- DropIndex
DROP INDEX "sessions_shop_key";

-- CreateIndex
CREATE INDEX "sessions_shop_idx" ON "sessions"("shop");
