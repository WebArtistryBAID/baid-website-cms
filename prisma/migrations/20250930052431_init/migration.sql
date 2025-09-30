-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'editor', 'writer');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('student', 'teacher');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "public"."UserAuditLogType" AS ENUM ('login', 'autoCreatePost', 'writerCreatePost', 'writerEditPost', 'editorApprovePost', 'adminApprovePost', 'adminPublishPost', 'writerCreatePage', 'writerEditPage', 'editorApprovePage', 'adminApprovePage', 'adminPublishPage', 'unpublishPost', 'unpublishPage', 'deletePost', 'deletePage', 'uploadImage', 'deleteImage');

-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('post', 'page', 'club', 'activity', 'project', 'course', 'faculty');

-- CreateTable
CREATE TABLE "public"."User"
(
    "id"        INTEGER             NOT NULL,
    "name"      TEXT                NOT NULL,
    "pinyin"    TEXT                NOT NULL,
    "phone"     TEXT,
    "roles"     "public"."Role"[],
    "type"      "public"."UserType" NOT NULL,
    "gender"    "public"."Gender"   NOT NULL,
    "createdAt" TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)        NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAuditLog"
(
    "id"     SERIAL                      NOT NULL,
    "time"   TIMESTAMP(3)                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type"   "public"."UserAuditLogType" NOT NULL,
    "userId" INTEGER,
    "values" TEXT[],

    CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page"
(
    "id"                 SERIAL       NOT NULL,
    "name"               TEXT         NOT NULL,
    "slug"               TEXT         NOT NULL,
    "contentPublishedEN" TEXT,
    "contentPublishedZH" TEXT,
    "contentDraftEN"     TEXT         NOT NULL,
    "contentDraftZH"     TEXT         NOT NULL,
    "creatorId"          INTEGER      NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubContent"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityContent"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectContent"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseContent"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FacultyContent"
(
    "id"                    SERIAL       NOT NULL,
    "titlePublishedEN"      TEXT,
    "titlePublishedZH"      TEXT,
    "titleDraftEN"          TEXT         NOT NULL,
    "titleDraftZH"          TEXT         NOT NULL,
    "slug"                  TEXT         NOT NULL,
    "contentPublishedEN"    TEXT,
    "contentPublishedZH"    TEXT,
    "contentDraftEN"        TEXT         NOT NULL,
    "contentDraftZH"        TEXT         NOT NULL,
    "coverImagePublishedId" INTEGER,
    "coverImageDraftId"     INTEGER,
    "creatorId"             INTEGER      NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image"
(
    "id"         SERIAL       NOT NULL,
    "sha1"       TEXT         NOT NULL,
    "name"       TEXT         NOT NULL,
    "altText"    TEXT         NOT NULL,
    "width"      INTEGER      NOT NULL,
    "height"     INTEGER      NOT NULL,
    "sizeKB"     INTEGER      NOT NULL,
    "uploaderId" INTEGER,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Approval"
(
    "id"         SERIAL                NOT NULL,
    "entityType" "public"."EntityType" NOT NULL,
    "entityId"   INTEGER               NOT NULL,
    "role"       "public"."Role"       NOT NULL,
    "userId"     INTEGER               NOT NULL,
    "createdAt"  TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApprovalConfig"
(
    "id"         SERIAL                NOT NULL,
    "entityType" "public"."EntityType" NOT NULL,
    "minEditor"  INTEGER               NOT NULL DEFAULT 1,
    "minAdmin"   INTEGER               NOT NULL DEFAULT 1,

    CONSTRAINT "ApprovalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityLock"
(
    "id"         SERIAL                NOT NULL,
    "entityType" "public"."EntityType" NOT NULL,
    "entityId"   INTEGER               NOT NULL,
    "lockedBy"   INTEGER               NOT NULL,
    "lockedAt"   TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token"      TEXT                  NOT NULL,

    CONSTRAINT "EntityLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "public"."Post" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ClubContent_slug_key" ON "public"."ClubContent" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityContent_slug_key" ON "public"."ActivityContent" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectContent_slug_key" ON "public"."ProjectContent" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CourseContent_slug_key" ON "public"."CourseContent" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyContent_slug_key" ON "public"."FacultyContent" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Image_sha1_key" ON "public"."Image" ("sha1");

-- CreateIndex
CREATE INDEX "Approval_entityType_entityId_idx" ON "public"."Approval" ("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_entityType_entityId_role_userId_key" ON "public"."Approval" ("entityType", "entityId", "role", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalConfig_entityType_key" ON "public"."ApprovalConfig" ("entityType");

-- CreateIndex
CREATE INDEX "EntityLock_lockedBy_idx" ON "public"."EntityLock" ("lockedBy");

-- CreateIndex
CREATE UNIQUE INDEX "EntityLock_entityType_entityId_key" ON "public"."EntityLock" ("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "public"."UserAuditLog"
    ADD CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page"
    ADD CONSTRAINT "Page_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post"
    ADD CONSTRAINT "Post_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post"
    ADD CONSTRAINT "Post_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post"
    ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubContent"
    ADD CONSTRAINT "ClubContent_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubContent"
    ADD CONSTRAINT "ClubContent_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubContent"
    ADD CONSTRAINT "ClubContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityContent"
    ADD CONSTRAINT "ActivityContent_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityContent"
    ADD CONSTRAINT "ActivityContent_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityContent"
    ADD CONSTRAINT "ActivityContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectContent"
    ADD CONSTRAINT "ProjectContent_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectContent"
    ADD CONSTRAINT "ProjectContent_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectContent"
    ADD CONSTRAINT "ProjectContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseContent"
    ADD CONSTRAINT "CourseContent_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseContent"
    ADD CONSTRAINT "CourseContent_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseContent"
    ADD CONSTRAINT "CourseContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacultyContent"
    ADD CONSTRAINT "FacultyContent_coverImagePublishedId_fkey" FOREIGN KEY ("coverImagePublishedId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacultyContent"
    ADD CONSTRAINT "FacultyContent_coverImageDraftId_fkey" FOREIGN KEY ("coverImageDraftId") REFERENCES "public"."Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacultyContent"
    ADD CONSTRAINT "FacultyContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image"
    ADD CONSTRAINT "Image_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
