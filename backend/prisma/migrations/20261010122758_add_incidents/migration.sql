-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'HIGH',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "organizationId" TEXT NOT NULL,
    "totalPayments" INTEGER NOT NULL,
    "failedPayments" INTEGER NOT NULL,
    "failureRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_organizationId_status_idx" ON "Incident"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Incident_organizationId_createdAt_idx" ON "Incident"("organizationId", "createdAt");
