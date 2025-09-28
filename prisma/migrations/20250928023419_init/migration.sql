-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'editor', 'writer');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('student', 'teacher');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "public"."UserAuditLogType" AS ENUM ('login', 'autoCreatePost', 'writerCreatePost', 'writerEditPost', 'editorApprovePost', 'adminApprovePost', 'adminPublishPost', 'writerCreatePage', 'writerEditPage', 'editorApprovePage', 'adminApprovePage', 'adminPublishPage', 'unpublishPost', 'unpublishPage', 'deletePost', 'deletePage', 'uploadImage', 'deleteImage');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "phone" TEXT,
    "roles" "public"."Role"[],
    "type" "public"."UserType" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAuditLog" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."UserAuditLogType" NOT NULL,
    "userId" INTEGER,
    "values" TEXT[],

    CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentPublishedEN" TEXT,
    "contentPublishedZH" TEXT,
    "contentDraftEN" TEXT NOT NULL,
    "contentDraftZH" TEXT NOT NULL,
    "editorsApproved" INTEGER[],
    "adminsApproved" INTEGER[],
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" SERIAL NOT NULL,
    "titleEN" TEXT NOT NULL,
    "titleZH" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentPublishedEN" TEXT,
    "contentPublishedZH" TEXT,
    "contentDraftEN" TEXT NOT NULL,
    "contentDraftZH" TEXT NOT NULL,
    "editorsApproved" INTEGER[],
    "adminsApproved" INTEGER[],
    "lockedAt" TIMESTAMP(3),
    "coverImageId" INTEGER,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "sha1" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeKB" INTEGER NOT NULL,
    "uploaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "public"."Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Image_sha1_key" ON "public"."Image"("sha1");

-- AddForeignKey
ALTER TABLE "public"."UserAuditLog" ADD CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
