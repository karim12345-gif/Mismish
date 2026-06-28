CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'SUPPORT', 'OPERATIONS', 'FINANCE');

CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

ALTER TABLE "User"
ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Vendor"
ADD COLUMN "status" "VendorStatus" NOT NULL DEFAULT 'APPROVED';

CREATE TABLE "Admin" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'OWNER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" SERIAL NOT NULL,
  "adminId" INTEGER,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
