-- CreateTable
CREATE TABLE "attack_techniques" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "technique_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tactics" TEXT,
    "platforms" TEXT,
    "data_source" TEXT,
    "detection_difficulty" TEXT,
    "url" TEXT,
    "mitigations" TEXT,
    "subtechniques" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "attack_tactics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tactic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "short_name" TEXT NOT NULL,
    "techniques" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "attack_techniques_technique_id_key" ON "attack_techniques"("technique_id");

-- CreateIndex
CREATE INDEX "attack_techniques_technique_id_idx" ON "attack_techniques"("technique_id");

-- CreateIndex
CREATE UNIQUE INDEX "attack_tactics_tactic_id_key" ON "attack_tactics"("tactic_id");

-- CreateIndex
CREATE INDEX "attack_tactics_tactic_id_idx" ON "attack_tactics"("tactic_id");

-- CreateIndex
CREATE INDEX "attack_tactics_short_name_idx" ON "attack_tactics"("short_name");
