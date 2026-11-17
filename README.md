# SOC Dashboard - セキュリティオペレーションセンター統合ダッシュボード

SOC（Security Operation Center）アナリスト向けの包括的なセキュリティ監視・脅威インテリジェンスダッシュボードです。

## 🎯 概要

このダッシュボードは、セキュリティアナリストが日々の監視・トリアージ・脅威ハンティングを効率的に行うために必要な情報を、複数のソースから統合して表示します。リアルタイムの脅威情報、脆弱性データ、IoC検索、MITRE ATT&CK統合など、SOC業務に必要な機能を一元管理できます。

## ✨ 主要機能

### 📊 統合ダッシュボード（Overview）

- **リアルタイム統計サマリー**
  - Critical脅威数（CVSS 9.0+）、High脅威数（CVSS 7.0-8.9）
  - 最近のCISA KEV追加、ニュース記事数
  - データソースステータス（CISA KEV、JVN、NVD、Red Hat）
  - 脅威インテリジェンスサービス状態

- **ビジュアル分析**
  - 深刻度分布の円グラフ（Critical/High/Medium/Low）
  - 30日間の脆弱性トレンドライン
  - MITRE ATT&CK 戦術分布（Top 10）

- **最近のアクティビティ**
  - 直近3日間のCISA KEV追加
  - 最新セキュリティニュース（5件）

### 🔒 脆弱性情報管理

#### CISA KEV（Known Exploited Vulnerabilities）
- **実際に悪用が確認されている脆弱性**のカタログ
- 1,700件以上の脆弱性データを自動管理
- **高度なフィルタリング機能**
  - 発行年、ベンダー、製品、ランサムウェア悪用の有無
  - 複数条件の組み合わせ検索
  - フィルタ結果カウント表示
- **分析ダッシュボード（CISA KEV Analytics）**
  - 年次KEV発行数推移（2021年〜、ランサムウェア悪用別）
  - 影響を受けるベンダー/製品 Top 10（年選択可能）
  - 月次追加トレンド（過去12ヶ月）
  - ランサムウェアキャンペーン利用状況
  - カタログ登録からの経過時間分析
  - 修正期限ステータス分布
- 自動同期（6時間ごと）、CSV/PDFエクスポート

#### JVN（Japan Vulnerability Notes）
- 日本国内で広く使用されている製品の脆弱性情報
- JPCERT/CCの注意喚起情報
- 深刻度（緊急/重要/警告/注意）別表示
- CVSSスコアによる優先度判断
- 自動同期（6時間ごと）、CSV/PDFエクスポート

#### NVD（National Vulnerability Database）
- NISTが運用する世界最大の脆弱性データベース
- **CVE ID検索機能**（データベースにない最新CVEもAPI経由で自動取得）
- **NVD Analytics**
  - CVSSスコア分布、深刻度別統計
  - 月次・年次トレンド分析
  - 影響範囲分析（Top ベンダー/製品）
- CVSS v3.1/v2.0 対応
- 自動同期（12時間ごと）、CSV/PDFエクスポート

#### Red Hat Security Advisories
- Red Hat製品のセキュリティアドバイザリ
- RHSA/RHBA/RHEA分類
- 深刻度別フィルタリング
- 影響製品・パッケージ情報
- 自動同期、CSV/PDFエクスポート

### 🔍 高度な検索・分析機能

#### グローバル脆弱性検索（Vulnerability Search）
- **全データソース横断検索**（CISA KEV、JVN、NVD、Red Hat）
- CVE ID、キーワードによる統合検索
- 深刻度フィルタ（Critical/High/Medium/Low）
- ページネーション対応（20件/ページ）
- 検索結果数リアルタイム表示

#### CVE タイムライン
- **CVEの時系列イベント可視化**
  - 公開日、最終更新日、CISA KEV追加日
  - EPSS スコア履歴（エクスプロイト予測）
  - 関連する脅威インテリジェンス
- 複数CVEの並行比較
- インタラクティブなタイムライン表示

#### EPSS（Exploit Prediction Scoring System）統合
- **脆弱性のエクスプロイト可能性予測**
- スコア（0-100%）とパーセンタイル
- リスク解釈（Extreme/Very High/High/Moderate/Low）
- 高リスクCVE一覧（EPSS 50%以上）
- 全CVEへの自動EPSS付与
- 毎日自動更新

### 🌐 脅威インテリジェンス

#### IoC検索（複数サービス統合）

**VirusTotal**
- ファイルハッシュ検索（MD5/SHA1/SHA256）
  - マルチエンジン検出結果、検出率
- URL/ドメイン検索
  - 悪性URLの判定、カテゴリ分類

**AbuseIPDB**
- IPアドレスレピュテーション検索
  - 不正利用スコア（0-100%）
  - 報告履歴、国/ISP/ドメイン情報
  - Tor出口ノード検出

**abuse.ch 統合（APIキー不要）**
- **URLhaus**: 悪性URL検索
- **MalwareBazaar**: マルウェアサンプル検索
- **ThreatFox**: C&C/ボットネットIOC検索
- **Feodo Tracker**: C2インフラトラッキング

**AlienVault OTX**
- コミュニティ駆動型脅威インテリジェンス
- IP/ドメイン/ファイルハッシュのレピュテーション
- Pulse情報（キュレーションされた脅威情報）

#### 地理的脅威分析（Geographic Threat Analysis）
- **グローバル脅威マップ**
  - 国別脅威アクティビティ可視化
  - Top脅威発生国ランキング
- **IPアドレス分析**
  - 地理的位置情報（国、地域、都市）
  - ASN/組織情報
  - 脅威タイプ分類
- AbuseIPDB、AlienVault OTXからの統合データ
- 6時間ごと自動更新

### 🛡️ MITRE ATT&CK Framework統合

- **ATT&CK Matrix**の完全統合表示
  - Enterprise ATT&CK の全14戦術（Tactics）
  - 370以上の攻撃技術（Techniques）
- **戦術別表示**（Initial Access、Execution、Persistenceなど）
- **技術詳細情報**（説明、プラットフォーム、データソース）
- **検索機能**（ID、名前、説明によるフィルタリング）
- **CVE-to-ATT&CK自動マッピング**
  - キーワードベースの自動マッピングエンジン
  - 信頼度レベル（High/Medium/Low）判定
  - CVE説明文からATT&CK技術を自動識別
- 週次自動更新（日曜日03:00）、CSV/PDFエクスポート

### 📰 セキュリティニュースフィード

- **統合ニュースソース**
  - **BleepingComputer**: ランサムウェア、Windows脆弱性の速報
  - **The Hacker News**: グローバルなサイバー攻撃情報
  - **セキュリティ対策Lab**: 日本語セキュリティニュース
- **無限スクロール対応**（初期10件、スクロールで追加ロード）
- カテゴリ別バッジ表示
- 1時間ごと自動更新、CSVエクスポート

### 🔧 パッチ管理

- **Microsoft Patch Tuesday統合**
  - 月次セキュリティ更新プログラム
  - KB番号、CVSS、影響製品
- **パッチカレンダー**
  - 月別パッチリリース予定
  - 適用ステータス管理（Pending/Applied/Skipped）
- **統計ダッシュボード**
  - パッチ適用率
  - 深刻度別分布
- 自動同期、適用状態トラッキング

### 📈 分析・レポート機能

#### 脆弱性トレンド分析
- **包括的な統計ダッシュボード**
  - 全脆弱性の総合統計（総数、Critical、High）
  - 深刻度別割合表示
- **時系列トレンド分析**
  - 日別脆弱性トレンドグラフ（7/14/30/60/90日間）
  - 総数・Critical・High・CISA KEVの複数ライン表示
- **CVSSスコア分布**（棒グラフ）
- **月次統計レポート**（過去12ヶ月）
- **影響範囲分析**（Top 10 ベンダー/製品）

#### レポートエクスポート
- **CSV形式**: すべてのデータソースをCSV出力
- **PDF形式**: プロフェッショナルなPDFレポート生成
- **対応データ**
  - CISA KEV、JVN、NVD、Red Hat
  - MITRE ATT&CK技術
  - セキュリティニュース
- ワンクリックダウンロード、ファイル名に日付自動付与

### 🔔 デスクトップ通知機能

- **リアルタイム通知**
  - ブラウザネイティブのデスクトップ通知API
  - バックグラウンドでの継続的な監視
- **通知対象**
  - CISA KEV追加
  - Critical CVE（CVSS 9.0+）
  - High CVE（CVSS 7.0-8.9）
  - 重要キーワードを含むセキュリティニュース
- **カスタマイズ可能**
  - 通知タイプごとのON/OFF設定
  - 音声アラートの有効/無効
  - テスト通知機能
- スマート通知（重複防止、最終チェック時刻以降のみ通知）

### 🎨 UI/UX機能

#### ダークモード対応
- **完全なダーク/ライトテーマ**
- システム設定（prefers-color-scheme）の自動検出
- LocalStorageで設定を永続化
- すべてのページ・コンポーネントで一貫したデザイン
- 高コントラスト配色で視認性確保

#### ヘルプツールチップ
- **主要ページにヘルプアイコン配置**
  - CISA KEV、JVN、NVD、Red Hat
  - グローバル検索、CVEタイムライン
  - 各データソースの説明と活用方法
- インタラクティブなツールチップ表示
- 初心者にも分かりやすい説明文

### ⚙️ データ管理・自動化

#### データ永続化
- **SQLite + Prisma ORM**
  - 全データの永続化
  - 高速検索・フィルタリング
  - トランザクション対応

#### 自動同期スケジューラー
- **CISA KEV**: 6時間ごと（00:00, 06:00, 12:00, 18:00）
- **JVN**: 6時間ごと（01:00, 07:00, 13:00, 19:00）
- **NVD**: 12時間ごと（02:00, 14:00）
- **MITRE ATT&CK**: 週次（日曜日 03:00）
- **EPSS**: 毎日（04:00）
- **Geographic Threats**: 6時間ごと（05:00, 11:00, 17:00, 23:00）
- **ニュース**: 1時間ごと
- **起動時の初回同期**

## 🛠️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - モダンUIフレームワーク
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **TanStack Query** - データフェッチ・キャッシング
- **Recharts** - データ可視化・グラフライブラリ
- **date-fns** - 日付操作ライブラリ
- **Lucide React** - アイコンライブラリ

### バックエンド
- **Express.js** - Node.js Webフレームワーク
- **TypeScript** - 型安全性
- **Prisma** - 次世代ORM
- **SQLite** - 軽量データベース
- **node-cron** - スケジューラー
- **Axios** - HTTPクライアント
- **rss-parser** - RSSフィード解析
- **PDFKit** - PDF生成
- **json2csv** - CSV生成

## 📦 セットアップ

### 前提条件

- Node.js 18以降
- npm または yarn
- インターネット接続

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd soc-dashboard

# 依存パッケージのインストール
npm install

# Prismaクライアント生成
npm run prisma:generate

# データベースマイグレーション
npm run prisma:migrate
```

### 環境変数設定

`.env` ファイルをプロジェクトルートに作成：

```bash
# Database
DATABASE_URL="file:./dev.db"

# API Keys (optional for MVP, recommended for production)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
OTX_API_KEY=your_otx_api_key_here  # Optional - AlienVault OTX
NVD_API_KEY=your_nvd_api_key_here  # Optional - improves rate limits
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here  # Optional - Twitter integration

# Server Port (optional)
PORT=3001
```

#### API キーの取得方法

1. **VirusTotal API Key** (推奨)
   - https://www.virustotal.com/gui/join-us
   - 無料アカウント作成後、API Keyを取得
   - レート制限: 4リクエスト/分

2. **AbuseIPDB API Key** (推奨)
   - https://www.abuseipdb.com/account/api
   - 無料アカウント作成後、API Keyを取得
   - レート制限: 1,000リクエスト/日

3. **AlienVault OTX API Key** (オプション)
   - https://otx.alienvault.com/
   - 無料アカウント作成後、Settings → API Integrationで取得
   - キーなしでも一部機能は利用可能

4. **NVD API Key** (オプション)
   - https://nvd.nist.gov/developers/request-an-api-key
   - キーなし: 5リクエスト/30秒
   - キーあり: 50リクエスト/30秒

5. **Twitter Bearer Token** (オプション)
   - https://developer.twitter.com/
   - セキュリティコミュニティのツイート監視用

**注**: abuse.ch系サービス（URLhaus、MalwareBazaar、ThreatFox、Feodo Tracker）はAPIキー不要で利用可能です。

## 🚀 起動方法

### 開発モード（推奨）

フロントエンドとバックエンドを同時起動：

```bash
npm run dev:all
```

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3001

### 個別起動

```bash
# フロントエンドのみ
npm run dev

# バックエンドのみ
npm run dev:server
```

### プロダクションビルド

```bash
# ビルド
npm run build

# ビルドされたファイルをプレビュー
npm run preview
```

## 📊 使い方

### 画面構成

1. **Overview（概要）**
   - 全データソースの統合ダッシュボード
   - Critical/High脅威の即時確認
   - ビジュアル分析（グラフ表示）

2. **脆弱性一覧**
   - 各データソース（CISA KEV、JVN、NVD、Red Hat）の一覧
   - データソースステータスパネルからアクセス

3. **分析**
   - CISA KEV Analytics（年次トレンド、ランサムウェア分析）
   - NVD Analytics（CVSS分布、トレンド分析）
   - Vulnerability Trends（全ソース統合トレンド）
   - Enhanced Analytics（高度な分析）

4. **脆弱性検索（Vulnerability Search）**
   - 全データソース横断検索
   - 深刻度フィルタ、ページネーション

5. **CVE Timeline**
   - 時系列イベント可視化
   - EPSS統合表示

6. **IoC検索（Threat Intel）**
   - ファイルハッシュ、URL、IPアドレス検索
   - 複数サービス統合

7. **MITRE ATT&CK**
   - 戦術・技術一覧
   - CVE-to-ATT&CKマッピング

8. **パッチ管理**
   - Microsoft Patch Tuesday
   - パッチカレンダー

9. **ニュース**
   - セキュリティニュースフィード
   - 無限スクロール

10. **設定**
    - デスクトップ通知設定
    - テーマ切り替え

### 主要な操作

- **データ更新**: 各画面の「Update」/「Refresh」ボタンで最新データを取得
- **検索・フィルタ**: 検索ボックスやフィルタドロップダウンで即座に絞り込み
- **エクスポート**: 「Export」ボタンでCSV/PDF形式でダウンロード
- **詳細表示**: CVE IDリンクをクリックでNVD公式サイトへ遷移

## 🏗️ プロジェクト構造

```
soc-dashboard/
├── src/                          # フロントエンド
│   ├── components/
│   │   ├── Dashboard/           # Overviewダッシュボード
│   │   ├── Vulnerabilities/     # 脆弱性コンポーネント
│   │   ├── Analytics/           # 分析ダッシュボード
│   │   ├── ThreatIntel/        # IoC検索
│   │   ├── News/               # ニュースフィード
│   │   ├── Patches/            # パッチ管理
│   │   ├── CVETimeline/        # CVEタイムライン
│   │   ├── Search/             # グローバル検索
│   │   ├── Settings/           # 設定
│   │   ├── common/             # 共通コンポーネント
│   │   └── layout/             # レイアウト
│   ├── services/api/           # APIクライアント
│   ├── hooks/                  # カスタムフック
│   ├── contexts/               # Reactコンテキスト
│   └── types/                  # TypeScript型定義
├── server/                      # バックエンド
│   ├── controllers/            # APIコントローラー
│   ├── routes/                 # ルート定義
│   ├── services/
│   │   ├── fetchers/          # 外部API統合
│   │   ├── database/          # DB操作
│   │   ├── threat-intel/      # 脅威インテリジェンス
│   │   ├── dataSync.ts        # データ同期
│   │   └── scheduler.ts       # 自動同期スケジューラー
│   └── index.ts               # サーバーエントリーポイント
├── prisma/                     # データベース
│   ├── schema.prisma          # スキーマ定義
│   └── migrations/            # マイグレーション
└── .env                        # 環境変数
```

## 🔌 主要APIエンドポイント

### 脆弱性

```
GET  /api/vulnerabilities/cisa-kev          # CISA KEVリスト取得
POST /api/vulnerabilities/cisa-kev/refresh  # CISA KEV手動更新

GET  /api/jvn                               # JVNリスト取得
POST /api/jvn/refresh                       # JVN手動更新

GET  /api/nvd                               # NVDリスト取得
GET  /api/nvd/search/:cveId                 # CVE ID検索
POST /api/nvd/refresh                       # NVD手動更新

GET  /api/redhat/all                        # Red Hat全データ取得
POST /api/redhat/refresh                    # Red Hat手動更新
```

### 脅威インテリジェンス

```
GET  /api/ioc/hash/:hash                    # ファイルハッシュ検索
POST /api/ioc/url                           # URL検索
GET  /api/ioc/ip/:ip                        # IP検索
```

### 分析・統計

```
GET  /api/analytics/trends                  # トレンドデータ
GET  /api/epss/stats                        # EPSS統計
GET  /api/geo-threat/stats                  # 地理的脅威統計
```

### MITRE ATT&CK

```
GET  /api/attack/matrix                     # ATT&CK Matrix取得
GET  /api/attack/techniques                 # 全技術取得
POST /api/attack/refresh                    # ATT&CK手動更新
```

### エクスポート

```
GET  /api/export/{source}/csv               # CSV形式エクスポート
GET  /api/export/{source}/pdf               # PDF形式エクスポート
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. データが表示されない

```bash
# バックエンドが起動しているか確認
# "🚀 SOC Dashboard API server running" が表示されているか確認

# ポート確認
lsof -i :3001
lsof -i :5173

# 再起動
npm run dev:all
```

#### 2. API キーエラー

```bash
# .envファイルを確認
cat .env

# APIキーが正しく設定されているか確認
```

#### 3. データベースエラー

```bash
# データベースをリセット
rm prisma/dev.db
npm run prisma:migrate

# Prismaクライアントを再生成
npm run prisma:generate
```

### ログの確認

- **フロントエンド**: ブラウザのデベロッパーツール（F12）→ Console
- **バックエンド**: ターミナルのサーバーログ

## 📝 開発

### データベース管理

```bash
# Prisma Studio（データベースGUI）
npm run prisma:studio

# マイグレーション作成
npm run prisma:migrate

# クライアント再生成
npm run prisma:generate
```

### コード品質

```bash
# TypeScript型チェック
npm run build

# ESLint
npm run lint
```

## 📄 ライセンス

MIT

## 🙏 クレジット

このプロジェクトは以下のデータソースを使用しています：

**脆弱性データベース**
- [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) - 悪用確認済み脆弱性
- [JVN](https://jvn.jp/) - 日本脆弱性情報
- [NVD](https://nvd.nist.gov/) - 国家脆弱性データベース
- [Red Hat Security](https://access.redhat.com/security/) - Red Hatセキュリティアドバイザリ
- [EPSS](https://www.first.org/epss/) - エクスプロイト予測スコア

**脅威インテリジェンス**
- [VirusTotal](https://www.virustotal.com/) - マルウェア・URL検査
- [AbuseIPDB](https://www.abuseipdb.com/) - IPレピュテーション
- [AlienVault OTX](https://otx.alienvault.com/) - オープン脅威交換
- [URLhaus](https://urlhaus.abuse.ch/) - 悪性URL
- [MalwareBazaar](https://bazaar.abuse.ch/) - マルウェアサンプル
- [ThreatFox](https://threatfox.abuse.ch/) - IOCデータベース
- [Feodo Tracker](https://feodotracker.abuse.ch/) - C2トラッカー

**フレームワーク・ニュース**
- [MITRE ATT&CK](https://attack.mitre.org/) - 攻撃戦術・技術
- [BleepingComputer](https://www.bleepingcomputer.com/) - セキュリティニュース
- [The Hacker News](https://thehackernews.com/) - セキュリティニュース
- [セキュリティ対策Lab](https://rocket-boys.co.jp/security-measures-lab/) - 日本語セキュリティニュース

---

**バージョン**: 3.0.0
**最終更新**: 2026-11-17
**開発**: Claude Code
