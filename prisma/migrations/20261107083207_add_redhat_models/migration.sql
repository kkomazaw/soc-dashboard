-- CreateTable
CREATE TABLE "redhat_advisories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "advisory_id" TEXT NOT NULL,
    "advisory_type" TEXT NOT NULL,
    "severity" TEXT,
    "synopsis" TEXT NOT NULL,
    "description" TEXT,
    "public_date" DATETIME NOT NULL,
    "cves" TEXT,
    "affected_packages" TEXT,
    "bugzilla" TEXT,
    "resource_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "redhat_cves" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cve_id" TEXT NOT NULL,
    "severity" TEXT,
    "public_date" DATETIME NOT NULL,
    "advisories" TEXT,
    "bugzilla_id" TEXT,
    "bugzilla_desc" TEXT,
    "cvss_score" TEXT,
    "cvss_vector" TEXT,
    "cvss3_score" TEXT,
    "cvss3_vector" TEXT,
    "cwe" TEXT,
    "details" TEXT,
    "affected_packages" TEXT,
    "resource_url" TEXT,
    "references" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "redhat_advisories_advisory_id_key" ON "redhat_advisories"("advisory_id");

-- CreateIndex
CREATE INDEX "redhat_advisories_advisory_id_idx" ON "redhat_advisories"("advisory_id");

-- CreateIndex
CREATE INDEX "redhat_advisories_public_date_idx" ON "redhat_advisories"("public_date");

-- CreateIndex
CREATE INDEX "redhat_advisories_severity_idx" ON "redhat_advisories"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "redhat_cves_cve_id_key" ON "redhat_cves"("cve_id");

-- CreateIndex
CREATE INDEX "redhat_cves_cve_id_idx" ON "redhat_cves"("cve_id");

-- CreateIndex
CREATE INDEX "redhat_cves_public_date_idx" ON "redhat_cves"("public_date");

-- CreateIndex
CREATE INDEX "redhat_cves_severity_idx" ON "redhat_cves"("severity");
