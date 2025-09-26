-- AlterTable
CREATE SEQUENCE "public".page_id_seq;
ALTER TABLE "public"."Page" ALTER COLUMN "id" SET DEFAULT nextval('"public".page_id_seq');
ALTER SEQUENCE "public".page_id_seq OWNED BY "public"."Page"."id";

-- AlterTable
CREATE SEQUENCE "public".post_id_seq;
ALTER TABLE "public"."Post" ALTER COLUMN "id" SET DEFAULT nextval('"public".post_id_seq');
ALTER SEQUENCE "public".post_id_seq OWNED BY "public"."Post"."id";

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "sha1" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "uploaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_sha1_key" ON "public"."Image"("sha1");

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
