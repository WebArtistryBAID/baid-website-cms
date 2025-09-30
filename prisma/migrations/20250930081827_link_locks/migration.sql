-- AddForeignKey
ALTER TABLE "public"."EntityLock"
    ADD CONSTRAINT "EntityLock_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."ContentEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
