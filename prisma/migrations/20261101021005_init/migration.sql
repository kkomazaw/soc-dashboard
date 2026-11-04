-- CreateTable
CREATE TABLE "cisa_kev" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cve_id" TEXT NOT NULL,
    "vendor_project" TEXT,
    "product" TEXT,
    "vulnerability_name" TEXT,
    "date_added" DATETIME NOT NULL,
    "short_description" TEXT,
    "required_action" TEXT,
    "due_date" DATETIME,
    "known_ransomware_campaign_use" BOOLEAN,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "jvn_vulnerabilities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jvn_id" TEXT NOT NULL,
    "cve_id" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "severity" TEXT,
    "cvss_score" REAL,
    "cvss_vector" TEXT,
    "published_date" DATETIME,
    "last_modified_date" DATETIME,
    "affected_products" TEXT,
    "references" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "author" TEXT,
    "source" TEXT NOT NULL,
    "category" TEXT,
    "published_date" DATETIME NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "cisa_kev_cve_id_key" ON "cisa_kev"("cve_id");

-- CreateIndex
CREATE INDEX "cisa_kev_cve_id_idx" ON "cisa_kev"("cve_id");

-- CreateIndex
CREATE INDEX "cisa_kev_date_added_idx" ON "cisa_kev"("date_added");

-- CreateIndex
CREATE UNIQUE INDEX "jvn_vulnerabilities_jvn_id_key" ON "jvn_vulnerabilities"("jvn_id");

-- CreateIndex
CREATE INDEX "jvn_vulnerabilities_jvn_id_idx" ON "jvn_vulnerabilities"("jvn_id");

-- CreateIndex
CREATE INDEX "jvn_vulnerabilities_cve_id_idx" ON "jvn_vulnerabilities"("cve_id");

-- CreateIndex
CREATE INDEX "jvn_vulnerabilities_published_date_idx" ON "jvn_vulnerabilities"("published_date");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_guid_key" ON "news_articles"("guid");

-- CreateIndex
CREATE INDEX "news_articles_source_idx" ON "news_articles"("source");

-- CreateIndex
CREATE INDEX "news_articles_category_idx" ON "news_articles"("category");

-- CreateIndex
CREATE INDEX "news_articles_published_date_idx" ON "news_articles"("published_date");

-- CreateIndex
CREATE INDEX "news_articles_is_read_idx" ON "news_articles"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "app_settings_key_idx" ON "app_settings"("key");
