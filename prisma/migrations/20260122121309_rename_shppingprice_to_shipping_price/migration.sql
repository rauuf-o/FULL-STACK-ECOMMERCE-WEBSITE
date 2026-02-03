/*
  Warnings:

  - You are about to drop the column `shpippingPrice` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "shpippingPrice",
ADD COLUMN     "shippingPrice" INTEGER NOT NULL DEFAULT 0;
