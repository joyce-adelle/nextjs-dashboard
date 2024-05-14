/*
  Warnings:

  - You are about to alter the column `amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `BigInt`.
  - You are about to alter the column `revenue` on the `revenue` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "revenue" ALTER COLUMN "revenue" SET DATA TYPE BIGINT;
