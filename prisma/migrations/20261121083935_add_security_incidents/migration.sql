-- CreateTable
CREATE TABLE "security_incidents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "incident_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternate_name" TEXT,
    "discovery_date" DATETIME NOT NULL,
    "public_disclosure" DATETIME,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affected_systems" TEXT,
    "related_cves" TEXT,
    "threat_actors" TEXT,
    "mitigations" TEXT,
    "references" TEXT,
    "impact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "source_url" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "security_incidents_incident_id_key" ON "security_incidents"("incident_id");

-- CreateIndex
CREATE INDEX "security_incidents_incident_id_idx" ON "security_incidents"("incident_id");

-- CreateIndex
CREATE INDEX "security_incidents_discovery_date_idx" ON "security_incidents"("discovery_date");

-- CreateIndex
CREATE INDEX "security_incidents_severity_idx" ON "security_incidents"("severity");

-- CreateIndex
CREATE INDEX "security_incidents_category_idx" ON "security_incidents"("category");

-- CreateIndex
CREATE INDEX "security_incidents_status_idx" ON "security_incidents"("status");

-- CreateIndex
CREATE INDEX "security_incidents_source_idx" ON "security_incidents"("source");
