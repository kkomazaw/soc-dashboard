# 重大キャンペーンサービス - 実装ロードマップ

## プロジェクト概要

**プロジェクト名:** Campaign Analysis Platform
**目的:** STIX 2.1準拠の脅威インテリジェンスプラットフォーム構築
**期間:** 11週間（約2.5ヶ月）
**開発者:** 1-2名想定

---

## Phase 1: 基盤構築（Week 1-3）

### Week 1: データモデルとマイグレーション

#### タスク1.1: Prismaスキーマ拡張
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - `prisma/schema.prisma`に以下のモデルを追加:
    - Campaign
    - ThreatActor
    - Malware
    - Indicator
    - CampaignRelationship
    - TargetSector
  - インデックス設定（パフォーマンス最適化）
  - リレーション定義（外部キーは使用せず、IDベースで管理）

**成果物:**
```bash
prisma/schema.prisma (更新済み)
```

**検証:**
```bash
npx prisma format
npx prisma validate
```

#### タスク1.2: データベースマイグレーション
- **所要時間:** 2時間
- **担当:** バックエンド
- **詳細:**
  ```bash
  npx prisma migrate dev --name add_campaign_models
  npx prisma generate
  ```

**成果物:**
```
prisma/migrations/YYYYMMDDHHMMSS_add_campaign_models/migration.sql
```

#### タスク1.3: データベースサービス層実装
- **所要時間:** 12時間
- **担当:** バックエンド
- **詳細:**
  - `server/services/database/campaignDb.ts`
  - `server/services/database/threatActorDb.ts`
  - `server/services/database/malwareDb.ts`
  - `server/services/database/indicatorDb.ts`
  - `server/services/database/relationshipDb.ts`

  各ファイルに実装する関数:
  - `getAll()` - 全件取得
  - `getById(id)` - ID指定取得
  - `create(data)` - 新規作成
  - `update(id, data)` - 更新
  - `delete(id)` - 削除
  - `search(query)` - 検索
  - 各種フィルタリング関数

**成果物:**
```typescript
// server/services/database/campaignDb.ts
export const getAllCampaigns = async () => { ... }
export const getCampaignById = async (id: string) => { ... }
export const createCampaign = async (data: CampaignInput) => { ... }
export const updateCampaign = async (id: string, data: Partial<CampaignInput>) => { ... }
export const deleteCampaign = async (id: string) => { ... }
export const getCampaignsBySophistication = async (sophistication: string) => { ... }
export const getCampaignsByStatus = async (status: string) => { ... }
export const getCampaignStats = async () => { ... }
```

---

### Week 2: RESTful API実装

#### タスク2.1: コントローラー実装
- **所要時間:** 16時間
- **担当:** バックエンド
- **詳細:**
  - `server/controllers/campaignController.ts`
  - `server/controllers/threatActorController.ts`
  - `server/controllers/malwareController.ts`
  - `server/controllers/indicatorController.ts`
  - `server/controllers/relationshipController.ts`

**主要エンドポイント:**
```typescript
// server/controllers/campaignController.ts
export const getCampaigns = async (req: Request, res: Response) => { ... }
export const getCampaign = async (req: Request, res: Response) => { ... }
export const getCampaignGraph = async (req: Request, res: Response) => { ... }
export const createCampaign = async (req: Request, res: Response) => { ... }
export const updateCampaign = async (req: Request, res: Response) => { ... }
export const deleteCampaign = async (req: Request, res: Response) => { ... }
export const getCampaignStats = async (req: Request, res: Response) => { ... }
```

#### タスク2.2: ルーティング設定
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - `server/routes/campaigns.ts`
  - `server/routes/threatActors.ts`
  - `server/routes/malware.ts`
  - `server/routes/indicators.ts`
  - `server/routes/relationships.ts`

**成果物:**
```typescript
// server/routes/campaigns.ts
import { Router } from 'express'
import {
  getCampaigns,
  getCampaign,
  getCampaignGraph,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
} from '../controllers/campaignController'

const router = Router()

router.get('/', getCampaigns)
router.get('/stats', getCampaignStats)
router.get('/:id', getCampaign)
router.get('/:id/graph', getCampaignGraph)
router.post('/', createCampaign)
router.patch('/:id', updateCampaign)
router.delete('/:id', deleteCampaign)

export default router
```

#### タスク2.3: server/index.ts統合
- **所要時間:** 2時間
- **担当:** バックエンド
- **詳細:**
  ```typescript
  // server/index.ts
  import campaignRoutes from './routes/campaigns'
  import threatActorRoutes from './routes/threatActors'
  import malwareRoutes from './routes/malware'
  import indicatorRoutes from './routes/indicators'
  import relationshipRoutes from './routes/relationships'

  app.use('/api/campaigns', campaignRoutes)
  app.use('/api/threat-actors', threatActorRoutes)
  app.use('/api/malware', malwareRoutes)
  app.use('/api/indicators', indicatorRoutes)
  app.use('/api/relationships', relationshipRoutes)
  ```

#### タスク2.4: APIテスト（Postman/curl）
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - 各エンドポイントの動作確認
  - レスポンス形式の検証
  - エラーハンドリングの確認

---

### Week 3: フロントエンド基本UI

#### タスク3.1: TypeScript型定義
- **所要時間:** 2時間
- **担当:** フロントエンド
- **詳細:**
  - `src/types/campaign.ts`
  - `src/types/threatActor.ts`
  - `src/types/malware.ts`
  - `src/types/indicator.ts`

**成果物:**
```typescript
// src/types/campaign.ts
export interface Campaign {
  id: string
  campaignId: string
  name: string
  aliases?: string[]
  description: string
  firstSeen: string
  lastSeen?: string
  objective?: string
  confidence: number
  sophistication?: string
  status: string
  source: string
  sourceUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CampaignWithRelationships extends Campaign {
  relationships: {
    attributedTo: ThreatActor[]
    uses: (Malware | AttackTechnique)[]
    targets: Vulnerability[]
    indicators: Indicator[]
  }
}
```

#### タスク3.2: API Client実装
- **所要時間:** 4時間
- **担当:** フロントエンド
- **詳細:**
  - `src/services/api/campaignsApi.ts`
  - `src/services/api/threatActorsApi.ts`
  - `src/services/api/malwareApi.ts`
  - `src/services/api/indicatorsApi.ts`

**成果物:**
```typescript
// src/services/api/campaignsApi.ts
import axios from 'axios'
import type { Campaign, CampaignWithRelationships } from '@/types/campaign'

const API_BASE = '/api/campaigns'

export const fetchCampaigns = async (): Promise<Campaign[]> => {
  const { data } = await axios.get(API_BASE)
  return data
}

export const fetchCampaignById = async (id: string): Promise<CampaignWithRelationships> => {
  const { data } = await axios.get(`${API_BASE}/${id}`)
  return data
}

export const fetchCampaignGraph = async (id: string) => {
  const { data } = await axios.get(`${API_BASE}/${id}/graph`)
  return data
}

export const createCampaign = async (campaign: Partial<Campaign>): Promise<Campaign> => {
  const { data } = await axios.post(API_BASE, campaign)
  return data
}
```

#### タスク3.3: React Queryフック
- **所要時間:** 3時間
- **担当:** フロントエンド
- **詳細:**
  - `src/hooks/useCampaigns.ts`
  - `src/hooks/useThreatActors.ts`
  - `src/hooks/useMalware.ts`
  - `src/hooks/useIndicators.ts`

**成果物:**
```typescript
// src/hooks/useCampaigns.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampaigns, fetchCampaignById, createCampaign, updateCampaign, deleteCampaign } from '@/services/api/campaignsApi'

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  })
}

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchCampaignById(id),
    enabled: !!id,
  })
}

export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
```

#### タスク3.4: キャンペーン一覧画面
- **所要時間:** 8時間
- **担当:** フロントエンド
- **詳細:**
  - `src/components/Campaigns/CampaignList.tsx`
  - `src/components/Campaigns/CampaignCard.tsx`
  - `src/components/Campaigns/CampaignFilters.tsx`

**機能:**
- キャンペーン一覧表示（カード形式）
- フィルタリング（ステータス、目的、洗練度）
- ソート（発見日、更新日、名前）
- 検索（名前、エイリアス、説明）
- ページネーション

#### タスク3.5: キャンペーン詳細画面（概要タブ）
- **所要時間:** 6時間
- **担当:** フロントエンド
- **詳細:**
  - `src/components/Campaigns/CampaignDetail.tsx`
  - タブ構成（概要、グラフ、マルウェア、IoC、攻撃手法、タイムライン）
  - 概要タブのみ実装（他のタブは後続フェーズ）

#### タスク3.6: 脅威アクター・マルウェア一覧・詳細画面
- **所要時間:** 10時間
- **担当:** フロントエンド
- **詳細:**
  - `src/components/ThreatActors/ThreatActorList.tsx`
  - `src/components/ThreatActors/ThreatActorDetail.tsx`
  - `src/components/Malware/MalwareList.tsx`
  - `src/components/Malware/MalwareDetail.tsx`

#### タスク3.7: ルーティング設定
- **所要時間:** 2時間
- **担当:** フロントエンド
- **詳細:**
  - `src/App.tsx`にルート追加
  - `src/components/layout/Sidebar.tsx`にメニュー項目追加

**成果物:**
```tsx
// src/App.tsx
const CampaignList = lazy(() => import('./components/Campaigns/CampaignList'))
const CampaignDetail = lazy(() => import('./components/Campaigns/CampaignDetail'))
const ThreatActorList = lazy(() => import('./components/ThreatActors/ThreatActorList'))
const MalwareList = lazy(() => import('./components/Malware/MalwareList'))

function AppContent() {
  const [currentView, setCurrentView] = useState('overview')

  const renderView = () => {
    switch (currentView) {
      // ... 既存のcase
      case 'campaigns':
        return <CampaignList onViewChange={setCurrentView} />
      case 'campaign-detail':
        return <CampaignDetail />
      case 'threat-actors':
        return <ThreatActorList />
      case 'malware':
        return <MalwareList />
      // ...
    }
  }
}
```

**Week 1-3 完了時の成果:**
- ✅ 完全なデータモデル
- ✅ 動作するRESTful API（CRUD操作）
- ✅ 基本的なフロントエンドUI（一覧・詳細画面）
- ✅ データの手動入力が可能

---

## Phase 2: 外部フィード統合（Week 4-5）

### Week 4: STIX 2.1パーサーとAlienVault OTX連携

#### タスク4.1: STIX 2.1パーサー実装
- **所要時間:** 12時間
- **担当:** バックエンド
- **詳細:**
  - `server/services/parsers/stixParser.ts`
  - STIX 2.1 JSONからPrismaモデルへの変換
  - エンティティタイプのマッピング
  - Relationshipの解析

**主要関数:**
```typescript
// server/services/parsers/stixParser.ts
export interface StixBundle {
  type: 'bundle'
  id: string
  objects: StixObject[]
}

export type StixObject =
  | StixCampaign
  | StixThreatActor
  | StixMalware
  | StixIndicator
  | StixRelationship
  | StixAttackPattern
  | StixVulnerability

export const parseStixBundle = async (bundle: StixBundle) => {
  // 1. エンティティを抽出
  const campaigns = bundle.objects.filter(obj => obj.type === 'campaign')
  const threatActors = bundle.objects.filter(obj => obj.type === 'threat-actor')
  const malware = bundle.objects.filter(obj => obj.type === 'malware')
  const indicators = bundle.objects.filter(obj => obj.type === 'indicator')
  const relationships = bundle.objects.filter(obj => obj.type === 'relationship')

  // 2. 各エンティティをPrismaモデルに変換してDB保存
  for (const campaign of campaigns) {
    await upsertCampaignFromStix(campaign)
  }

  // 3. Relationshipを保存
  for (const rel of relationships) {
    await upsertRelationshipFromStix(rel)
  }
}

export const upsertCampaignFromStix = async (stixCampaign: StixCampaign) => {
  const campaignData = {
    campaignId: stixCampaign.id,
    name: stixCampaign.name,
    aliases: JSON.stringify(stixCampaign.aliases || []),
    description: stixCampaign.description,
    firstSeen: new Date(stixCampaign.first_seen),
    lastSeen: stixCampaign.last_seen ? new Date(stixCampaign.last_seen) : null,
    objective: stixCampaign.objective,
    confidence: stixCampaign.confidence || 50,
    source: 'stix',
    metadata: JSON.stringify(stixCampaign),
  }

  return await prisma.campaign.upsert({
    where: { campaignId: stixCampaign.id },
    update: campaignData,
    create: campaignData,
  })
}
```

#### タスク4.2: AlienVault OTX連携
- **所要時間:** 10時間
- **担当:** バックエンド
- **詳細:**
  - `server/services/fetchers/otxFetcher.ts`
  - OTX APIキー設定（.env）
  - Pulses取得
  - IndicatorsとCampaignsの抽出
  - STIXパーサーへの橋渡し

**OTX API例:**
```typescript
// server/services/fetchers/otxFetcher.ts
import axios from 'axios'
import { parseStixBundle } from '../parsers/stixParser'

const OTX_API_BASE = 'https://otx.alienvault.com/api/v1'
const OTX_API_KEY = process.env.OTX_API_KEY

export const syncOTX = async () => {
  console.log('[OTX] Fetching subscribed pulses...')

  const response = await axios.get(`${OTX_API_BASE}/pulses/subscribed`, {
    headers: { 'X-OTX-API-KEY': OTX_API_KEY },
    params: { limit: 50, modified_since: getLastSyncTime() },
  })

  const pulses = response.data.results

  for (const pulse of pulses) {
    // Pulseを簡易的なSTIX形式に変換
    const stixBundle = convertOtxPulseToStix(pulse)
    await parseStixBundle(stixBundle)
  }

  updateLastSyncTime()
  console.log(`[OTX] Synced ${pulses.length} pulses`)
}

const convertOtxPulseToStix = (pulse: any): StixBundle => {
  const objects: StixObject[] = []

  // Campaignオブジェクト作成
  const campaign: StixCampaign = {
    type: 'campaign',
    id: `campaign--${pulse.id}`,
    name: pulse.name,
    description: pulse.description,
    first_seen: pulse.created,
    last_seen: pulse.modified,
    objective: pulse.tags?.includes('espionage') ? 'espionage' : undefined,
  }
  objects.push(campaign)

  // Indicatorオブジェクト作成
  for (const indicator of pulse.indicators) {
    const stixIndicator: StixIndicator = {
      type: 'indicator',
      id: `indicator--${indicator.id}`,
      pattern: `[${indicator.type}:value = '${indicator.indicator}']`,
      pattern_type: 'stix',
      valid_from: pulse.created,
      indicator_types: [indicator.type],
    }
    objects.push(stixIndicator)

    // Relationship: Indicator indicates Campaign
    objects.push({
      type: 'relationship',
      id: `relationship--${indicator.id}`,
      source_ref: stixIndicator.id,
      target_ref: campaign.id,
      relationship_type: 'indicates',
    })
  }

  return { type: 'bundle', id: `bundle--${pulse.id}`, objects }
}
```

**環境変数:**
```bash
# .env
OTX_API_KEY=your_otx_api_key_here
```

#### タスク4.3: URLhaus連携
- **所要時間:** 6時間
- **担当:** バックエンド
- **詳細:**
  - `server/services/fetchers/urlhausFetcher.ts`
  - URLhaus CSV APIから悪性URL取得
  - Indicator（URL、ドメイン）として保存
  - Malwareタグがあればマルウェアエンティティ作成

**URLhaus API例:**
```typescript
// server/services/fetchers/urlhausFetcher.ts
import axios from 'axios'
import Papa from 'papaparse'

const URLHAUS_CSV_URL = 'https://urlhaus.abuse.ch/downloads/csv_recent/'

export const syncURLhaus = async () => {
  console.log('[URLhaus] Fetching recent malicious URLs...')

  const response = await axios.get(URLHAUS_CSV_URL)
  const csvData = response.data

  const parsed = Papa.parse<URLhausRow>(csvData, {
    header: true,
    skipEmptyLines: true,
    comments: '#',
  })

  for (const row of parsed.data) {
    if (!row.url) continue

    // Indicatorとして保存
    await prisma.indicator.upsert({
      where: { indicatorId: `indicator-url-${row.id}` },
      update: {
        value: row.url,
        indicatorType: 'url',
        threatType: row.threat || 'malware',
        source: 'urlhaus',
        validFrom: new Date(row.dateadded),
      },
      create: {
        indicatorId: `indicator-url-${row.id}`,
        value: row.url,
        indicatorType: 'url',
        threatType: row.threat || 'malware',
        source: 'urlhaus',
        validFrom: new Date(row.dateadded),
      },
    })

    // Malware情報があれば保存
    if (row.malware_family) {
      const malwareId = `malware-${row.malware_family.toLowerCase()}`
      await prisma.malware.upsert({
        where: { malwareId },
        update: { name: row.malware_family },
        create: {
          malwareId,
          name: row.malware_family,
          malwareTypes: JSON.stringify(['malware']),
          source: 'urlhaus',
        },
      })

      // Relationship: Indicator indicates Malware
      await prisma.campaignRelationship.create({
        data: {
          sourceType: 'indicator',
          sourceId: `indicator-url-${row.id}`,
          targetType: 'malware',
          targetId: malwareId,
          relationshipType: 'indicates',
          source: 'urlhaus',
        },
      })
    }
  }

  console.log(`[URLhaus] Synced ${parsed.data.length} indicators`)
}
```

---

### Week 5: スケジューラーと重複排除

#### タスク5.1: スケジューラー実装
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - `server/services/scheduler/campaignScheduler.ts`
  - node-cronを使用したスケジュール設定
  - OTX、URLhausの定期同期

**成果物:**
```typescript
// server/services/scheduler/campaignScheduler.ts
import cron from 'node-cron'
import { syncOTX } from '../fetchers/otxFetcher'
import { syncURLhaus } from '../fetchers/urlhausFetcher'

export const startCampaignScheduler = () => {
  // 1時間ごと: OTX、URLhaus
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Starting hourly sync...')
    try {
      await syncOTX()
      await syncURLhaus()
    } catch (error) {
      console.error('[Scheduler] Error during sync:', error)
    }
  })

  // 1日1回: 統計再計算
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Recalculating statistics...')
    // TODO: Implement statistics calculation
  })

  console.log('[Scheduler] Campaign scheduler started')
}
```

```typescript
// server/index.ts
import { startCampaignScheduler } from './services/scheduler/campaignScheduler'

// ... Express setup

// Start scheduler
startCampaignScheduler()
```

#### タスク5.2: 重複排除ロジック
- **所要時間:** 8時間
- **担当:** バックエンド
- **詳細:**
  - 同一キャンペーンの検出（名前、エイリアス、期間の類似性）
  - 信頼度スコアに基づくマージ
  - ユーザー確認が必要な重複候補の抽出

**重複検出例:**
```typescript
// server/services/deduplication/campaignDeduplicator.ts
export const findDuplicateCampaigns = async (campaign: Campaign): Promise<Campaign[]> => {
  // 1. 名前の完全一致
  const exactMatches = await prisma.campaign.findMany({
    where: { name: campaign.name },
  })

  // 2. エイリアスの部分一致
  const aliases = JSON.parse(campaign.aliases || '[]')
  const aliasMatches = await prisma.campaign.findMany({
    where: {
      OR: aliases.map((alias: string) => ({
        aliases: { contains: alias },
      })),
    },
  })

  // 3. 期間の重複（first_seen〜last_seenが重なる）
  const timeOverlap = await prisma.campaign.findMany({
    where: {
      firstSeen: { lte: campaign.lastSeen || new Date() },
      lastSeen: { gte: campaign.firstSeen },
    },
  })

  // 重複スコア計算
  const candidates = [...exactMatches, ...aliasMatches, ...timeOverlap]
  const uniqueCandidates = Array.from(new Set(candidates.map(c => c.id)))
    .map(id => candidates.find(c => c.id === id)!)

  return uniqueCandidates.filter(c => c.campaignId !== campaign.campaignId)
}

export const mergeCampaigns = async (primaryId: string, duplicateIds: string[]) => {
  // 1. Relationshipを統合
  for (const dupId of duplicateIds) {
    await prisma.campaignRelationship.updateMany({
      where: { sourceId: dupId, sourceType: 'campaign' },
      data: { sourceId: primaryId },
    })
    await prisma.campaignRelationship.updateMany({
      where: { targetId: dupId, targetType: 'campaign' },
      data: { targetId: primaryId },
    })
  }

  // 2. 重複を削除
  await prisma.campaign.deleteMany({
    where: { campaignId: { in: duplicateIds } },
  })
}
```

#### タスク5.3: 手動インポート機能（STIX/CSV）
- **所要時間:** 6時間
- **担当:** バックエンド + フロントエンド
- **詳細:**
  - バックエンド: `POST /api/campaigns/import`エンドポイント
  - フロントエンド: ファイルアップロードUI

**成果物:**
```typescript
// server/controllers/campaignController.ts
export const importCampaigns = async (req: Request, res: Response) => {
  const { format, data } = req.body // format: 'stix' | 'csv'

  if (format === 'stix') {
    const bundle = JSON.parse(data)
    await parseStixBundle(bundle)
  } else if (format === 'csv') {
    // CSV parsing logic
  }

  res.json({ message: 'Import successful' })
}
```

**Week 4-5 完了時の成果:**
- ✅ STIX 2.1パーサー
- ✅ AlienVault OTX連携（自動同期）
- ✅ URLhaus連携（自動同期）
- ✅ スケジューラー（1時間ごとの自動更新）
- ✅ 重複排除ロジック
- ✅ 手動インポート機能

---

## Phase 3: 可視化とアナリティクス（Week 6-8）

### Week 6-7: グラフビュー実装

#### タスク6.1: グラフライブラリ選定と検証
- **所要時間:** 4時間
- **担当:** フロントエンド
- **候補:**
  1. **React Flow** - 推奨（シンプル、TypeScript対応、パフォーマンス良好）
  2. Cytoscape.js - 高機能だが学習コスト高
  3. D3.js - 完全カスタマイズ可能だが実装コスト大

**選定基準:**
- TypeScript対応
- インタラクティブ操作（ズーム、パン、ドラッグ）
- ノード/エッジのカスタマイズ性
- パフォーマンス（100ノード以上）

#### タスク6.2: グラフデータAPI実装
- **所要時間:** 6時間
- **担当:** バックエンド
- **詳細:**
  - `GET /api/campaigns/:id/graph`エンドポイント
  - React Flow形式のJSON生成

**成果物:**
```typescript
// server/controllers/campaignController.ts
export const getCampaignGraph = async (req: Request, res: Response) => {
  const { id } = req.params
  const campaign = await getCampaignById(id)

  // Relationshipsを取得
  const relationships = await prisma.campaignRelationship.findMany({
    where: {
      OR: [
        { sourceId: id, sourceType: 'campaign' },
        { targetId: id, targetType: 'campaign' },
      ],
    },
  })

  // ノード作成
  const nodes = [
    {
      id: campaign.campaignId,
      type: 'campaign',
      data: { label: campaign.name, ...campaign },
      position: { x: 0, y: 0 },
    },
  ]

  // 関連エンティティを取得してノード追加
  for (const rel of relationships) {
    const targetEntity = await getEntityById(rel.targetType, rel.targetId)
    nodes.push({
      id: rel.targetId,
      type: rel.targetType,
      data: { label: targetEntity.name, ...targetEntity },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    })
  }

  // エッジ作成
  const edges = relationships.map(rel => ({
    id: `${rel.sourceId}-${rel.targetId}`,
    source: rel.sourceId,
    target: rel.targetId,
    label: rel.relationshipType,
    animated: true,
  }))

  res.json({ nodes, edges })
}
```

#### タスク6.3: React Flowグラフコンポーネント
- **所要時間:** 12時間
- **担当:** フロントエンド
- **詳細:**
  - `src/components/Campaigns/CampaignGraph.tsx`
  - カスタムノード（Campaign、ThreatActor、Malware等）
  - インタラクティブ操作
  - レイアウトアルゴリズム（force-directed、hierarchical）

**成果物:**
```tsx
// src/components/Campaigns/CampaignGraph.tsx
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import { useCampaignGraph } from '@/hooks/useCampaigns'

export const CampaignGraph = ({ campaignId }: { campaignId: string }) => {
  const { data, isLoading } = useCampaignGraph(campaignId)

  if (isLoading) return <div>Loading graph...</div>

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        nodes={data.nodes}
        edges={data.edges}
        nodeTypes={customNodeTypes}
        fitView
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

// カスタムノード
const CampaignNode = ({ data }: any) => (
  <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
    <div className="font-bold">{data.label}</div>
    <div className="text-xs">{data.sophistication}</div>
  </div>
)

const customNodeTypes = {
  campaign: CampaignNode,
  'threat-actor': ThreatActorNode,
  malware: MalwareNode,
  indicator: IndicatorNode,
}
```

#### タスク6.4: グラフタブへの統合
- **所要時間:** 2時間
- **担当:** フロントエンド
- **詳細:**
  - `CampaignDetail.tsx`にグラフタブ追加
  - タブ切り替え実装

---

### Week 8: アナリティクスダッシュボード

#### タスク8.1: アナリティクスAPI実装
- **所要時間:** 8時間
- **担当:** バックエンド
- **詳細:**
  - `server/routes/campaignAnalytics.ts`
  - `server/controllers/campaignAnalyticsController.ts`

**エンドポイント:**
```typescript
GET /api/campaign-analytics/timeline        # キャンペーンタイムライン
GET /api/campaign-analytics/threat-actors   # 最も活発な脅威アクター
GET /api/campaign-analytics/malware-trends  # マルウェアトレンド
GET /api/campaign-analytics/targeted-sectors # 最も狙われるセクター
GET /api/campaign-analytics/attack-techniques # 最も使用される攻撃手法
```

**実装例:**
```typescript
// server/controllers/campaignAnalyticsController.ts
export const getCampaignTimeline = async (req: Request, res: Response) => {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { firstSeen: 'asc' },
  })

  // 月別集計
  const timeline = campaigns.reduce((acc, campaign) => {
    const month = campaign.firstSeen.toISOString().substring(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  res.json(timeline)
}

export const getTopThreatActors = async (req: Request, res: Response) => {
  const actors = await prisma.threatActor.findMany()

  // 各アクターが関与したキャンペーン数を集計
  const actorStats = await Promise.all(
    actors.map(async (actor) => {
      const campaignCount = await prisma.campaignRelationship.count({
        where: {
          sourceType: 'threat-actor',
          sourceId: actor.actorId,
          targetType: 'campaign',
          relationshipType: 'attributed-to',
        },
      })
      return { ...actor, campaignCount }
    })
  )

  // 降順ソート
  const sorted = actorStats.sort((a, b) => b.campaignCount - a.campaignCount)
  res.json(sorted.slice(0, 10))
}
```

#### タスク8.2: アナリティクスダッシュボードUI
- **所要時間:** 12時間
- **担当:** フロントエンド
- **詳細:**
  - `src/components/CampaignAnalytics/CampaignAnalyticsDashboard.tsx`
  - `src/components/CampaignAnalytics/CampaignTimelineChart.tsx`
  - `src/components/CampaignAnalytics/ThreatActorHeatmap.tsx`
  - `src/components/CampaignAnalytics/MalwareTrendsChart.tsx`
  - `src/components/CampaignAnalytics/TargetedSectorsChart.tsx`

**ウィジェット:**
1. キャンペーンタイムライン（recharts - LineChart）
2. 脅威アクター活動ヒートマップ（recharts - Treemap）
3. マルウェアTOP10（recharts - BarChart）
4. ターゲット業界（recharts - PieChart）
5. 攻撃手法マトリクス（カスタムヒートマップ）

**Week 6-8 完了時の成果:**
- ✅ インタラクティブなグラフビュー
- ✅ アナリティクスダッシュボード
- ✅ 多様なチャート（タイムライン、ヒートマップ、円グラフ等）

---

## Phase 4: 高度な機能（Week 9-10）

### Week 9: エクスポートとSIEM連携

#### タスク9.1: STIX 2.1エクスポート
- **所要時間:** 6時間
- **担当:** バックエンド
- **詳細:**
  - `GET /api/campaigns/:id/export/stix`
  - PrismaモデルからSTIX 2.1 JSONへの変換

**成果物:**
```typescript
// server/controllers/campaignController.ts
export const exportCampaignStix = async (req: Request, res: Response) => {
  const { id } = req.params
  const campaign = await getCampaignById(id)
  const relationships = await getCampaignRelationships(id)

  const stixBundle: StixBundle = {
    type: 'bundle',
    id: `bundle--${campaign.campaignId}`,
    objects: [
      convertCampaignToStix(campaign),
      ...relationships.map(convertRelationshipToStix),
    ],
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="${campaign.name}.json"`)
  res.json(stixBundle)
}
```

#### タスク9.2: CSV/JSONエクスポート
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - `GET /api/indicators/export/csv`
  - IoC一覧のCSVエクスポート
  - json2csvライブラリ使用

#### タスク9.3: SIEM連携Webhook
- **所要時間:** 6時間
- **担当:** バックエンド
- **詳細:**
  - 新しいCampaign/Indicator作成時にWebhook送信
  - Splunk、Elastic Security等への連携

**成果物:**
```typescript
// server/services/webhooks/siemWebhook.ts
export const sendToSiem = async (entity: Campaign | Indicator) => {
  const webhookUrl = process.env.SIEM_WEBHOOK_URL
  if (!webhookUrl) return

  await axios.post(webhookUrl, {
    event: 'new_campaign',
    data: entity,
    timestamp: new Date().toISOString(),
  })
}
```

---

### Week 10: 通知とユーザー設定

#### タスク10.1: 通知システム
- **所要時間:** 8時間
- **担当:** バックエンド + フロントエンド
- **詳細:**
  - 新しいキャンペーン検出時の通知
  - 高信頼度IoC検出時の通知
  - WebSocketまたはServer-Sent Events（SSE）

**成果物:**
```typescript
// server/services/notifications/notificationService.ts
import { EventEmitter } from 'events'

export const notificationEmitter = new EventEmitter()

export const notifyNewCampaign = (campaign: Campaign) => {
  notificationEmitter.emit('new-campaign', {
    type: 'new-campaign',
    title: `新しいキャンペーン: ${campaign.name}`,
    message: campaign.description,
    severity: campaign.sophistication === 'strategic' ? 'critical' : 'high',
    timestamp: new Date().toISOString(),
  })
}
```

```tsx
// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream')
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      setNotifications(prev => [notification, ...prev])
    }
    return () => eventSource.close()
  }, [])

  return { notifications }
}
```

#### タスク10.2: ユーザー設定画面
- **所要時間:** 6時間
- **担当:** フロントエンド
- **詳細:**
  - 監視対象業界の設定
  - 脅威アクターウォッチリスト
  - 通知設定（Email、ブラウザ通知）

#### タスク10.3: E2Eテスト
- **所要時間:** 8時間
- **担当:** フロントエンド
- **詳細:**
  - Playwrightでキャンペーン作成〜詳細表示フロー
  - グラフ操作のテスト
  - エクスポート機能のテスト

**成果物:**
```typescript
// tests/e2e/campaigns.spec.ts
import { test, expect } from '@playwright/test'

test('キャンペーン作成とグラフ表示', async ({ page }) => {
  await page.goto('/campaigns')

  // キャンペーン作成
  await page.click('text=新規キャンペーン')
  await page.fill('input[name="name"]', 'Test Campaign')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.click('button:has-text("作成")')

  // 詳細画面へ遷移
  await page.click('text=Test Campaign')
  await expect(page.locator('h1')).toContainText('Test Campaign')

  // グラフタブ表示
  await page.click('text=関係グラフ')
  await expect(page.locator('.react-flow')).toBeVisible()
})
```

**Week 9-10 完了時の成果:**
- ✅ STIX/CSV/JSONエクスポート
- ✅ SIEM連携（Webhook）
- ✅ リアルタイム通知
- ✅ ユーザー設定画面
- ✅ E2Eテスト

---

## Phase 5: 本番準備（Week 11）

### Week 11: 最適化とドキュメント

#### タスク11.1: パフォーマンス最適化
- **所要時間:** 8時間
- **担当:** バックエンド + フロントエンド
- **詳細:**
  - データベースクエリの最適化（N+1問題解消）
  - インデックス追加
  - React Queryのキャッシュ設定見直し
  - 大量データでの動作確認（1000+ campaigns）

**最適化項目:**
```sql
-- インデックス追加例
CREATE INDEX idx_campaign_relationships_composite
ON campaign_relationships(source_type, source_id, target_type);

CREATE INDEX idx_indicators_value
ON indicators(value);
```

#### タスク11.2: セキュリティ監査
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - SQLインジェクション対策確認
  - XSS対策確認
  - APIキー漏洩チェック
  - レート制限設定

#### タスク11.3: ユーザーガイド作成
- **所要時間:** 6時間
- **担当:** 全員
- **詳細:**
  - `docs/campaign-user-guide.md`作成
  - スクリーンショット付き操作手順
  - トラブルシューティング

**目次:**
```markdown
# 重大キャンペーンサービス - ユーザーガイド

## 1. はじめに
## 2. キャンペーン管理
   2.1 キャンペーンの検索・フィルタリング
   2.2 キャンペーン詳細の確認
   2.3 関係グラフの活用
## 3. 脅威アクターの追跡
## 4. IoC（Indicators of Compromise）の活用
## 5. アナリティクスダッシュボード
## 6. データのエクスポート
## 7. 外部フィード連携
## 8. トラブルシューティング
```

#### タスク11.4: API仕様書（OpenAPI/Swagger）
- **所要時間:** 4時間
- **担当:** バックエンド
- **詳細:**
  - `docs/api-specification.yaml`作成
  - Swagger UIの導入（`/api-docs`）

#### タスク11.5: デプロイ手順書
- **所要時間:** 2時間
- **担当:** 全員
- **詳細:**
  - `docs/deployment-guide.md`作成
  - 環境変数の設定
  - データベースマイグレーション手順
  - 本番環境でのスケジューラー起動

**Week 11 完了時の成果:**
- ✅ 本番レベルのパフォーマンス
- ✅ セキュリティ監査完了
- ✅ 完全なドキュメント
- ✅ デプロイ可能な状態

---

## 開発リソースと工数見積もり

### 総工数
- **バックエンド:** 約140時間（3.5週間 x 40h/週）
- **フロントエンド:** 約100時間（2.5週間 x 40h/週）
- **統合テスト・ドキュメント:** 約20時間

**合計:** 約260時間（1.5人月 x 2エンジニア = 3人月）

### 推奨開発体制
- **フルスタックエンジニア x 2名**
  または
- **バックエンドエンジニア x 1名 + フロントエンドエンジニア x 1名**

### クリティカルパス
1. Week 1-2: データモデル + API（他のすべてがこれに依存）
2. Week 4-5: 外部フィード統合（データ充実に不可欠）
3. Week 6-7: グラフビュー（主要機能）

---

## リスクと対策

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| STIX 2.1パーサーの複雑さ | 高 | 中 | 既存ライブラリ（`stix2`）の活用、段階的実装 |
| グラフビューのパフォーマンス問題 | 中 | 中 | ノード数制限（表示は100ノードまで）、仮想化 |
| 外部API（OTX、URLhaus）のレート制限 | 低 | 高 | リトライロジック、バックオフ戦略、キャッシュ |
| データ重複の複雑さ | 中 | 中 | 信頼度スコアベースの自動マージ、手動確認UI |
| SQLiteのスケーラビリティ | 低 | 低 | 将来的にPostgreSQLへの移行を検討 |

---

## マイルストーン一覧

- **Week 3 (Phase 1完了)**: MVP（手動データ入力可能）
- **Week 5 (Phase 2完了)**: 自動データ収集（OTX、URLhaus）
- **Week 8 (Phase 3完了)**: グラフビュー + アナリティクス
- **Week 10 (Phase 4完了)**: エクスポート + 通知
- **Week 11 (Phase 5完了)**: 本番リリース

---

## 本番リリース後の運用

### 日次タスク
- 外部フィードの同期状況確認
- 重複候補の手動確認
- 通知の確認

### 週次タスク
- アナリティクスレポートの確認
- 信頼度の低いデータの削除

### 月次タスク
- パフォーマンスメトリクスの分析
- ユーザーフィードバックの収集

---

**ドキュメント作成日:** 2026-11-21
**最終更新日:** 2026-11-21
**バージョン:** 1.0
