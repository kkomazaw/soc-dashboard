-- CreateTable
CREATE TABLE "ip_threat_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip_address" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "threat_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "source_report_id" TEXT,
    "description" TEXT,
    "reported_date" DATETIME NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "geo_threat_aggregations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "country_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "threat_count" INTEGER NOT NULL,
    "critical_count" INTEGER NOT NULL,
    "high_count" INTEGER NOT NULL,
    "medium_count" INTEGER NOT NULL,
    "low_count" INTEGER NOT NULL,
    "top_threats" TEXT NOT NULL,
    "unique_ips" INTEGER NOT NULL,
    "last_report_date" DATETIME NOT NULL,
    "calculated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ip_threat_reports_ip_address_idx" ON "ip_threat_reports"("ip_address");

-- CreateIndex
CREATE INDEX "ip_threat_reports_country_code_idx" ON "ip_threat_reports"("country_code");

-- CreateIndex
CREATE INDEX "ip_threat_reports_reported_date_idx" ON "ip_threat_reports"("reported_date");

-- CreateIndex
CREATE INDEX "ip_threat_reports_severity_idx" ON "ip_threat_reports"("severity");

-- CreateIndex
CREATE INDEX "ip_threat_reports_source_idx" ON "ip_threat_reports"("source");

-- CreateIndex
CREATE UNIQUE INDEX "geo_threat_aggregations_country_code_key" ON "geo_threat_aggregations"("country_code");

-- CreateIndex
CREATE INDEX "geo_threat_aggregations_country_code_idx" ON "geo_threat_aggregations"("country_code");

-- CreateIndex
CREATE INDEX "geo_threat_aggregations_threat_count_idx" ON "geo_threat_aggregations"("threat_count");

-- CreateIndex
CREATE INDEX "geo_threat_aggregations_calculated_at_idx" ON "geo_threat_aggregations"("calculated_at");
