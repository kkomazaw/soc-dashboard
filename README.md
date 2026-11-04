# SOC Dashboard - セキュリティオペレーションセンター統合ダッシュボード

SOC（Security Operation Center）アナリスト向けの包括的なセキュリティ監視・脅威インテリジェンスダッシュボードです。

## 🎯 概要

このダッシュボードは、セキュリティアナリストが日々の監視・トリアージ・脅威ハンティングを効率的に行うために必要な情報を、複数のソースから統合して表示します。

## ✨ 実装済み機能

### 1. 脆弱性情報管理

#### CISA KEV（Known Exploited Vulnerabilities）
- 米国土安全保障省CISAが公開する**悪用が確認されている脆弱性**のリスト
- 約1,700件以上の脆弱性データを自動取得・管理
- CVE ID、ベンダー、製品、追加日、対応期限などの詳細情報
- リアルタイムフィルタリング・検索機能
- 自動同期（6時間ごと）

#### JVN（Japan Vulnerability Notes）
- 日本国内で広く使用されている製品の脆弱性情報
- JPCERT/CCの注意喚起情報
- 深刻度（緊急/重要/警告/注意）別表示
- CVSSスコアによる優先度判断
- 日本語での詳細情報
- 自動同期（6時間ごと）

#### NVD（National Vulnerability Database）
- NISTが運用する包括的なCVEデータベース
- CVSS v3.1/v2.0 スコア対応
- 深刻度別統計（Critical/High/Medium/Low）
- CVE ID検索機能
- 最新7日間のCVE自動取得
- 自動同期（12時間ごと）

### 2. 脅威インテリジェンス（IoC検索）

#### VirusTotal統合
- **ファイルハッシュ検索**（MD5/SHA1/SHA256）
  - マルチエンジン検出結果
  - 検出率とファイル情報
  - 既知のファイル名一覧
- **URL/ドメイン検索**
  - 悪性URLの判定
  - カテゴリ分類
  - セキュリティベンダー別判定

#### AbuseIPDB統合
- **IPアドレスレピュテーション検索**
  - 不正利用スコア（0-100%）
  - 報告履歴と詳細
  - 国/ISP/ドメイン情報
  - Tor出口ノード検出
  - ホワイトリスト判定

#### URLhaus統合（abuse.ch）
- **悪性URL検索**
  - マルウェア配布URLのデータベース
  - URL状態と脅威タイプ
  - ブラックリスト状態（Spamhaus DBL、SURBL）
  - タグ情報と報告者
  - APIキー不要・無料利用可能

#### MalwareBazaar統合（abuse.ch）
- **マルウェアサンプル検索**
  - ファイルハッシュ（MD5/SHA1/SHA256）検索
  - マルウェアファミリー・署名情報
  - ファイルタイプと MIME タイプ
  - 初回・最終観測日時
  - 配信元国とタグ情報
  - APIキー不要・無料利用可能

#### AlienVault OTX統合
- **Open Threat Exchange（OTX）統合**
  - コミュニティ駆動型の脅威インテリジェンス
  - IP/ドメイン/ファイルハッシュのレピュテーション検索
  - Pulse情報（キュレーションされた脅威情報）
  - マルウェア・攻撃者情報の関連付け
  - パブリックAPIエンドポイント利用可能
  - APIキー設定で詳細情報にアクセス可能

#### ThreatFox統合（abuse.ch）
- **IOCデータベース検索**
  - C&Cサーバー、ボットネットIP、悪性インフラのIOC
  - 最近のIOC取得（過去3日間のデフォルト）
  - IOC検索（IP、ドメイン、URL）
  - ファイルハッシュ検索
  - 脅威タイプ・マルウェアファミリー情報
  - 信頼度レベルとタグ情報
  - APIキー不要・無料利用可能

#### Feodo Tracker統合（abuse.ch）
- **C2インフラトラッキング**
  - Feodo/Emotet/Dridex/TrickBot/BazarLoader C2サーバー
  - IPアドレスベースのC2ブロックリスト
  - リアルタイムステータス（online/offline）
  - ASN・組織・国情報
  - 初回・最終観測日時
  - マルウェアファミリー情報
  - APIキー不要・無料利用可能

### 3. MITRE ATT&CK Framework

- **MITRE ATT&CK Matrix**の統合表示
  - Enterprise ATT&CK の全14戦術（Tactics）
  - 370以上の攻撃技術（Techniques）
- **戦術別表示**
  - Initial Access, Execution, Persistence, Privilege Escalation など
  - 各戦術に紐づく技術の一覧表示
- **技術詳細情報**
  - 説明、プラットフォーム、データソース
  - MITRE公式サイトへのリンク
- **検索機能**
  - ID、名前、説明による検索
  - キーワードによる技術の絞り込み
- **自動同期**
  - 週次自動更新（日曜日03:00）
  - MITRE公式GitHub リポジトリから最新データ取得

### 4. セキュリティニュースフィード

- **BleepingComputer** - ランサムウェア、Windows脆弱性の速報
- **The Hacker News** - グローバルなサイバー攻撃情報
- 自動同期（1時間ごと）
- カテゴリ別バッジ表示
- 未読管理・スター機能

### 5. 統合ダッシュボード（Overview）

- **リアルタイム統計**
  - Critical脅威数（CVSS 9.0+）
  - High脅威数（CVSS 7.0-8.9）
  - 最近のCISA KEV追加
  - ニュース記事数
- **データソースステータス**
  - CISA KEV、JVN、NVD の統計情報
  - 各ソースの最新更新状況
- **脅威インテリジェンスサービス状態**
  - VirusTotal設定状態
  - AbuseIPDB設定状態
- **最近のアクティビティ**
  - 直近3日間のCISA KEV追加
  - 最新セキュリティニュース（5件）

### 6. ダークモード対応

- **テーマ切り替え機能**
  - ライト/ダークモードの即座切り替え
  - ヘッダー右上の月/太陽アイコンで簡単に切り替え
- **自動テーマ検出**
  - システム設定（prefers-color-scheme）の自動検出
  - 初回アクセス時にOSの設定を反映
- **設定の永続化**
  - LocalStorageにテーマ設定を保存
  - 再訪問時も前回の設定を維持
- **全画面対応**
  - すべてのページ・コンポーネントでダークモード対応
  - テーブル、モーダル、フォーム、グラフなど一貫したデザイン
  - 視認性を保ちつつ目の負担を軽減
- **アクセシビリティ**
  - 高コントラスト配色で読みやすさを確保
  - 重要度の高い情報は色分けを維持

### 7. データ永続化・自動同期

- **SQLiteデータベース**（Prisma ORM）
  - 全データの永続化
  - 高速検索・フィルタリング
- **自動同期スケジューラー**
  - CISA KEV: 6時間ごと（00:00, 06:00, 12:00, 18:00）
  - JVN: 6時間ごと（01:00, 07:00, 13:00, 19:00）
  - NVD: 12時間ごと（02:00, 14:00）
  - MITRE ATT&CK: 週次（日曜日 03:00）
  - ニュース: 1時間ごと
  - 起動時の初回同期

### 8. レポートエクスポート機能

- **CSV エクスポート**
  - すべてのデータソースをCSV形式でエクスポート
  - Excel やスプレッドシートで分析可能
  - カンマ区切り形式で互換性抜群
- **PDF エクスポート**
  - プロフェッショナルなPDFレポート生成
  - 印刷やアーカイブに最適
  - ページ番号付きの整形済みテーブル
- **対応データ**
  - CISA KEV（CSV/PDF）
  - JVN脆弱性（CSV/PDF）
  - NVD CVE（CSV/PDF）
  - MITRE ATT&CK技術（CSV/PDF）
  - セキュリティニュース（CSV）
- **ワンクリックダウンロード**
  - 各ページのヘッダーに「Export」ボタン配置
  - 形式選択ドロップダウンメニュー
  - ファイル名に日付を自動付与
- **API エンドポイント**
  - `/api/export/{source}/{format}` 形式
  - 即座にファイルダウンロード開始
  - 大量データも高速処理

### 9. CVE-to-ATT&CK 自動マッピング

- **脆弱性とATT&CK技術の自動相関**
  - キーワードベースの自動マッピングエンジン
  - CVE説明文からATT&CK技術を自動識別
  - 信頼度レベル（High/Medium/Low）の自動判定
  - 50以上のATT&CK技術に対応
- **対応データソース**
  - CISA KEV（Known Exploited Vulnerabilities）
  - JVN（Japan Vulnerability Notes）
  - NVD（National Vulnerability Database）
- **マッピング手法**
  - キーワードマッチング（攻撃手法、戦術、技術用語）
  - 重み付けスコアリング（複数キーワードマッチで信頼度向上）
  - 戦術ベースの分類（Initial Access、Execution、Persistence等）
- **統計情報**
  - 総マッピング数
  - マッピング済みCVE数
  - 関連ATT&CK技術数
  - 信頼度別分布（High/Medium/Low）
- **API エンドポイント**
  - CVE別のATT&CK技術取得
  - ATT&CK技術別のCVE取得
  - マッピング統計情報
  - 手動マッピング実行トリガー

### 10. デスクトップ通知機能

- **リアルタイム通知**
  - ブラウザネイティブのデスクトップ通知API
  - 重要なセキュリティイベントを即座に通知
  - バックグラウンドでの継続的な監視
- **通知対象**
  - **CISA KEV追加** - 悪用確認済み脆弱性の新規追加
  - **Critical CVE** - CVSS 9.0以上の緊急脆弱性
  - **High CVE** - CVSS 7.0-8.9の重要脆弱性
  - **セキュリティニュース** - 重要キーワードを含むニュース
- **カスタマイズ可能**
  - 通知タイプごとのON/OFF設定
  - 音声アラートの有効/無効
  - 通知設定画面でリアルタイム調整
  - LocalStorageで設定を永続化
- **スマート通知**
  - 最終チェック時刻以降の新規イベントのみ通知
  - 重複通知の防止
  - キーワードベースのフィルタリング
- **ユーザー体験**
  - 初回アクセス時に権限リクエストバナー表示
  - 画面右下の通知アイコンから設定アクセス
  - テスト通知機能で動作確認可能
  - 10秒後に自動クローズ

### 11. ビジュアル分析・グラフ表示

- **脆弱性の可視化**
  - 深刻度分布の円グラフ（Critical/High/Medium/Low）
  - 30日間の脆弱性トレンドライン（総数・Critical・High）
- **脅威インテリジェンス可視化**
  - MITRE ATT&CK 戦術分布の棒グラフ（Top 10 Tactics）
  - 各戦術に紐づく技術数を色分け表示
  - 攻撃者の戦術傾向を一目で把握
- **インタラクティブチャート**
  - Recharts ライブラリによる高品質な可視化
  - ツールチップによる詳細情報表示
  - レスポンシブデザインで各種デバイス対応
- **ダークモード完全対応**
  - ライト/ダークテーマで最適化された配色
  - グリッド線・軸・凡例の視認性確保
- **リアルタイム更新**
  - データ同期と連動して自動更新
  - CISA KEV、JVN、NVD、MITRE ATT&CK の統合分析
- **Overview ダッシュボード統合**
  - メイン画面に3つのチャートを配置
  - 全データソースを横断した統計分析
  - トレンド把握と優先度判断を支援

### 12. 脆弱性トレンド分析

- **包括的な統計ダッシュボード**
  - 全脆弱性の総合統計（総数、Critical、High、影響ベンダー数）
  - リアルタイムで更新される主要メトリクス
  - 深刻度別の割合表示
- **時系列トレンド分析**
  - 日別脆弱性トレンドグラフ（7/14/30/60/90日間対応）
  - 総数・Critical・High・CISA KEVの複数ライン表示
  - 時間範囲の動的切り替え機能
- **深刻度分布の可視化**
  - 円グラフによる深刻度分布（Critical/High/Medium/Low）
  - 各カテゴリの件数と割合を同時表示
  - インタラクティブなツールチップ
- **CVSSスコア分布**
  - スコア範囲別の棒グラフ（0.0-1.0, 1.0-2.0, ... 10.0）
  - 脆弱性の深刻度傾向を詳細に把握
  - 全データソース統合表示
- **月次統計レポート**
  - 過去12ヶ月の月別トレンド
  - CISA KEV・NVD・JVN別のスタックバーチャート
  - Critical/High脆弱性の月次推移
- **影響範囲分析**
  - Top 10 影響ベンダーランキング
  - Top 10 影響製品ランキング
  - 件数と割合による優先度判断支援
- **APIエンドポイント**
  - `/api/analytics/trends?days=30` - 日別トレンドデータ
  - `/api/analytics/severity-distribution` - 深刻度分布
  - `/api/analytics/top-vendors-products` - Top影響ベンダー/製品
  - `/api/analytics/cvss-distribution` - CVSSスコア分布
  - `/api/analytics/monthly-stats?months=12` - 月次統計

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
- **Axios** - HTTP クライアント
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
   - キーなしでも一部機能は利用可能（パブリックPulseなど）
   - キーあり: Subscribed Pulsesや詳細情報にアクセス可能

4. **NVD API Key** (オプション)
   - https://nvd.nist.gov/developers/request-an-api-key
   - キーなしでも動作（レート制限: 5リクエスト/30秒）
   - キーあり: 50リクエスト/30秒

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
   - 各サービスのステータス確認
   - 最新アクティビティの一覧

2. **脆弱性**
   - **CISA KEV** - 悪用確認済み脆弱性の管理
   - **JVN** - 日本国内の脆弱性情報
   - **NVD** - 包括的なCVEデータベース

3. **IoC検索**
   - ファイルハッシュ検索（VirusTotal）
   - URL/ドメイン検索（VirusTotal）
   - IPアドレス検索（AbuseIPDB）

4. **ニュース**
   - セキュリティニュースの統合フィード
   - ソース別フィルタリング
   - 未読/スター管理

### 主要な操作

- **データ更新**: 各画面の「更新」ボタンで最新データを取得
- **検索**: 各画面の検索ボックスで即座にフィルタリング
- **ソート**: テーブルヘッダーをクリックでソート
- **詳細表示**: 行をクリックで詳細情報を表示

## 🏗️ プロジェクト構造

```
soc-dashboard/
├── src/                          # フロントエンド
│   ├── components/
│   │   ├── Dashboard/           # Overviewダッシュボード
│   │   ├── Vulnerabilities/     # 脆弱性コンポーネント
│   │   │   ├── CisaKevList.tsx
│   │   │   ├── JvnList.tsx
│   │   │   └── NvdList.tsx
│   │   ├── ThreatIntel/        # IoC検索
│   │   │   └── IocSearch.tsx
│   │   ├── News/               # ニュースフィード
│   │   └── layout/             # レイアウト
│   ├── services/api/           # APIクライアント
│   ├── hooks/                  # カスタムフック
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

## 🔌 APIエンドポイント

### 脆弱性

```
GET  /api/vulnerabilities/cisa-kev          # CISA KEVリスト取得
POST /api/vulnerabilities/cisa-kev/refresh  # CISA KEV手動更新

GET  /api/jvn                               # JVNリスト取得
GET  /api/jvn/recent?days=30                # 最近のJVN取得
POST /api/jvn/refresh                       # JVN手動更新

GET  /api/nvd                               # NVDリスト取得
GET  /api/nvd/recent?days=30                # 最近のNVD取得
GET  /api/nvd/search/:cveId                 # CVE ID検索
GET  /api/nvd/status                        # NVD API状態
POST /api/nvd/refresh?days=7                # NVD手動更新
```

### 脅威インテリジェンス

```
GET  /api/ioc/status                        # API設定状態
GET  /api/ioc/hash/:hash                    # ファイルハッシュ検索（VirusTotal）
POST /api/ioc/url                           # URL検索（VirusTotal）
GET  /api/ioc/ip/:ip                        # IP検索（AbuseIPDB）
POST /api/ioc/urlhaus                       # 悪性URL検索（URLhaus）
GET  /api/ioc/malware/:hash                 # マルウェア検索（MalwareBazaar）
```

### MITRE ATT&CK

```
GET  /api/attack/techniques                 # 全技術取得
GET  /api/attack/tactics                    # 全戦術取得
GET  /api/attack/matrix                     # ATT&CK Matrix取得
GET  /api/attack/stats                      # 統計情報取得
GET  /api/attack/search?q=keyword           # 技術検索
GET  /api/attack/techniques/:techniqueId    # 特定技術取得
GET  /api/attack/tactics/:tactic/techniques # 戦術別技術取得
GET  /api/attack/platforms/:platform/techniques # プラットフォーム別技術取得
POST /api/attack/refresh                    # ATT&CK手動更新
```

### ニュース

```
GET  /api/news/feed                         # ニュースフィード取得
POST /api/news/feed/refresh                 # ニュース手動更新
```

### CVE-to-ATT&CK マッピング

```
GET  /api/mapping/cve/:cveId                # CVE別ATT&CK技術取得
GET  /api/mapping/technique/:techniqueId    # ATT&CK技術別CVE取得
GET  /api/mapping/stats                     # マッピング統計情報取得
POST /api/mapping/trigger/all               # 全データソースのマッピング実行
POST /api/mapping/trigger/cisa              # CISA KEVのマッピング実行
POST /api/mapping/trigger/jvn               # JVNのマッピング実行
POST /api/mapping/trigger/nvd               # NVDのマッピング実行
```

## 🔧 トラブルシューティング

### 一般的な問題

#### 1. データが表示されない

```bash
# バックエンドが起動しているか確認
# ターミナルに "🚀 SOC Dashboard API server running" が表示されているか確認

# ポート確認
lsof -i :3001
lsof -i :5173

# 両方を再起動
npm run dev:all
```

#### 2. API キーエラー

```bash
# .envファイルを確認
cat .env

# APIキーが正しく設定されているか確認
# VirusTotal: 64文字の16進数文字列
# AbuseIPDB: 80文字のランダム文字列
```

#### 3. データベースエラー

```bash
# データベースをリセット
rm prisma/dev.db
npm run prisma:migrate

# Prismaクライアントを再生成
npm run prisma:generate
```

#### 4. ビルドエラー

```bash
# node_modulesをクリーンインストール
rm -rf node_modules package-lock.json
npm install

# TypeScriptコンパイルエラーを確認
npm run build
```

### ログの確認

- **フロントエンド**: ブラウザのデベロッパーツール（F12）→ Console
- **バックエンド**: ターミナルのサーバーログ

## 📈 パフォーマンス最適化

- **React Query**によるデータキャッシング
- **SQLite**による高速ローカルストレージ
- **自動同期**による最新データの維持
- **レート制限**による外部API保護

## 🔐 セキュリティ

- API キーは`.env`ファイルで管理（Gitにコミットしない）
- CORS設定によるアクセス制御
- バックエンドプロキシによるAPIキー保護
- SQLiteによるローカルデータ保存

## 🚧 今後の実装予定

### フェーズ3: UX/UI改善
- カスタマイズ可能なダッシュボード

### フェーズ4: 高度な機能
- 脆弱性トレンド分析
- SIEM/EDR連携
- カスタムアラートルール
- チーム協業機能

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

- [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [JVN](https://jvn.jp/)
- [NVD](https://nvd.nist.gov/)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [AlienVault OTX](https://otx.alienvault.com/)
- [URLhaus](https://urlhaus.abuse.ch/)
- [MalwareBazaar](https://bazaar.abuse.ch/)
- [ThreatFox](https://threatfox.abuse.ch/)
- [Feodo Tracker](https://feodotracker.abuse.ch/)
- [BleepingComputer](https://www.bleepingcomputer.com/)
- [The Hacker News](https://thehackernews.com/)

---

**バージョン**: 2.10.0
**最終更新**: 2026-11-03
**開発**: Claude Code
