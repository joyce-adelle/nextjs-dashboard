/*
  Warnings:

  - The `status` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "status",
ADD COLUMN     "status" "status" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "Status";
