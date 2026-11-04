-- CreateTable
CREATE TABLE "nvd_cves" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cve_id" TEXT NOT NULL,
    "source_identifier" TEXT,
    "published" DATETIME NOT NULL,
    "last_modified" DATETIME NOT NULL,
    "vuln_status" TEXT,
    "description" TEXT,
    "cvss_score" REAL,
    "cvss_severity" TEXT,
    "cvss_vector" TEXT,
    "cvss_version" TEXT,
    "weaknesses" TEXT,
    "references" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "nvd_cves_cve_id_key" ON "nvd_cves"("cve_id");

-- CreateIndex
CREATE INDEX "nvd_cves_cve_id_idx" ON "nvd_cves"("cve_id");

-- CreateIndex
CREATE INDEX "nvd_cves_published_idx" ON "nvd_cves"("published");

-- CreateIndex
CREATE INDEX "nvd_cves_cvss_score_idx" ON "nvd_cves"("cvss_score");
