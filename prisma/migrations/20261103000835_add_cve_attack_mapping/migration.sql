-- CreateTable
CREATE TABLE "cve_attack_mappings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cve_id" TEXT NOT NULL,
    "technique_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "match_type" TEXT NOT NULL,
    "match_details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "cve_attack_mappings_cve_id_idx" ON "cve_attack_mappings"("cve_id");

-- CreateIndex
CREATE INDEX "cve_attack_mappings_technique_id_idx" ON "cve_attack_mappings"("technique_id");

-- CreateIndex
CREATE INDEX "cve_attack_mappings_source_idx" ON "cve_attack_mappings"("source");

-- CreateIndex
CREATE UNIQUE INDEX "cve_attack_mappings_cve_id_technique_id_source_key" ON "cve_attack_mappings"("cve_id", "technique_id", "source");
