-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'editor', 'writer');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('student', 'teacher');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "public"."UserAuditLogType" AS ENUM ('login', 'autoCreatePost', 'writerCreatePost', 'writerEditPost', 'editorApprovePost', 'adminApprovePost', 'adminPublishPost', 'writerCreatePage', 'writerEditPage', 'editorApprovePage', 'adminApprovePage', 'adminPublishPage', 'unpublishPost', 'unpublishPage');

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
    "id" INTEGER NOT NULL,
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
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
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

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "public"."Post"("slug");

-- AddForeignKey
ALTER TABLE "public"."UserAuditLog" ADD CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
