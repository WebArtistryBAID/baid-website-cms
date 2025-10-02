/*
  Warnings:

  - You are about to drop the column `category` on the `ContentEntity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ContentEntity" DROP COLUMN "category",
ADD COLUMN     "categoryEN" TEXT,
ADD COLUMN     "categoryZH" TEXT;
