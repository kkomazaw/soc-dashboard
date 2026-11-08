-- CreateTable
CREATE TABLE "epss_scores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cve_id" TEXT NOT NULL,
    "epss" REAL NOT NULL,
    "percentile" REAL NOT NULL,
    "model_version" TEXT NOT NULL,
    "score_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "epss_scores_cve_id_key" ON "epss_scores"("cve_id");

-- CreateIndex
CREATE INDEX "epss_scores_cve_id_idx" ON "epss_scores"("cve_id");

-- CreateIndex
CREATE INDEX "epss_scores_epss_idx" ON "epss_scores"("epss");

-- CreateIndex
CREATE INDEX "epss_scores_score_date_idx" ON "epss_scores"("score_date");
