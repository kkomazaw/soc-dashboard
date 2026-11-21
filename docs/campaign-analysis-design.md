# 重大キャンペーンサービス - 設計ドキュメント

## 1. 概要

### 1.1 目的
CLAUDE.mdの「Campaign Analysis」要件に基づき、STIX 2.1準拠の構造化された脅威インテリジェンスプラットフォームを構築します。

### 1.2 現状との違い
- **現状（SecurityIncident）**: 単一のエンティティとして管理。個別のインシデント情報を配列フィールドで保持。
- **新規（Campaign）**: 複数のエンティティ（Campaign、ThreatActor、Malware、AttackPattern）を独立して管理し、関係性をグラフ構造で表現。

### 1.3 主要機能
1. 攻撃キャンペーンの構造化管理
2. 脅威アクター、マルウェア、攻撃パターンの独立管理
3. エンティティ間の関係性の可視化
4. 外部フィード（TAXII、AlienVault OTX、Abuse.chなど）からの自動収集
5. 既存のMITRE ATT&CKデータ、CVEデータとの統合

---

## 2. データモデル設計

### 2.1 ER図概要

```
Campaign (攻撃キャンペーン)
  ├─ uses ──→ Malware (マルウェア)
  ├─ attributed-to ──→ ThreatActor (脅威アクター)
  ├─ uses ──→ AttackTechnique (既存: MITRE ATT&CK)
  ├─ targets ──→ Vulnerability (既存: CVE)
  └─ indicates ──→ Indicator (IoC)

ThreatActor (脅威アクター)
  ├─ uses ──→ Malware
  ├─ uses ──→ AttackTechnique
  └─ targets ──→ TargetSector

Malware (マルウェア)
  ├─ uses ──→ AttackTechnique
  └─ variant-of ──→ Malware (マルウェアファミリー関係)

Indicator (IoC)
  ├─ indicates ──→ Campaign
  ├─ indicates ──→ Malware
  └─ indicates ──→ ThreatActor

CampaignRelationship (関係性)
  ├─ source (ソースエンティティ)
  └─ target (ターゲットエンティティ)
```

### 2.2 Prismaモデル定義

#### Campaign (攻撃キャンペーン)

```prisma
model Campaign {
  id                 Int       @id @default(autoincrement())
  campaignId         String    @unique @map("campaign_id") // campaign-apt29-2024, campaign-emotet-2023
  name               String    // "APT29 SolarWinds Supply Chain Attack"
  aliases            String?   // JSON array ["SolarWinds Hack", "Sunburst Attack"]
  description        String
  firstSeen          DateTime  @map("first_seen")
  lastSeen           DateTime? @map("last_seen")
  objective          String?   // "espionage", "financial-gain", "disruption"

  // STIX 2.1互換フィールド
  confidence         Int       @default(50) // 0-100
  sophistication     String?   // "none", "minimal", "intermediate", "advanced", "expert", "innovator", "strategic"

  // ステータス
  status             String    @default("active") // "active", "inactive", "ongoing"

  // メタデータ
  source             String    @default("manual") // "manual", "taxii", "otx", "misp"
  sourceUrl          String?   @map("source_url")
  metadata           String?   // JSON string with additional STIX fields

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([campaignId])
  @@index([firstSeen])
  @@index([status])
  @@index([objective])
  @@map("campaigns")
}
```

#### ThreatActor (脅威アクター)

```prisma
model ThreatActor {
  id                   Int       @id @default(autoincrement())
  actorId              String    @unique @map("actor_id") // threat-actor-apt29, threat-actor-lazarus
  name                 String    // "APT29", "Lazarus Group"
  aliases              String?   // JSON array ["Cozy Bear", "The Dukes"]
  description          String?

  // 分類
  actorType            String    @map("actor_type") // "nation-state", "cybercrime", "hacktivist", "terrorist", "insider-threat"
  sophistication       String?   // "none", "minimal", "intermediate", "advanced", "expert", "innovator", "strategic"
  resourceLevel        String?   @map("resource_level") // "individual", "club", "contest", "team", "organization", "government"
  primaryMotivation    String?   @map("primary_motivation") // "accidental", "coercion", "dominance", "ideology", "financial-gain", "revenge", "notoriety", "organizational-gain", "unpredictable"

  // 属性
  origin               String?   // Country code (RU, CN, KP, etc.)
  firstSeen            DateTime? @map("first_seen")
  lastSeen             DateTime? @map("last_seen")

  // ターゲット情報
  targetedSectors      String?   @map("targeted_sectors") // JSON array ["government", "finance", "healthcare"]
  targetedCountries    String?   @map("targeted_countries") // JSON array ["US", "JP", "KR"]

  // メタデータ
  source               String    @default("manual")
  sourceUrl            String?   @map("source_url")
  metadata             String?   // JSON string

  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  @@index([actorId])
  @@index([actorType])
  @@index([origin])
  @@map("threat_actors")
}
```

#### Malware (マルウェア)

```prisma
model Malware {
  id                 Int       @id @default(autoincrement())
  malwareId          String    @unique @map("malware_id") // malware-emotet, malware-cobalt-strike
  name               String    // "Emotet", "Cobalt Strike"
  aliases            String?   // JSON array ["Heodo", "Mealybug"]
  description        String?

  // 分類
  malwareTypes       String    @map("malware_types") // JSON array ["trojan", "ransomware", "backdoor", "loader"]

  // 技術的特徴
  architecture       String?   // "x86", "x64", "ARM"
  capabilities       String?   // JSON array ["steals-credentials", "keylogger", "remote-access"]

  // 検知情報
  fileHashes         String?   @map("file_hashes") // JSON object {md5: "", sha1: "", sha256: ""}
  signatures         String?   // JSON array of YARA rules or detection signatures

  // ファミリー関係
  malwareFamily      String?   @map("malware_family") // "Emotet Family"
  variantOf          String?   @map("variant_of") // Reference to parent malware ID

  // 時系列
  firstSeen          DateTime? @map("first_seen")
  lastSeen           DateTime? @map("last_seen")

  // メタデータ
  source             String    @default("manual")
  sourceUrl          String?   @map("source_url")
  metadata           String?   // JSON string

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([malwareId])
  @@index([malwareFamily])
  @@map("malware")
}
```

#### Indicator (IoC: Indicator of Compromise)

```prisma
model Indicator {
  id                 Int       @id @default(autoincrement())
  indicatorId        String    @unique @map("indicator_id") // indicator-ip-1.2.3.4, indicator-domain-evil.com

  // 種別と値
  indicatorType      String    @map("indicator_type") // "ipv4", "ipv6", "domain", "url", "email", "file-hash-md5", "file-hash-sha256"
  value              String    // "192.168.1.1", "evil.com", "abc123def456..."

  // パターン（STIX 2.1形式）
  pattern            String?   // "[ipv4-addr:value = '192.168.1.1']"
  patternType        String?   @map("pattern_type") // "stix"

  // 信頼性
  confidence         Int       @default(50) // 0-100
  validFrom          DateTime  @map("valid_from")
  validUntil         DateTime? @map("valid_until")

  // 分類
  threatType         String?   @map("threat_type") // "malware", "phishing", "c2", "exploit-kit"
  severity           String?   // "critical", "high", "medium", "low", "informational"

  // 説明
  description        String?

  // メタデータ
  source             String    @default("manual") // "manual", "abuseipdb", "otx", "urlhaus"
  sourceUrl          String?   @map("source_url")
  metadata           String?   // JSON string

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([indicatorId])
  @@index([indicatorType])
  @@index([value])
  @@index([validFrom])
  @@index([threatType])
  @@map("indicators")
}
```

#### CampaignRelationship (エンティティ間の関係性)

```prisma
model CampaignRelationship {
  id                 Int       @id @default(autoincrement())

  // ソースとターゲット
  sourceType         String    @map("source_type") // "campaign", "threat-actor", "malware", "indicator", "attack-pattern", "vulnerability"
  sourceId           String    @map("source_id") // Entity ID

  targetType         String    @map("target_type") // "campaign", "threat-actor", "malware", "indicator", "attack-pattern", "vulnerability"
  targetId           String    @map("target_id") // Entity ID

  // 関係タイプ（STIX 2.1 Relationship Types）
  relationshipType   String    @map("relationship_type")
  // Examples:
  // - "uses": Campaign uses Malware, ThreatActor uses AttackTechnique
  // - "attributed-to": Campaign attributed-to ThreatActor
  // - "indicates": Indicator indicates Campaign/Malware/ThreatActor
  // - "targets": Campaign targets Vulnerability
  // - "variant-of": Malware variant-of Malware
  // - "impersonates": ThreatActor impersonates Organization

  // 信頼性
  confidence         Int       @default(50) // 0-100

  // 説明
  description        String?

  // 時系列
  firstSeen          DateTime? @map("first_seen")
  lastSeen           DateTime? @map("last_seen")

  // メタデータ
  source             String    @default("manual")
  metadata           String?   // JSON string

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@unique([sourceType, sourceId, targetType, targetId, relationshipType])
  @@index([sourceType, sourceId])
  @@index([targetType, targetId])
  @@index([relationshipType])
  @@map("campaign_relationships")
}
```

#### TargetSector (ターゲット業界・セクター)

```prisma
model TargetSector {
  id                 Int       @id @default(autoincrement())
  sectorId           String    @unique @map("sector_id") // "sector-finance", "sector-healthcare"
  name               String    // "金融", "医療", "政府"
  nameEn             String    @map("name_en") // "finance", "healthcare", "government"
  description        String?

  // 統計
  campaignCount      Int       @default(0) @map("campaign_count")
  threatActorCount   Int       @default(0) @map("threat_actor_count")

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([sectorId])
  @@map("target_sectors")
}
```

---

## 3. バックエンドAPI設計

### 3.1 RESTful APIエンドポイント

#### Campaigns API

```
GET    /api/campaigns                    # 全キャンペーン取得（フィルタリング対応）
GET    /api/campaigns/:id                # 特定キャンペーン取得
GET    /api/campaigns/:id/graph          # キャンペーンの関係グラフ取得
POST   /api/campaigns                    # 新規キャンペーン作成
PATCH  /api/campaigns/:id                # キャンペーン更新
DELETE /api/campaigns/:id                # キャンペーン削除
GET    /api/campaigns/stats              # キャンペーン統計
POST   /api/campaigns/refresh            # 外部フィードから更新
```

#### Threat Actors API

```
GET    /api/threat-actors                # 全脅威アクター取得
GET    /api/threat-actors/:id            # 特定脅威アクター取得
GET    /api/threat-actors/:id/campaigns  # アクターが関与したキャンペーン一覧
GET    /api/threat-actors/:id/malware    # アクターが使用したマルウェア一覧
POST   /api/threat-actors                # 新規脅威アクター作成
PATCH  /api/threat-actors/:id            # 脅威アクター更新
DELETE /api/threat-actors/:id            # 脅威アクター削除
```

#### Malware API

```
GET    /api/malware                      # 全マルウェア取得
GET    /api/malware/:id                  # 特定マルウェア取得
GET    /api/malware/:id/campaigns        # マルウェアが使用されたキャンペーン
GET    /api/malware/:id/indicators       # マルウェア関連IoC
GET    /api/malware/families             # マルウェアファミリー一覧
POST   /api/malware                      # 新規マルウェア作成
PATCH  /api/malware/:id                  # マルウェア更新
DELETE /api/malware/:id                  # マルウェア削除
```

#### Indicators API

```
GET    /api/indicators                   # 全IoC取得
GET    /api/indicators/:id               # 特定IoC取得
GET    /api/indicators/search            # IoC検索（IP、ドメイン、ハッシュ）
POST   /api/indicators                   # 新規IoC作成
POST   /api/indicators/bulk              # IoC一括登録
PATCH  /api/indicators/:id               # IoC更新
DELETE /api/indicators/:id               # IoC削除
POST   /api/indicators/refresh           # 外部フィード（AbuseIPDB、OTX、URLhaus）から更新
```

#### Relationships API

```
GET    /api/relationships                # 全関係性取得
GET    /api/relationships/:id            # 特定関係性取得
POST   /api/relationships                # 新規関係性作成
DELETE /api/relationships/:id            # 関係性削除
GET    /api/relationships/graph          # グラフ全体取得（Neo4j風のJSON）
```

#### Analytics API

```
GET    /api/campaign-analytics/timeline        # キャンペーンのタイムライン
GET    /api/campaign-analytics/threat-actors   # 最も活発な脅威アクター
GET    /api/campaign-analytics/malware-trends  # マルウェアトレンド
GET    /api/campaign-analytics/targeted-sectors # 最も狙われるセクター
GET    /api/campaign-analytics/attack-techniques # 最も使用される攻撃手法
```

### 3.2 レスポンス形式例

#### Campaign詳細（関係性を含む）

```json
{
  "id": "campaign-apt29-2024",
  "name": "APT29 SolarWinds Supply Chain Attack",
  "aliases": ["SolarWindows Hack", "Sunburst Attack"],
  "description": "...",
  "firstSeen": "2020-03-01",
  "lastSeen": "2020-12-31",
  "objective": "espionage",
  "status": "inactive",
  "confidence": 95,
  "sophistication": "strategic",

  "relationships": {
    "attributedTo": [
      {
        "id": "threat-actor-apt29",
        "name": "APT29",
        "type": "nation-state",
        "confidence": 95
      }
    ],
    "uses": [
      {
        "type": "malware",
        "id": "malware-sunburst",
        "name": "Sunburst",
        "confidence": 100
      },
      {
        "type": "attack-technique",
        "id": "T1195.002",
        "name": "Compromise Software Supply Chain",
        "confidence": 100
      }
    ],
    "targets": [
      {
        "type": "vulnerability",
        "id": "CVE-2020-0688",
        "name": "Microsoft Exchange Server RCE",
        "confidence": 80
      }
    ],
    "indicators": [
      {
        "type": "domain",
        "value": "avsvmcloud.com",
        "threatType": "c2"
      }
    ]
  }
}
```

---

## 4. フロントエンド設計

### 4.1 画面構成

#### 1. キャンペーン一覧画面（`/campaigns`）

**機能:**
- 全キャンペーンの一覧表示
- フィルタリング（時期、ステータス、目的、脅威アクター）
- ソート（発見日、更新日、重要度）
- 検索（キャンペーン名、エイリアス、説明）

**表示項目:**
- キャンペーン名
- 発見日 / 最終確認日
- ステータス（活動中/非活動）
- 関連脅威アクター
- 使用されたマルウェア数
- 関連CVE数
- 目的（espionage、financial-gain等）

#### 2. キャンペーン詳細画面（`/campaigns/:id`）

**タブ構成:**

**a) 概要タブ**
- 基本情報（名前、エイリアス、説明、期間）
- 目的、洗練度、ステータス
- 関連脅威アクター
- 主要な指標（KPI）

**b) 関係グラフタブ**
- インタラクティブなグラフビュー（D3.js / React Flow / Cytoscape.js）
- ノード: Campaign、ThreatActor、Malware、AttackTechnique、CVE、Indicator
- エッジ: uses、attributed-to、targets、indicates
- ズーム、パン、ノードクリックで詳細表示

**c) マルウェアタブ**
- キャンペーンで使用されたマルウェア一覧
- マルウェアファミリー、タイプ、能力
- ファイルハッシュ、YARA署名

**d) IoC（Indicators）タブ**
- IP、ドメイン、URL、ファイルハッシュの一覧
- エクスポート機能（CSV、STIX、OpenIOC）
- SIEMへの連携ボタン

**e) 攻撃手法タブ**
- MITRE ATT&CKマトリクス統合
- 使用された戦術（Tactics）と技術（Techniques）
- 検知カバレッジ（EDR/SIEMでの検知状況）

**f) タイムラインタブ**
- キャンペーンの時系列イベント
- 主要な発見、更新、パッチリリース

#### 3. 脅威アクター一覧画面（`/threat-actors`）

**機能:**
- 全脅威アクター一覧
- フィルタリング（タイプ、国籍、動機）
- 活動状況（最近のキャンペーン、使用マルウェア）

#### 4. 脅威アクター詳細画面（`/threat-actors/:id`）

**タブ構成:**
- 概要（名前、エイリアス、タイプ、国籍、動機）
- 関与したキャンペーン一覧
- 使用ツール・マルウェア
- 攻撃手法（MITRE ATT&CK）
- ターゲット分析（業界、国）

#### 5. マルウェア一覧・詳細画面

**一覧:**
- マルウェアファミリー別表示
- タイプ別フィルタリング（Trojan、Ransomware、Backdoorなど）

**詳細:**
- 技術的特徴（アーキテクチャ、能力）
- ファイルハッシュ、YARA署名
- 使用されたキャンペーン
- バリアント関係（variant-of）

#### 6. IoC検索画面（既存のIocSearch統合）

**拡張機能:**
- Campaign、Malware、ThreatActorへのリンク
- STIX形式でのエクスポート
- 外部フィード連携（AbuseIPDB、OTX、VirusTotal）

#### 7. アナリティクスダッシュボード（`/campaign-analytics`）

**ウィジェット:**
- キャンペーンタイムライン（時系列チャート）
- 脅威アクター活動ヒートマップ
- 最も使用されるマルウェアTOP10
- 最も狙われる業界（円グラフ）
- 攻撃手法トレンド（MITRE ATT&CKヒートマップ）
- 国別脅威発生源（ワールドマップ）

### 4.2 コンポーネント構成

```
src/components/Campaigns/
  ├─ CampaignList.tsx              # キャンペーン一覧
  ├─ CampaignDetail.tsx            # キャンペーン詳細
  ├─ CampaignGraph.tsx             # 関係グラフ
  ├─ CampaignTimeline.tsx          # タイムライン
  └─ CampaignFilters.tsx           # フィルタリングUI

src/components/ThreatActors/
  ├─ ThreatActorList.tsx
  ├─ ThreatActorDetail.tsx
  └─ ThreatActorCard.tsx

src/components/Malware/
  ├─ MalwareList.tsx
  ├─ MalwareDetail.tsx
  └─ MalwareFamilyTree.tsx         # ファミリー関係の可視化

src/components/Indicators/
  ├─ IndicatorSearch.tsx           # IoC検索
  ├─ IndicatorList.tsx
  └─ IndicatorExport.tsx           # STIX/CSV/OpenIOCエクスポート

src/components/CampaignAnalytics/
  ├─ CampaignAnalyticsDashboard.tsx
  ├─ ThreatActorHeatmap.tsx
  ├─ MalwareTrends.tsx
  └─ AttackTechniqueMatrix.tsx
```

---

## 5. 外部フィード統合設計

### 5.1 対応フィード

#### 優先度: 高（Phase 1）
1. **AlienVault OTX (Open Threat Exchange)**
   - API: REST
   - データ: Campaigns、ThreatActors、Malware、Indicators
   - 更新頻度: 1時間ごと

2. **Abuse.ch (URLhaus, MalwareBazaar)**
   - API: REST + CSV
   - データ: Malware、Indicators（URL、ファイルハッシュ）
   - 更新頻度: 1時間ごと

3. **MISP（コミュニティインスタンス）**
   - プロトコル: TAXII 2.1 / REST
   - データ: 全エンティティタイプ
   - 更新頻度: 6時間ごと

#### 優先度: 中（Phase 2）
4. **CISA AIS（Automated Indicator Sharing）**
   - プロトコル: TAXII 2.1
   - データ: Indicators、Campaigns
   - 更新頻度: 1日1回

5. **IBM X-Force Exchange**
   - API: REST
   - データ: ThreatActors、Campaigns、Indicators
   - 更新頻度: 6時間ごと

#### 優先度: 低（Phase 3 - 商用）
6. **Recorded Future**
7. **Anomali ThreatStream**

### 5.2 フィード処理アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│ External Feeds                                  │
├─────────────────────────────────────────────────┤
│ OTX │ URLhaus │ MISP │ CISA AIS │ X-Force      │
└──┬───────┬────────┬─────────┬──────────┬────────┘
   │       │        │         │          │
   v       v        v         v          v
┌─────────────────────────────────────────────────┐
│ Feed Fetchers (server/services/fetchers/)      │
├─────────────────────────────────────────────────┤
│ - otxFetcher.ts                                 │
│ - urlhausFetcher.ts                             │
│ - mispFetcher.ts                                │
│ - taxiiClient.ts (共通TAXII 2.1クライアント)   │
└──────────────────┬──────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────┐
│ STIX Parser / Normalizer                       │
├─────────────────────────────────────────────────┤
│ - stixParser.ts                                 │
│ - Convert external formats to STIX 2.1         │
│ - Map to internal Prisma models                │
└──────────────────┬──────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────┐
│ Deduplication & Enrichment                     │
├─────────────────────────────────────────────────┤
│ - Merge duplicate entities                     │
│ - Enrich with VirusTotal, Shodan, etc.         │
│ - Calculate confidence scores                  │
└──────────────────┬──────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────┐
│ Prisma Database (SQLite)                       │
├─────────────────────────────────────────────────┤
│ Campaign, ThreatActor, Malware, Indicator,     │
│ CampaignRelationship                           │
└─────────────────────────────────────────────────┘
```

### 5.3 スケジューラー（node-cron）

```typescript
// server/services/scheduler/campaignScheduler.ts

import cron from 'node-cron'
import { syncOTX } from '../fetchers/otxFetcher'
import { syncURLhaus } from '../fetchers/urlhausFetcher'
import { syncMISP } from '../fetchers/mispFetcher'

// 1時間ごと: OTX、URLhaus
cron.schedule('0 * * * *', async () => {
  console.log('[Scheduler] Syncing OTX and URLhaus...')
  await syncOTX()
  await syncURLhaus()
})

// 6時間ごと: MISP
cron.schedule('0 */6 * * *', async () => {
  console.log('[Scheduler] Syncing MISP...')
  await syncMISP()
})

// 1日1回: 統計再計算
cron.schedule('0 3 * * *', async () => {
  console.log('[Scheduler] Recalculating campaign statistics...')
  // Update campaign counts, threat actor activity, etc.
})
```

---

## 6. 既存機能との統合

### 6.1 MITRE ATT&CK統合

**既存モデル:**
- `AttackTechnique`
- `AttackTactic`
- `CveAttackMapping`

**統合ポイント:**
- `CampaignRelationship`を使用して、Campaignと`AttackTechnique`を関連付け
- `ThreatActor`と`AttackTechnique`の関連付け
- `Malware`と`AttackTechnique`の関連付け

**例:**
```typescript
// Campaign "APT29 SolarWinds" uses AttackTechnique "T1195.002"
CampaignRelationship.create({
  sourceType: 'campaign',
  sourceId: 'campaign-apt29-2024',
  targetType: 'attack-technique',
  targetId: 'T1195.002',
  relationshipType: 'uses',
  confidence: 100
})
```

### 6.2 CVEデータ統合

**既存モデル:**
- `NvdCve`
- `CisaKev`
- `JvnVulnerability`

**統合ポイント:**
- `CampaignRelationship`を使用して、CampaignとCVEを関連付け
- `vulnerabilityId`として`cveId`を使用

**例:**
```typescript
// Campaign targets CVE-2021-44228 (Log4Shell)
CampaignRelationship.create({
  sourceType: 'campaign',
  sourceId: 'campaign-log4shell-2021',
  targetType: 'vulnerability',
  targetId: 'CVE-2021-44228',
  relationshipType: 'targets',
  confidence: 100
})
```

---

## 7. 開発計画とマイルストーン

### Phase 1: 基盤構築（2-3週間）

**Week 1-2: データモデルとバックエンドAPI**
1. ✅ Prismaスキーマ追加（Campaign、ThreatActor、Malware、Indicator、CampaignRelationship、TargetSector）
2. ✅ データベースマイグレーション
3. ✅ データベースサービス層（server/services/database/campaignDb.ts、threatActorDb.ts等）
4. ✅ RESTful APIエンドポイント実装
   - /api/campaigns
   - /api/threat-actors
   - /api/malware
   - /api/indicators
   - /api/relationships
5. ✅ 基本的なCRUD操作のテスト

**Week 2-3: フロントエンド基本UI**
1. ✅ React Queryフック作成（useCampaigns、useThreatActors等）
2. ✅ キャンペーン一覧画面（CampaignList.tsx）
3. ✅ キャンペーン詳細画面（CampaignDetail.tsx）- 概要タブ
4. ✅ 脅威アクター一覧・詳細画面
5. ✅ マルウェア一覧・詳細画面
6. ✅ ルーティング設定（App.tsx）

### Phase 2: 外部フィード統合（2-3週間）

**Week 3-4: フィード実装**
1. ✅ STIX 2.1パーサー（server/services/parsers/stixParser.ts）
2. ✅ AlienVault OTX連携（server/services/fetchers/otxFetcher.ts）
3. ✅ URLhaus連携（server/services/fetchers/urlhausFetcher.ts）
4. ✅ 重複排除ロジック
5. ✅ スケジューラー設定（server/services/scheduler/campaignScheduler.ts）

**Week 5: 手動インポート機能**
1. ✅ STIX 2.1ファイルのアップロード機能
2. ✅ CSV/JSONインポート機能
3. ✅ バリデーション

### Phase 3: 可視化とアナリティクス（2-3週間）

**Week 6-7: グラフビュー**
1. ✅ ライブラリ選定（React Flow / Cytoscape.js / D3.js）
2. ✅ 関係グラフコンポーネント（CampaignGraph.tsx）
3. ✅ グラフデータAPI（GET /api/campaigns/:id/graph）
4. ✅ インタラクティブ操作（ズーム、パン、ノードクリック）

**Week 7-8: アナリティクスダッシュボード**
1. ✅ キャンペーンタイムライン
2. ✅ 脅威アクターヒートマップ
3. ✅ マルウェアトレンドチャート
4. ✅ ターゲット業界分析
5. ✅ MITRE ATT&CKカバレッジマトリクス

### Phase 4: 高度な機能（2週間）

**Week 9-10:**
1. ✅ エクスポート機能（STIX、CSV、JSON）
2. ✅ SIEM連携（Splunk、ElasticSecurity）用のWebhook/API
3. ✅ 通知機能（新しいキャンペーン、高信頼度IoC検出時）
4. ✅ ユーザー設定（監視対象業界、脅威アクターのウォッチリスト）
5. ✅ E2Eテスト（Playwright）

### Phase 5: 本番準備とドキュメント（1週間）

**Week 11:**
1. ✅ パフォーマンス最適化（データベースインデックス、クエリ最適化）
2. ✅ セキュリティ監査
3. ✅ ユーザーガイド作成
4. ✅ API仕様書（OpenAPI/Swagger）
5. ✅ デプロイ手順書

---

## 8. 技術スタック

### 既存スタック（維持）
- **バックエンド:** Node.js + Express.js + TypeScript
- **データベース:** SQLite + Prisma ORM
- **フロントエンド:** React 18 + TypeScript
- **状態管理:** React Query + Zustand
- **スタイリング:** Tailwind CSS
- **ビルドツール:** Vite

### 新規追加
- **グラフ可視化:** React Flow または Cytoscape.js
- **STIX処理:** `stix2` (npm package) または自作パーサー
- **TAXII Client:** `taxii2-client` または自作（fetch API）
- **外部API:** AlienVault OTX SDK、Abuse.ch API

---

## 9. セキュリティ考慮事項

### 9.1 データ検証
- 外部フィードからのデータは信頼度（confidence）スコアを付与
- 低信頼度（<30）のデータは自動削除または警告表示

### 9.2 APIキー管理
- `.env`ファイルで環境変数管理
- 本番環境ではシークレット管理サービス使用推奨

### 9.3 アクセス制御
- 将来的には認証・認可機能の追加
- APIエンドポイントへのレート制限

### 9.4 IoC検証
- IoC（IP、ドメイン、ハッシュ）の形式バリデーション
- 誤検知防止のためのホワイトリスト機能

---

## 10. パフォーマンス最適化

### 10.1 データベース
- 適切なインデックス設定
- N+1クエリ問題の回避（Prisma `include`の最適化）
- グラフクエリの事前計算とキャッシュ

### 10.2 フロントエンド
- React.lazy()による遅延ロード
- React Queryのキャッシュ戦略
- 仮想化リスト（react-window）で大量データ表示

### 10.3 API
- ページネーション（limit/offset）
- レスポンスのgzip圧縮

---

## 11. 今後の拡張

### 11.1 機械学習統合
- 類似キャンペーンの自動検出
- IoC信頼度の自動調整
- 脅威予測モデル

### 11.2 コラボレーション機能
- アナリスト間のコメント・ノート共有
- キャンペーンのタグ付け・フォロー機能

### 11.3 高度なグラフ分析
- Neo4jへの移行（グラフデータベース）
- 中心性分析（どの脅威アクターが最も影響力があるか）
- 最短パス分析（Malware → ThreatActor → Campaign）

### 11.4 自動レポート生成
- 週次/月次の脅威インテリジェンスレポート（PDF/DOCX）
- エグゼクティブサマリー自動生成

---

## 12. 参考資料

- [STIX 2.1 Specification](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html)
- [TAXII 2.1 Specification](https://docs.oasis-open.org/cti/taxii/v2.1/taxii-v2.1.html)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [OpenCTI Documentation](https://docs.opencti.io/)
- [MISP Documentation](https://www.misp-project.org/documentation/)
- [AlienVault OTX API](https://otx.alienvault.com/api)
- [Abuse.ch API](https://abuse.ch/)

---

## 付録A: データモデルのSTIX 2.1マッピング

| Prismaモデル | STIX 2.1 SDO/SCO/SRO |
|--------------|----------------------|
| Campaign | Campaign (SDO) |
| ThreatActor | Threat Actor (SDO) |
| Malware | Malware (SDO) |
| AttackTechnique | Attack Pattern (SDO) |
| NvdCve, CisaKev | Vulnerability (SDO) |
| Indicator | Indicator (SDO) |
| CampaignRelationship | Relationship (SRO) |

**SDO**: STIX Domain Object
**SCO**: STIX Cyber-observable Object
**SRO**: STIX Relationship Object

---

## 付録B: サンプルデータ

### Campaign例: Log4Shell攻撃キャンペーン

```json
{
  "campaignId": "campaign-log4shell-2021",
  "name": "Log4Shell Exploitation Campaign",
  "aliases": ["Log4j RCE Campaign", "CVE-2021-44228 Campaign"],
  "description": "Widespread exploitation of Apache Log4j vulnerability (CVE-2021-44228) by multiple threat actors for cryptocurrency mining, ransomware deployment, and backdoor installation.",
  "firstSeen": "2021-12-09",
  "lastSeen": "2022-06-30",
  "objective": "financial-gain",
  "confidence": 100,
  "sophistication": "intermediate",
  "status": "inactive"
}
```

### ThreatActor例: APT29

```json
{
  "actorId": "threat-actor-apt29",
  "name": "APT29",
  "aliases": ["Cozy Bear", "The Dukes", "Nobelium"],
  "description": "Russian state-sponsored threat actor...",
  "actorType": "nation-state",
  "sophistication": "strategic",
  "resourceLevel": "government",
  "primaryMotivation": "espionage",
  "origin": "RU",
  "firstSeen": "2008-01-01",
  "targetedSectors": ["government", "think-tanks", "healthcare"],
  "targetedCountries": ["US", "GB", "DE"]
}
```

### Malware例: Emotet

```json
{
  "malwareId": "malware-emotet",
  "name": "Emotet",
  "aliases": ["Heodo", "Mealybug"],
  "description": "Emotet is a modular banking trojan that has been used as a dropper for other malware families...",
  "malwareTypes": ["trojan", "loader", "banking-trojan"],
  "malwareFamily": "Emotet Family",
  "capabilities": ["steals-credentials", "email-spam", "drops-additional-malware"],
  "firstSeen": "2014-06-01"
}
```

### Relationship例

```json
{
  "sourceType": "campaign",
  "sourceId": "campaign-apt29-2024",
  "targetType": "threat-actor",
  "targetId": "threat-actor-apt29",
  "relationshipType": "attributed-to",
  "confidence": 95,
  "description": "High confidence attribution based on TTPs and infrastructure overlap."
}
```

---

**ドキュメント作成日:** 2026-11-21
**最終更新日:** 2026-11-21
**バージョン:** 1.0
