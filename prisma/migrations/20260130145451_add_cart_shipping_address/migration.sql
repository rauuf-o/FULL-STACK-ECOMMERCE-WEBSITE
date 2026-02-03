/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "shippingAddress" JSON;

-- CreateIndex
CREATE UNIQUE INDEX "cart_session_idx" ON "Cart"("sessionId");
