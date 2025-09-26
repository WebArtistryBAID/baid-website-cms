/*
  Warnings:

  - Added the required column `height` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeKB` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Image"
    ADD COLUMN "height" INTEGER NOT NULL,
ADD COLUMN     "sizeKB" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
