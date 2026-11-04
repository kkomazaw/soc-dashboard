# SOCダッシュボード 要件定義書・設計書

## プロジェクト概要

SOC（Security Operation Center）アナリストやエンジニアが日々の監視・トリアージ・脅威ハンティングを的確に行うための、ローカルPC上で動作する統合セキュリティ監視ダッシュボード。

### 基本方針

- **利用形態**: 個人のローカルPC上で動作
- **ネットワーク**: インターネット接続可能（外部API利用）
- **既存システム連携**: 不要（将来的に拡張可能な設計）
- **更新方式**: 手動更新（リフレッシュボタン）
- **対象ユーザー**: SOCアナリスト、セキュリティエンジニア

---

## 1. 機能要件

### 1.1 コア機能（優先度: 高）

#### A. 脆弱性・緊急アラート情報の表示

##### CISA KEV（Known Exploited Vulnerabilities）
- 最新の悪用確認済み脆弱性リストを表示
- 表示項目:
  - CVE ID
  - 製品名・ベンダー名
  - 脆弱性の説明
  - 追加日
  - 対応期限
  - 必須アクション
- 機能:
  - 追加日順・期限順のソート
  - 製品名・ベンダーでのフィルタリング
  - 過去24時間以内の新規追加のハイライト表示
  - CSVエクスポート機能

##### JVN / JPCERT/CC 注意喚起
- 国内の最新脆弱性情報・注意喚起を表示
- 表示項目:
  - JVN ID
  - タイトル（日本語）
  - 影響を受ける製品
  - 深刻度
  - 公開日
- 機能:
  - 公開日順のソート
  - キーワード検索
  - 深刻度フィルタリング

##### NVD (National Vulnerability Database)
- CVE検索機能
- 表示項目:
  - CVE ID
  - CVSSスコア（v3.1/v2.0）
  - 影響範囲（機密性・完全性・可用性）
  - 脆弱性の詳細説明
  - 参照情報（CWE、ベンダーアドバイザリ）
  - パッチ情報
- 機能:
  - CVE ID検索
  - 製品名検索
  - CVSSスコア範囲指定
  - 公開日範囲指定

#### B. 脅威インテリジェンス情報

##### 最新の脅威トレンド表示
- MITRE ATT&CK Framework の戦術・技術マッピング
  - 過去7日間/30日間で観測されたTTPsの頻度分析
  - ヒートマップ形式での可視化
  - 戦術（Tactics）ごとのグループ化
  - 技術（Techniques）の詳細情報表示
- 関連APTグループの表示
- トレンド分析（増加傾向・減少傾向）

##### IoC検索機能
- サポートするIoC タイプ:
  - IPアドレス
  - ドメイン名
  - ファイルハッシュ（MD5/SHA1/SHA256）
  - URL
- 統合するサービス:
  - **VirusTotal**
    - 検出率
    - カテゴリ分類
    - 関連ファイル
    - 通信先情報
  - **AbuseIPDB**
    - 信頼スコア
    - 報告数
    - 最新の攻撃タイプ
    - 報告国
  - **AlienVault OTX**（オプション）
    - 関連するPulse（脅威情報フィード）
    - タグ情報
- 機能:
  - 検索履歴の保存（最新100件）
  - 検索結果のエクスポート
  - ブックマーク機能

#### C. セキュリティニュースフィード

##### RSS/Atom フィード統合
- 対応ソース:
  - **海外メディア**
    - BleepingComputer
    - The Hacker News
    - Dark Reading
    - KrebsOnSecurity
  - **国内メディア**
    - ScanNetSecurity
    - ITmedia エンタープライズ（セキュリティ）
    - Security NEXT
  - **ベンダーブログ**
    - Unit 42（Palo Alto Networks）
    - Mandiant Threat Intelligence
    - Microsoft Security Blog
    - Kaspersky Securelist
    - Trend Micro Research

##### フィルタリング機能
- カテゴリ別表示:
  - 脆弱性
  - ランサムウェア
  - APT（Advanced Persistent Threat）
  - マルウェア
  - データ侵害
  - パッチ情報
  - その他
- キーワード検索
- 既読/未読管理
- 日付範囲指定
- ソース別表示

#### D. クイックアクセス機能

##### よく使う情報源へのブックマーク
- カスタマイズ可能なリンク集
- カテゴリ:
  - 公式情報源（CISA、JPCERT/CC等）
  - ベンダーセキュリティページ
  - 脅威インテリジェンスプラットフォーム
  - 社内システム（SIEM/EDR等）
  - その他
- ドラッグ&ドロップでの並び替え
- アイコン・タイトルのカスタマイズ

---

### 1.2 サブ機能（優先度: 中）

#### 通知機能
- デスクトップ通知:
  - CISA KEVの新規追加
  - 重要度CRITICALの脆弱性公開（JVN/NVD）
  - 特定キーワードのニュース検出
- 通知設定:
  - 通知のON/OFF切り替え
  - 重要度のしきい値設定
  - 通知対象のカスタマイズ
- 音声アラート（オプション）

#### レポート出力
- 日次サマリー:
  - 新規脆弱性の概要
  - 重要なニュースのハイライト
  - IoC検索履歴のサマリー
- 週次トレンドレポート:
  - 脆弱性の統計（件数、深刻度分布）
  - MITRE ATT&CK TTPs トレンド
  - ニュースのカテゴリ別集計
- 出力形式:
  - PDF
  - HTML
  - Markdown

#### カスタマイズ機能
- ダッシュボードレイアウトの変更:
  - ウィジェットのサイズ調整
  - ウィジェットの配置変更（グリッドシステム）
  - ウィジェットの表示/非表示切り替え
- 監視対象製品/ベンダーの登録:
  - 使用中の製品リストの管理
  - 該当製品の脆弱性を自動ハイライト
- 表示項目の選択:
  - テーブルカラムの表示/非表示
  - デフォルトソート順の設定
- テーマ設定:
  - ライトモード/ダークモード

---

### 1.3 将来拡張（優先度: 低）

- SIEM/EDRログ連携インターフェース（プラグイン方式）
  - Splunk
  - Elastic Stack (ELK)
  - Microsoft Sentinel
  - CrowdStrike Falcon
  - SentinelOne
- チーム共有機能（複数端末での同期）
- AI活用
  - 脅威の自動要約
  - 関連情報の推薦
  - 異常検知
- Webhook連携（Slack/Teams等への自動通知）

---

## 2. 画面設計

### 2.1 全体レイアウト構成

```
┌─────────────────────────────────────────────────────────────┐
│ ヘッダー: SOC Dashboard | 最終更新: 2026-11-01 10:30  [更新]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  メインコンテンツエリア                    │
│ │ サイドバー  │                                             │
│ │             │  ┌───────────────┬───────────────┐          │
│ │ ■ Overview  │  │  脆弱性アラート │ 脅威インテリ │          │
│ │             │  │                │ジェンス      │          │
│ │ ■ 脆弱性    │  │  CISA KEV (5件)│              │          │
│ │   - KEV     │  │  JVN (3件)     │  MITRE       │          │
│ │   - JVN     │  │  NVD検索       │  ATT&CK      │          │
│ │   - NVD     │  │                │              │          │
│ │             │  └───────────────┴───────────────┘          │
│ │ ■ 脅威情報  │  ┌───────────────────────────────┐          │
│ │   - IoC検索 │  │  ニュースフィード              │          │
│ │   - TTPs    │  │                                │          │
│ │             │  │  BleepingComputer (10件)      │          │
│ │ ■ ニュース  │  │  The Hacker News (8件)        │          │
│ │             │  │  Vendor Blogs (5件)           │          │
│ │ ■ ツール    │  │                                │          │
│ │   - リンク集│  └───────────────────────────────┘          │
│ │             │                                             │
│ └─────────────┘                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 画面詳細設計

#### 画面1: Overview（ダッシュボード・ホーム）

**目的**: 最も重要な情報を一目で把握

**レイアウト**:
```
┌──────────────────────────────────────────────────┐
│ 【重要度：CRITICAL】                              │
│ ┌────────────────────────────────────────┐       │
│ │ 🔴 CISA KEV - 新規追加 (過去24時間)     │       │
│ │ ────────────────────────────────────── │       │
│ │ CVE-2024-XXXX | Microsoft Exchange    │       │
│ │   追加日: 2026-10-31 | 期限: 2026-11-14│       │
│ │                                        │       │
│ │ CVE-2024-YYYY | Cisco IOS XE          │       │
│ │   追加日: 2026-10-30 | 期限: 2026-11-13│       │
│ └────────────────────────────────────────┘       │
└──────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬────────────┐
│ 【最新脆弱性】    │ 【脅威トレンド】  │【速報】    │
│                  │                  │            │
│ JVN最新5件       │ TTPs Top 5       │ニュース5件 │
│ - JVN#xxx...    │ - T1566 (釣り)   │- Ransom... │
│ - JVN#xxx...    │ - T1059 (cmd)    │- APT...    │
│                  │                  │            │
└──────────────────┴──────────────────┴────────────┘

┌──────────────────────────────────────────────────┐
│ 【クイックアクション】                            │
│ [IoC検索]  [CVE検索]  [MITRE Navigator]         │
└──────────────────────────────────────────────────┘
```

**UI要素**:
- 重要度別の色分け（赤=CRITICAL、橙=HIGH、黄=MEDIUM、緑=LOW）
- ホバーで詳細情報ポップアップ
- ワンクリックで該当ソースへジャンプ
- リフレッシュボタン（全データ更新）

---

#### 画面2: 脆弱性管理（CISA KEV詳細）

```
┌──────────────────────────────────────────────────┐
│ CISA Known Exploited Vulnerabilities             │
│ [全件表示 ▼] [フィルタ: 製品名/ベンダー] [エクスポート]│
├──────────────────────────────────────────────────┤
│ CVE ID      │ 製品名         │ 追加日    │ 期限   │
├──────────────────────────────────────────────────┤
│ CVE-2024-XX │ MS Exchange   │ 10/31     │ 11/14  │
│ CVE-2024-YY │ Cisco IOS XE  │ 10/30     │ 11/13  │
│ CVE-2024-ZZ │ VMware vCenter│ 10/28     │ 11/11  │
│ ...                                              │
└──────────────────────────────────────────────────┘

[詳細パネル（選択時）]
┌──────────────────────────────────────────────────┐
│ CVE-2024-XXXXX                                   │
│ ────────────────────────────────────────────────│
│ 製品: Microsoft Exchange Server 2019            │
│ CVSS: 9.8 (Critical)                            │
│ 概要: 認証なしでのRCE脆弱性                     │
│ 悪用状況: Active exploitation detected          │
│ 対策: KB5043208適用                             │
│                                                  │
│ [NVD詳細] [ベンダーアドバイザリ] [VirusTotal]   │
└──────────────────────────────────────────────────┘
```

**機能**:
- ページネーション（25件/50件/100件表示切替）
- 複数カラムソート
- フリーテキスト検索
- CSV/JSONエクスポート
- 詳細パネルでの外部リンク

---

#### 画面3: JVN脆弱性情報

```
┌──────────────────────────────────────────────────┐
│ JVN (Japan Vulnerability Notes)                 │
│ [深刻度: 全て ▼] [期間: 過去7日間 ▼] [検索___]  │
├──────────────────────────────────────────────────┤
│ JVN ID      │ タイトル       │ 深刻度 │ 公開日  │
├──────────────────────────────────────────────────┤
│ JVNDB-2024-XXXXXX                                │
│ │ Apache Struts における認証回避の脆弱性        │
│ │ 🔴 Critical │ 2026-11-01                       │
│ ├──────────────────────────────────────────────  │
│ JVNDB-2024-YYYYYY                                │
│ │ Windows におけるリモートコード実行の脆弱性    │
│ │ 🟠 High │ 2026-10-31                           │
│ ├──────────────────────────────────────────────  │
│ ...                                              │
└──────────────────────────────────────────────────┘

[詳細パネル]
┌──────────────────────────────────────────────────┐
│ JVNDB-2024-XXXXXX                                │
│ ────────────────────────────────────────────────│
│ タイトル: Apache Struts における認証回避の脆弱性│
│ CVE: CVE-2024-XXXXX                             │
│ 深刻度: Critical (CVSS 9.8)                     │
│ 影響を受ける製品: Apache Struts 2.x - 2.5.30   │
│ 概要: Apache Strutsのファイルアップロード処理...│
│ 対策: バージョン2.5.31以降へのアップグレード    │
│                                                  │
│ [JVN詳細ページ] [NVD] [ベンダー情報]            │
└──────────────────────────────────────────────────┘
```

---

#### 画面4: NVD検索

```
┌──────────────────────────────────────────────────┐
│ NVD (National Vulnerability Database) 検索      │
├──────────────────────────────────────────────────┤
│ CVE ID: [CVE-2024-_______]  [検索]              │
│                                                  │
│ または                                           │
│                                                  │
│ 製品名: [___________________]                   │
│ CVSSスコア: [7.0] 以上                          │
│ 公開日: [2026-10-01] ～ [2026-11-01]           │
│ [詳細検索]                                       │
└──────────────────────────────────────────────────┘

[検索結果]
┌──────────────────────────────────────────────────┐
│ CVE-2024-XXXXX                  CVSS: 9.8 🔴    │
│ ────────────────────────────────────────────────│
│ 公開日: 2026-10-31                              │
│ 最終更新: 2026-11-01                            │
│                                                  │
│ 概要: Microsoft Exchange Server における        │
│       認証されていないリモートコード実行の脆弱性│
│                                                  │
│ CVSS v3.1 詳細:                                 │
│   攻撃元区分: ネットワーク                      │
│   攻撃条件の複雑さ: 低                          │
│   必要な特権レベル: なし                        │
│   利用者の関与: 不要                            │
│   機密性への影響: 高                            │
│   完全性への影響: 高                            │
│   可用性への影響: 高                            │
│                                                  │
│ 参照情報:                                        │
│   - [Microsoft Security Advisory MSRC-CVE-...]  │
│   - [Exploit-DB: PoC Available]                 │
│                                                  │
│ CWE: CWE-787 (境界外書き込み)                   │
│                                                  │
│ [NVD詳細ページ] [VirusTotal検索]                │
└──────────────────────────────────────────────────┘
```

---

#### 画面5: IoC検索・脅威インテリジェンス

```
┌──────────────────────────────────────────────────┐
│ Indicator of Compromise (IoC) 検索               │
├──────────────────────────────────────────────────┤
│ 検索タイプ: ● IP  ○ Domain  ○ Hash  ○ URL       │
│                                                  │
│ [192.168.1.100________________] [検索]           │
│                                                  │
│ ─────────────────────────────────────────────── │
│ 【検索結果】                                     │
│                                                  │
│ VirusTotal:                                      │
│   検出数: 12/93 エンジン                        │
│   カテゴリ: 🔴 Malicious                        │
│   最終分析: 2026-10-30 15:23                    │
│   コミュニティスコア: -15                       │
│   [詳細を見る]                                   │
│                                                  │
│ AbuseIPDB:                                       │
│   信頼スコア: 85% 🔴 High Risk                  │
│   報告数: 234件（過去90日間）                   │
│   最新報告: Port Scan, Brute Force              │
│   報告国: CN (45%), RU (23%), US (12%)         │
│   [詳細を見る]                                   │
│                                                  │
│ AlienVault OTX:                                  │
│   関連するPulse: 3件                             │
│   - APT28 Campaign 2024 Infrastructure          │
│   - Phishing Infrastructure - Finance Sector    │
│   - Cobalt Strike C2 Servers                    │
│   [詳細を見る]                                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 【検索履歴】                  [クリア] [エクスポート]│
│ 2026-11-01 10:25 - 192.168.1.100 🔴 Malicious  │
│ 2026-11-01 09:45 - example.com 🟢 Clean        │
│ 2026-11-01 08:30 - abc123hash... 🔴 Malicious  │
└──────────────────────────────────────────────────┘
```

**機能**:
- 複数サービスの並列検索
- 検索結果のキャッシング（重複検索の高速化）
- 検索履歴からのワンクリック再検索
- 結果のJSON/CSVエクスポート
- ブックマーク機能（要注意IoC）

---

#### 画面6: MITRE ATT&CK TTPs可視化

```
┌──────────────────────────────────────────────────┐
│ MITRE ATT&CK Tactics & Techniques               │
│ 期間: [過去7日間 ▼]  データソース: [ニュース解析]│
│ 表示: ● ヒートマップ  ○ リスト                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ [ヒートマップビュー]                             │
│                                                  │
│ Initial   Execution  Persist  Priv Esc  Defense │
│ Access                        Evasion  Cred...  │
│ ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│ │T1566│  │T1059│  │T1547│  │T1068│  │T1140│  │
│ │ 🔴 │  │ 🔴 │  │ 🟡 │  │ 🟢 │  │ 🟡 │  │
│ │ 45  │  │ 38  │  │ 12  │  │ 3   │  │ 15  │  │
│ └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │
│                                                  │
│ ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│ │T1078│  │T1204│  │T1053│  │T1055│  │T1027│  │
│ │ 🟡 │  │ 🔴 │  │ 🟡 │  │ 🟢 │  │ 🔴 │  │
│ │ 18  │  │ 32  │  │ 10  │  │ 5   │  │ 28  │  │
│ └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │
│                                                  │
│ ※色: 観測頻度（赤=高頻度, 黄=中頻度, 緑=低頻度） │
│ ※数値: 観測回数（ニュース記事・レポートから抽出）│
│                                                  │
│ [MITRE ATT&CK Navigatorで開く]                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 【詳細: T1566 - Phishing】                       │
│ ────────────────────────────────────────────────│
│ 戦術: Initial Access                            │
│ 観測回数: 45件（過去7日間）                     │
│ トレンド: ↑ +23% (先週比)                       │
│                                                  │
│ サブテクニック:                                  │
│   T1566.001 - Spearphishing Attachment (28件)  │
│   T1566.002 - Spearphishing Link (15件)        │
│   T1566.003 - Spearphishing via Service (2件)  │
│                                                  │
│ 関連APTグループ:                                 │
│   - APT28 (Fancy Bear)                          │
│   - APT29 (Cozy Bear)                           │
│   - Kimsuky                                      │
│   - TA505                                        │
│                                                  │
│ 最近の事例:                                      │
│   - "APT28 targets Eastern European..." (10/30)│
│   - "New phishing campaign uses QR codes" (10/29)│
│                                                  │
│ [MITRE ATT&CK詳細ページ] [関連ニュース]         │
└──────────────────────────────────────────────────┘
```

**機能**:
- ヒートマップビューとリストビューの切替
- 期間指定（7日間/30日間/カスタム）
- 戦術別・技術別のフィルタリング
- トレンド分析（前週比・前月比）
- MITRE ATT&CK Navigator連携（JSON出力）
- 関連ニュース記事へのリンク

---

#### 画面7: セキュリティニュースフィード

```
┌──────────────────────────────────────────────────┐
│ セキュリティニュースフィード                     │
│ [全て ▼] [未読のみ] 検索: [____________] [🔍]   │
├──────────────────────────────────────────────────┤
│ カテゴリフィルタ:                                │
│ ☑ Vulnerability  ☑ Ransomware  ☑ APT           │
│ ☑ Malware       ☑ Data Breach  ☐ その他        │
├──────────────────────────────────────────────────┤
│ 📰 BleepingComputer                              │
│ ────────────────────────────────────────────────│
│ ⚫ [NEW] Critical RCE in Apache Struts          │
│    2026-11-01 09:15 | Vulnerability            │
│    概要: Apache Struts 2に認証バイパス可能な...│
│    [続きを読む] [外部リンク] [既読にする]       │
│                                                  │
│ ○ Windows November 2024 Patch Tuesday          │
│    2026-10-31 20:00 | Patch                    │
│    概要: Microsoftが11月の月例パッチで89件の... │
│    [続きを読む] [外部リンク]                    │
│                                                  │
│ 📰 The Hacker News                               │
│ ────────────────────────────────────────────────│
│ ⚫ [NEW] LockBit 3.0 Targets Healthcare         │
│    2026-11-01 08:30 | Ransomware              │
│    概要: ランサムウェアグループLockBitが医療...│
│    [続きを読む] [外部リンク] [既読にする]       │
│                                                  │
│ ○ North Korean APT Exploits VPN Flaws          │
│    2026-10-31 18:45 | APT                      │
│    概要: 北朝鮮のAPTグループがVPN製品の脆弱性...│
│    [続きを読む] [外部リンク]                    │
│                                                  │
│ 📰 Unit 42 (Palo Alto Networks)                 │
│ ────────────────────────────────────────────────│
│ ○ APT29 Phishing Campaign Analysis             │
│    2026-10-30 15:00 | APT                      │
│    概要: APT29（Cozy Bear）の最新フィッシング...│
│    [続きを読む] [外部リンク]                    │
│                                                  │
│ 📰 ScanNetSecurity                               │
│ ────────────────────────────────────────────────│
│ ○ 国内企業でランサムウェア被害が相次ぐ         │
│    2026-10-30 12:00 | Ransomware              │
│    概要: 10月に入り、国内の製造業を中心に...   │
│    [続きを読む] [外部リンク]                    │
│                                                  │
│ [さらに読み込む（25件）]                         │
└──────────────────────────────────────────────────┘

※ ⚫=未読, ○=既読
```

**機能**:
- 複数ソースの統合フィード
- 自動更新（バックグラウンド取得）
- 既読/未読管理
- カテゴリ自動分類（キーワードベース）
- 全文検索
- お気に入り（スター）機能
- 記事のアーカイブ
- OPML形式でのフィード設定エクスポート/インポート

---

#### 画面8: クイックリンク・ツール

```
┌──────────────────────────────────────────────────┐
│ クイックリンク                   [編集] [+ 追加] │
├──────────────────────────────────────────────────┤
│ 【公式情報源】                                   │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │  CISA  │ │JPCERT/ │ │  JVN   │ │  NVD   │   │
│ │  🏛️   │ │   CC   │ │  🇯🇵   │ │  📚   │   │
│ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                  │
│ 【脅威インテリジェンス】                         │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Virus  │ │ Abuse  │ │ OTX    │ │ MITRE  │   │
│ │ Total  │ │ IPDB   │ │AlienVlt│ │ATT&CK  │   │
│ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                  │
│ 【ベンダーセキュリティ】                         │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │  MS    │ │ Cisco  │ │Fortinet│ │  Palo  │   │
│ │ MSRC   │ │Security│ │ PSIRT  │ │  Alto  │   │
│ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                  │
│ 【社内システム】                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐              │
│ │ SIEM   │ │  EDR   │ │TicketSys│             │
│ │(custom)│ │(custom)│ │(custom) │             │
│ └────────┘ └────────┘ └────────┘              │
│                                                  │
│ 【その他ツール】                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐              │
│ │CyberChef││Shodan  ││UrlScan │             │
│ │        │ │        │ │  .io   │             │
│ └────────┘ └────────┘ └────────┘              │
└──────────────────────────────────────────────────┘

[リンク追加ダイアログ]
┌──────────────────────────────────────────────────┐
│ 新しいリンクを追加                               │
├──────────────────────────────────────────────────┤
│ タイトル: [_________________________]           │
│ URL: [___________________________________]       │
│ カテゴリ: [公式情報源 ▼]                        │
│ アイコン: [🔗 選択]                              │
│                                                  │
│ [キャンセル] [保存]                              │
└──────────────────────────────────────────────────┘
```

---

#### 画面9: 設定画面

```
┌──────────────────────────────────────────────────┐
│ 設定                                             │
├──────────────────────────────────────────────────┤
│ ┌─────────────┐ メイン設定エリア                │
│ │ ■ 一般      │                                 │
│ │ ■ 通知      │ 【一般設定】                    │
│ │ ■ データ源  │                                 │
│ │ ■ 表示      │ テーマ:                         │
│ │ ■ 詳細設定  │   ● ライトモード                │
│ │             │   ○ ダークモード                │
│ │             │   ○ システムに従う              │
│ │             │                                 │
│ │             │ 言語:                           │
│ │             │   [日本語 ▼]                    │
│ │             │                                 │
│ │             │ 起動時の動作:                   │
│ │             │   ☑ システム起動時に自動起動    │
│ │             │   ☑ 最小化した状態で起動        │
│ │             │                                 │
│ └─────────────┘ 更新設定:                       │
│                   ○ 手動更新のみ                │
│                   ● 定期自動更新（バックグラウンド）│
│                   更新間隔: [60] 分             │
│                                                  │
│                   [設定を保存]                   │
└──────────────────────────────────────────────────┘

【通知設定】
┌──────────────────────────────────────────────────┐
│ デスクトップ通知: ☑ 有効                        │
│                                                  │
│ 通知する項目:                                    │
│   ☑ CISA KEV 新規追加                           │
│   ☑ Critical/High脆弱性（JVN）                  │
│   ☐ 全ての脆弱性                                │
│   ☑ キーワードマッチ（ニュース）                │
│                                                  │
│ キーワードアラート:                              │
│   [ランサムウェア, APT28, ゼロデイ, RCE]        │
│   [+ 追加]                                       │
│                                                  │
│ 通知頻度制限:                                    │
│   最大 [10] 件/時間                             │
│                                                  │
│ 音声アラート: ☐ 有効                            │
│   サウンド: [デフォルト ▼]                      │
│                                                  │
│ [設定を保存]                                     │
└──────────────────────────────────────────────────┘

【データソース設定】
┌──────────────────────────────────────────────────┐
│ API認証情報:                                     │
│                                                  │
│ VirusTotal API Key:                             │
│   [********************************] [編集]      │
│   制限: 4リクエスト/分（無料プラン）            │
│   残り: 234/1000 (今日)                         │
│                                                  │
│ AbuseIPDB API Key:                              │
│   [********************************] [編集]      │
│   制限: 1000リクエスト/日（無料プラン）         │
│   残り: 892/1000 (今日)                         │
│                                                  │
│ NVD API Key (オプション):                       │
│   [未設定] [設定]                                │
│   ※設定するとレート制限が緩和されます           │
│                                                  │
│ RSSフィード管理:                                 │
│   [フィード設定を開く]                           │
│   現在購読中: 12フィード                        │
│                                                  │
│ [設定を保存]                                     │
└──────────────────────────────────────────────────┘

【表示設定】
┌──────────────────────────────────────────────────┐
│ ダッシュボードレイアウト:                        │
│   [レイアウトをカスタマイズ]                     │
│                                                  │
│ デフォルト表示件数:                              │
│   脆弱性リスト: [25] 件                         │
│   ニュースフィード: [50] 件                     │
│                                                  │
│ 監視対象製品/ベンダー:                           │
│   ☑ Microsoft (Windows, Exchange, Office)      │
│   ☑ Cisco (IOS, ASA, Firepower)                │
│   ☑ VMware (vCenter, ESXi)                     │
│   ☑ Apache (HTTP Server, Struts, Tomcat)       │
│   ☐ Oracle (Database, Java)                    │
│   [+ 追加]                                       │
│                                                  │
│   ※チェックした製品の脆弱性は自動ハイライト     │
│                                                  │
│ [設定を保存]                                     │
└──────────────────────────────────────────────────┘

【詳細設定】
┌──────────────────────────────────────────────────┐
│ データベース:                                    │
│   保存場所: /Users/xxx/.soc-dashboard/data.db  │
│   サイズ: 45.2 MB                               │
│   [最適化] [バックアップ]                       │
│                                                  │
│ キャッシュ:                                      │
│   キャッシュサイズ: 128 MB                      │
│   保存期間: [7] 日                              │
│   [キャッシュをクリア]                           │
│                                                  │
│ ログ:                                            │
│   ログレベル: [Info ▼]                          │
│   [ログを表示]                                   │
│                                                  │
│ エクスポート/インポート:                         │
│   [設定をエクスポート]                           │
│   [設定をインポート]                             │
│                                                  │
│ リセット:                                        │
│   [全ての設定を初期化]                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 3. 技術スタックとアーキテクチャ

### 3.1 推奨技術スタック

#### フロントエンド
- **フレームワーク**: React 18+ with TypeScript 5+
  - コンポーネントベースで保守性が高い
  - 型安全性によるバグ削減
  - 豊富なエコシステム

- **ビルドツール**: Vite
  - 高速な開発サーバー
  - 最適化されたプロダクションビルド

- **UIライブラリ**:
  - **Tailwind CSS** 3+ (スタイリング)
  - **shadcn/ui** または **Material-UI** (UIコンポーネント)
  - **Recharts** または **Chart.js** (データ可視化)
  - **React Icons** (アイコン)

- **状態管理**:
  - **Zustand** または **Redux Toolkit** (グローバル状態)
  - **TanStack Query (React Query)** (サーバー状態・API通信・キャッシング)

- **ルーティング**: React Router 6+

- **フォーム管理**: React Hook Form + Zod (バリデーション)

#### バックエンド
- **ランタイム**: Node.js 20+ (LTS)

- **Webフレームワーク**: Express.js 4+ または Fastify 4+
  - 軽量で高速なAPIサーバー
  - 豊富なミドルウェア

- **データベース**:
  - **SQLite** 3+ (ローカルPC用、セットアップ不要)
  - または **PostgreSQL** (将来的なスケール対応)

- **ORM**: Prisma または TypeORM
  - 型安全なデータベースアクセス
  - マイグレーション管理

#### データ収集・統合
- **スケジューラー**: node-cron
  - 定期的な外部API呼び出し

- **RSS/Atomパーサー**: rss-parser

- **HTTP クライアント**: Axios または node-fetch

- **HTML/XMLパーサー**: cheerio (必要に応じて)

#### デスクトップアプリケーション
- **Electron** 28+
  - クロスプラットフォーム対応（Windows/Mac/Linux）
  - ローカルで完結、セキュアな環境
  - 配布が容易（単一実行ファイル化可能）

- **Electron Builder**
  - アプリケーションのパッケージング
  - インストーラー生成

#### 開発ツール
- **ESLint** + **Prettier** (コード品質・フォーマット)
- **Jest** + **React Testing Library** (テスト)
- **TypeScript** (型チェック)
- **Husky** (Git hooks)

---

### 3.2 システムアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│              Electron Desktop Application           │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │   React Frontend (Renderer Process)        │    │
│  │   ─────────────────────────────────────    │    │
│  │   - Dashboard Components                   │    │
│  │   - Data Visualization (Recharts)          │    │
│  │   - State Management (Zustand)             │    │
│  │   - API Client (React Query + Axios)       │    │
│  │   - Routing (React Router)                 │    │
│  └──────────────┬─────────────────────────────┘    │
│                 │ IPC (Inter-Process Communication)│
│                 │ (Electron API)                    │
│  ┌──────────────▼─────────────────────────────┐    │
│  │   Electron Main Process                    │    │
│  │   ─────────────────────────────────────    │    │
│  │   - Window Management                      │    │
│  │   - Native APIs (Notifications, etc.)      │    │
│  │   - Security (CSP, Context Isolation)      │    │
│  └──────────────┬─────────────────────────────┘    │
│                 │ HTTP (localhost)                  │
│  ┌──────────────▼─────────────────────────────┐    │
│  │   Express/Fastify Backend (Node.js)        │    │
│  │   ─────────────────────────────────────    │    │
│  │   - REST API Endpoints                     │    │
│  │   - Business Logic                         │    │
│  │   - Data Aggregation Service               │    │
│  │   - Background Job Scheduler (node-cron)   │    │
│  └─────┬────────────────────┬─────────────────┘    │
│        │                    │                       │
│  ┌─────▼──────────┐  ┌─────▼──────────────────┐   │
│  │   SQLite DB    │  │  External APIs Client  │   │
│  │   (Prisma ORM) │  │  ──────────────────    │   │
│  │   ──────────   │  │  - CISA KEV            │   │
│  │   Tables:      │  │  - NVD                 │   │
│  │   - articles   │  │  - JVN                 │   │
│  │   - cves       │  │  - VirusTotal          │   │
│  │   - iocs       │  │  - AbuseIPDB           │   │
│  │   - searches   │  │  - RSS Feeds           │   │
│  │   - settings   │  │  - AlienVault OTX      │   │
│  │   - bookmarks  │  └────────────────────────┘   │
│  └────────────────┘                                │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
          [External Data Sources]
          ─────────────────────
          - CISA API
          - NVD API
          - JVN API
          - VirusTotal API
          - AbuseIPDB API
          - RSS Feeds (各種メディア)
          - MITRE ATT&CK (GitHub)
```

---

### 3.3 データフロー

#### 3.3.1 データ取得フロー

```
[外部API/RSSフィード]
        ↓
[バックエンド - Data Fetcher Service]
    ├─ API Client (Axios)
    ├─ Rate Limiting
    ├─ Error Handling
    └─ Retry Logic
        ↓
[データ正規化・変換]
    ├─ 共通フォーマットへの変換
    ├─ データバリデーション
    └─ エンリッチメント（追加情報の付与）
        ↓
[SQLiteデータベースへ保存]
    ├─ INSERT/UPDATE操作
    ├─ 重複チェック
    └─ インデックス作成
        ↓
[キャッシュ更新（メモリ内）]
```

#### 3.3.2 ユーザーリクエストフロー

```
[ユーザー操作（React UI）]
        ↓
[React Query - データリクエスト]
    ├─ キャッシュチェック
    ├─ 再検証（stale判定）
    └─ Optimistic Update
        ↓
[REST API エンドポイント（Express）]
    ├─ /api/vulnerabilities/kev
    ├─ /api/vulnerabilities/jvn
    ├─ /api/threats/ioc-search
    ├─ /api/news/feed
    └─ /api/mitre/techniques
        ↓
[ビジネスロジック層]
    ├─ データ取得（DB/Cache）
    ├─ フィルタリング・ソート
    └─ ページネーション
        ↓
[レスポンス返却（JSON）]
        ↓
[React Query - キャッシュ更新]
        ↓
[UIコンポーネント再レンダリング]
```

---

### 3.4 データベーススキーマ（SQLite）

```sql
-- 脆弱性情報（CISA KEV）
CREATE TABLE cisa_kev (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id VARCHAR(20) UNIQUE NOT NULL,
    vendor_project VARCHAR(255),
    product VARCHAR(255),
    vulnerability_name TEXT,
    date_added DATE NOT NULL,
    short_description TEXT,
    required_action TEXT,
    due_date DATE,
    known_ransomware_campaign_use BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cisa_kev_cve ON cisa_kev(cve_id);
CREATE INDEX idx_cisa_kev_date_added ON cisa_kev(date_added DESC);
CREATE INDEX idx_cisa_kev_due_date ON cisa_kev(due_date);

-- JVN脆弱性情報
CREATE TABLE jvn_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jvn_id VARCHAR(50) UNIQUE NOT NULL,
    cve_id VARCHAR(20),
    title TEXT NOT NULL,
    summary TEXT,
    severity VARCHAR(20),
    cvss_score DECIMAL(3,1),
    cvss_vector VARCHAR(100),
    published_date DATE,
    last_modified_date DATE,
    affected_products TEXT, -- JSON形式
    references TEXT, -- JSON形式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jvn_id ON jvn_vulnerabilities(jvn_id);
CREATE INDEX idx_jvn_cve ON jvn_vulnerabilities(cve_id);
CREATE INDEX idx_jvn_published ON jvn_vulnerabilities(published_date DESC);

-- NVD CVE情報
CREATE TABLE nvd_cve (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id VARCHAR(20) UNIQUE NOT NULL,
    source_identifier VARCHAR(100),
    published_date TIMESTAMP,
    last_modified_date TIMESTAMP,
    vuln_status VARCHAR(50),
    description TEXT,
    cvss_v31_score DECIMAL(3,1),
    cvss_v31_severity VARCHAR(20),
    cvss_v31_vector VARCHAR(100),
    cvss_v2_score DECIMAL(3,1),
    cvss_v2_severity VARCHAR(20),
    cwe_id VARCHAR(20),
    references TEXT, -- JSON形式
    configurations TEXT, -- JSON形式（CPE情報）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nvd_cve ON nvd_cve(cve_id);
CREATE INDEX idx_nvd_published ON nvd_cve(published_date DESC);
CREATE INDEX idx_nvd_score ON nvd_cve(cvss_v31_score DESC);

-- ニュース記事
CREATE TABLE news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    link VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    author VARCHAR(255),
    source VARCHAR(100) NOT NULL, -- 'bleepingcomputer', 'thehackernews', etc.
    category VARCHAR(50), -- 'vulnerability', 'ransomware', 'apt', etc.
    published_date TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_starred BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_source ON news_articles(source);
CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_published ON news_articles(published_date DESC);
CREATE INDEX idx_news_read ON news_articles(is_read);

-- IoC検索履歴
CREATE TABLE ioc_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ioc_type VARCHAR(20) NOT NULL, -- 'ip', 'domain', 'hash', 'url'
    ioc_value VARCHAR(500) NOT NULL,
    virustotal_result TEXT, -- JSON形式
    abuseipdb_result TEXT, -- JSON形式
    otx_result TEXT, -- JSON形式
    verdict VARCHAR(20), -- 'malicious', 'suspicious', 'clean', 'unknown'
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_bookmarked BOOLEAN DEFAULT 0
);

CREATE INDEX idx_ioc_value ON ioc_searches(ioc_value);
CREATE INDEX idx_ioc_searched ON ioc_searches(searched_at DESC);

-- MITRE ATT&CK観測データ
CREATE TABLE mitre_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id VARCHAR(20) NOT NULL, -- 'T1566', etc.
    technique_name VARCHAR(255),
    tactic VARCHAR(100),
    observation_count INTEGER DEFAULT 1,
    observation_date DATE NOT NULL,
    source VARCHAR(100), -- 'news', 'report', etc.
    related_apt_groups TEXT, -- JSON形式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mitre_technique ON mitre_observations(technique_id);
CREATE INDEX idx_mitre_date ON mitre_observations(observation_date DESC);

-- クイックリンク
CREATE TABLE quick_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_links_category ON quick_links(category);
CREATE INDEX idx_links_order ON quick_links(sort_order);

-- アプリケーション設定
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON app_settings(key);

-- API認証情報（暗号化して保存）
CREATE TABLE api_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service VARCHAR(100) UNIQUE NOT NULL, -- 'virustotal', 'abuseipdb', etc.
    api_key_encrypted TEXT,
    quota_limit INTEGER,
    quota_used INTEGER DEFAULT 0,
    quota_reset_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RSSフィード設定
CREATE TABLE rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    update_interval INTEGER DEFAULT 60, -- 分単位
    last_fetched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feeds_active ON rss_feeds(is_active);
```

---

### 3.5 主要API統合リスト

#### 3.5.1 無料で利用可能なAPI

##### 1. CISA KEV
- **エンドポイント**: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
- **認証**: 不要
- **レート制限**: なし
- **データ形式**: JSON
- **更新頻度**: 不定期（新規脆弱性追加時）
- **取得推奨頻度**: 1日1回

##### 2. NVD (National Vulnerability Database)
- **エンドポイント**: `https://services.nvd.nist.gov/rest/json/cves/2.0`
- **認証**: APIキー（無料、推奨）
- **レート制限**:
  - APIキーなし: 5リクエスト/30秒、10リクエスト/30秒（burst）
  - APIキーあり: 50リクエスト/30秒、100リクエスト/30秒（burst）
- **データ形式**: JSON
- **取得推奨頻度**: 1日1回（全件）、リアルタイム（個別検索）

##### 3. JVN（Japan Vulnerability Notes）
- **エンドポイント**:
  - MyJVN API: `https://jvndb.jvn.jp/myjvn?method=getVulnOverviewList`
  - RSS: `https://jvndb.jvn.jp/ja/rss/jvndb.rdf`
- **認証**: 不要
- **レート制限**: 明示的な制限なし（常識的な範囲）
- **データ形式**: XML/RDF
- **取得推奨頻度**: 1日2-3回

##### 4. VirusTotal
- **エンドポイント**: `https://www.virustotal.com/api/v3/`
- **認証**: APIキー必須
- **レート制限**:
  - 無料プラン: 4リクエスト/分、500リクエスト/日、15.5Kリクエスト/月
  - 有料プラン: より高い制限
- **主要エンドポイント**:
  - IP検索: `/ip_addresses/{ip}`
  - ドメイン検索: `/domains/{domain}`
  - ファイルハッシュ検索: `/files/{hash}`
  - URL検索: `/urls/{url_id}`
- **データ形式**: JSON
- **備考**: レート制限に注意、キャッシング必須

##### 5. AbuseIPDB
- **エンドポイント**: `https://api.abuseipdb.com/api/v2/`
- **認証**: APIキー必須
- **レート制限**:
  - 無料プラン: 1000リクエスト/日
  - 有料プラン: より高い制限
- **主要エンドポイント**:
  - IP検索: `/check`
  - バルク検索: `/check-block`
  - レポート: `/report`
- **データ形式**: JSON

##### 6. AlienVault OTX (Open Threat Exchange)
- **エンドポイント**: `https://otx.alienvault.com/api/v1/`
- **認証**: APIキー必須（無料登録）
- **レート制限**: 明示的な制限なし
- **主要エンドポイント**:
  - Indicator検索: `/indicators/{type}/{indicator}/general`
  - Pulse検索: `/pulses/subscribed`
- **データ形式**: JSON

##### 7. MITRE ATT&CK
- **データソース**: GitHub Repository
- **URL**: `https://github.com/mitre/cti`
- **認証**: 不要
- **データ形式**: STIX 2.0 JSON
- **取得方法**:
  - GitHub API経由で最新データ取得
  - ローカルにキャッシュして使用
- **更新頻度**: 四半期ごと（公式）、取得は1週間に1回程度

##### 8. RSSフィード一覧

| ソース | URL | カテゴリ |
|--------|-----|----------|
| BleepingComputer | `https://www.bleepingcomputer.com/feed/` | ニュース（総合） |
| The Hacker News | `https://feeds.feedburner.com/TheHackersNews` | ニュース（総合） |
| Dark Reading | `https://www.darkreading.com/rss.xml` | ニュース（総合） |
| KrebsOnSecurity | `https://krebsonse curity.com/feed/` | ニュース（調査報道） |
| ScanNetSecurity | `https://scan.netsecurity.ne.jp/rss/index.rdf` | ニュース（国内） |
| Unit 42 | `https://unit42.paloaltonetworks.com/feed/` | 脅威インテリジェンス |
| Microsoft Security | `https://www.microsoft.com/security/blog/feed/` | ベンダーブログ |
| Google Cloud Threat Intelligence | `https://blog.google/threat-analysis-group/rss/` | 脅威インテリジェンス |
| Kaspersky Securelist | `https://securelist.com/feed/` | 脅威インテリジェンス |
| Trend Micro Research | `https://www.trendmicro.com/en_us/research.rss.xml` | 脅威インテリジェンス |

---

### 3.6 エラーハンドリング・リトライ戦略

#### API呼び出し時のエラー処理

```typescript
// 例: Exponential Backoff + Retry
async function fetchWithRetry(
  url: string,
  options: RequestOptions,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // レート制限エラーの場合は長めに待機
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        await sleep(retryAfter * 1000);
      } else {
        // Exponential Backoff
        await sleep(Math.pow(2, i) * 1000);
      }
    }
  }
}
```

#### ユーザーへのエラー通知

- **ネットワークエラー**: 「インターネット接続を確認してください」
- **APIレート制限**: 「API制限に達しました。[X]分後に再試行してください」
- **認証エラー**: 「APIキーが無効です。設定を確認してください」
- **サーバーエラー**: 「一時的なエラーが発生しました。しばらくしてから再試行してください」

---

## 4. 実装ロードマップ

### フェーズ1: MVP（Minimum Viable Product）

**目標**: 基本的な機能を持つデスクトップアプリケーションの完成

**実装内容**:
1. **基本セットアップ**
   - Electron + React + TypeScript環境構築
   - Vite設定
   - ESLint/Prettier設定

2. **データ基盤**
   - SQLiteデータベースセットアップ
   - Prismaスキーマ定義・マイグレーション
   - 基本的なCRUD操作

3. **API統合（第1弾）**
   - CISA KEV データ取得・保存
   - JVN RSSフィード取得・パース
   - セキュリティニュースRSSフィード（2-3ソース）

4. **UI実装（第1弾）**
   - サイドバーナビゲーション
   - Overviewダッシュボード（シンプル版）
   - CISA KEV一覧表示
   - JVN一覧表示
   - ニュースフィード表示（基本）

5. **Electronアプリ化**
   - メインプロセス・レンダラープロセス分離
   - IPC通信設定
   - ウィンドウ管理
   - 開発環境でのデバッグ

**成果物**:
- 起動可能なデスクトップアプリケーション
- CISA KEV、JVN、ニュースの表示

**技術的な焦点**:
- React + TypeScriptの基盤構築
- SQLiteデータベースのスキーマ設計
- 基本的なAPI統合パターンの確立

---

### フェーズ2: 脅威インテリジェンス機能

**目標**: IoC検索とMITRE ATT&CKマッピング機能の実装

**実装内容**:
1. **API統合（第2弾）**
   - VirusTotal API統合
   - AbuseIPDB API統合
   - AlienVault OTX API統合（オプション）
   - NVD API統合

2. **IoC検索機能**
   - 検索UI（IP/Domain/Hash/URL）
   - マルチソース検索
   - 結果の統合表示
   - 検索履歴の保存・管理

3. **MITRE ATT&CK機能**
   - MITRE ATT&CKデータの取得・保存
   - ヒートマップ可視化
   - TTPs詳細表示
   - ニュースからのTTPs抽出（キーワードベース）

4. **NVD検索機能**
   - CVE検索UI
   - 詳細情報表示
   - フィルタリング・ソート

**成果物**:
- 実用的なIoC検索ツール
- MITRE ATT&CKマッピング
- NVD統合

---

### フェーズ3: UX改善・高度な機能

**目標**: ユーザビリティとカスタマイズ性の向上

**実装内容**:
1. **通知機能**
   - Electron通知API統合
   - 通知設定UI
   - キーワードアラート

2. **カスタマイズ機能**
   - ダッシュボードレイアウト編集（ドラッグ&ドロップ）
   - ウィジェット表示/非表示切替
   - 監視対象製品の登録・管理
   - テーマ設定（ライト/ダーク）

3. **レポート出力機能**
   - 日次サマリー生成
   - 週次トレンドレポート
   - PDF/HTML出力

4. **設定画面**
   - API認証情報管理（暗号化保存）
   - RSSフィード管理
   - 表示設定
   - データベース管理（バックアップ・最適化）

5. **パフォーマンス最適化**
   - React Query活用（キャッシング）
   - 仮想スクロール（長いリスト）
   - レイジーローディング
   - バックグラウンドデータ取得

**成果物**:
- 高度にカスタマイズ可能なダッシュボード
- 実用的な通知機能
- レポート出力

---

### フェーズ4: 配布準備・ポリッシュ

**目標**: 一般配布可能なレベルへの仕上げ

**実装内容**:
1. **パッケージング**
   - Electron Builderセットアップ
   - Windows/Mac/Linux用インストーラー生成
   - コード署名（オプション）
   - 自動アップデート機能（オプション）

2. **エラーハンドリング強化**
   - 全API呼び出しのエラー処理
   - オフラインモード対応
   - ユーザーフレンドリーなエラーメッセージ

3. **テスト**
   - ユニットテスト（重要な関数）
   - 統合テスト（API統合）
   - E2Eテスト（Playwright）

4. **ドキュメント**
   - ユーザーマニュアル
   - インストール手順
   - トラブルシューティング
   - API設定ガイド

5. **セキュリティ強化**
   - Content Security Policy (CSP)
   - Context Isolation
   - Node Integration無効化
   - API認証情報の安全な保管

**成果物**:
- 配布可能なインストーラー
- 完全なドキュメント
- セキュアなアプリケーション

---

### フェーズ5: 将来拡張（オプション）

**実装内容**:
1. SIEM/EDRログ連携プラグインインターフェース
2. チーム共有機能（クラウド同期）
3. AI活用（要約、推薦、異常検知）
4. Webhook連携（Slack/Teams）
5. モバイル版（React Native）

---

## 5. 非機能要件

### 5.1 パフォーマンス

| 項目 | 目標値 | 測定方法 |
|------|--------|----------|
| 初回起動時間 | 5秒以内 | アプリ起動からUI表示まで |
| データ更新（手動リフレッシュ） | 10秒以内 | 全データソースの取得完了まで |
| UI応答性 | 100ms以内 | ユーザー操作から画面更新まで |
| メモリ使用量 | 500MB以下 | アイドル状態 |
| データベースクエリ | 50ms以内 | 95パーセンタイル |

### 5.2 セキュリティ

- **API認証情報の保護**:
  - Electronの`safeStorage` APIを使用した暗号化
  - 環境変数からの読み込み禁止

- **通信のセキュリティ**:
  - HTTPS通信の強制
  -証明書検証の実施

- **コードセキュリティ**:
  - SQL インジェクション対策（Prisma ORMの使用）
  - XSS対策（React自動エスケープ）
  - Context Isolation有効化
  - Node Integration無効化
  - CSP (Content Security Policy)設定

### 5.3 可用性

- **オフライン対応**:
  - キャッシュデータの表示（最終取得データ）
  - オフライン状態の明示
  - 再接続時の自動同期

- **エラーハンドリング**:
  - グレースフルなエラー処理
  - ユーザーフレンドリーなエラーメッセージ
  - エラーログの記録

- **データ整合性**:
  - トランザクション処理
  - 定期的なデータベース整合性チェック
  - バックアップ機能

### 5.4 保守性

- **コード品質**:
  - TypeScriptによる型安全性
  - ESLint/Prettierによるコード規約
  - コンポーネント単位のモジュール化

- **テスト**:
  - ユニットテスト（主要な関数）
  - 統合テスト（API統合）
  - E2Eテスト（主要なユーザーフロー）

- **ドキュメント**:
  - コード内コメント（複雑なロジックのみ）
  - README.md
  - API仕様書
  - アーキテクチャドキュメント

### 5.5 互換性

- **対応OS**:
  - Windows 10/11
  - macOS 11 (Big Sur) 以降
  - Ubuntu 20.04 以降（Linux）

- **画面解像度**:
  - 最小: 1280x720
  - 推奨: 1920x1080以上

---

## 6. プロジェクト構成（推奨）

```
soc-dashboard/
├── electron/                   # Electronメインプロセス
│   ├── main.ts                 # メインエントリーポイント
│   ├── preload.ts              # プリロードスクリプト
│   └── ipc/                    # IPC handlers
│       ├── notifications.ts
│       └── storage.ts
│
├── src/                        # Reactフロントエンド
│   ├── components/             # UIコンポーネント
│   │   ├── common/             # 共通コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   ├── layout/             # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── Dashboard/          # ダッシュボード
│   │   │   ├── Overview.tsx
│   │   │   ├── CriticalAlerts.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── Vulnerabilities/    # 脆弱性管理
│   │   │   ├── CISAKEVList.tsx
│   │   │   ├── JVNList.tsx
│   │   │   ├── NVDSearch.tsx
│   │   │   └── VulnDetailPanel.tsx
│   │   ├── ThreatIntel/        # 脅威インテリジェンス
│   │   │   ├── IoCSearch.tsx
│   │   │   ├── MITREHeatmap.tsx
│   │   │   ├── TTPs.tsx
│   │   │   └── SearchHistory.tsx
│   │   ├── News/               # ニュースフィード
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── NewsItem.tsx
│   │   │   └── NewsFilters.tsx
│   │   ├── Tools/              # ツール
│   │   │   ├── QuickLinks.tsx
│   │   │   └── LinkManager.tsx
│   │   └── Settings/           # 設定
│   │       ├── GeneralSettings.tsx
│   │       ├── NotificationSettings.tsx
│   │       ├── DataSourceSettings.tsx
│   │       └── DisplaySettings.tsx
│   │
│   ├── services/               # API通信ロジック
│   │   ├── api/
│   │   │   ├── cisaApi.ts
│   │   │   ├── jvnApi.ts
│   │   │   ├── nvdApi.ts
│   │   │   ├── virusTotalApi.ts
│   │   │   ├── abuseIpDbApi.ts
│   │   │   ├── otxApi.ts
│   │   │   └── rssParser.ts
│   │   ├── database/
│   │   │   └── dbClient.ts     # Prisma client
│   │   └── electron/
│   │       └── ipcClient.ts    # IPC通信クライアント
│   │
│   ├── store/                  # 状態管理
│   │   ├── useAppStore.ts      # Zustand store
│   │   └── queries/            # React Query hooks
│   │       ├── useVulnerabilities.ts
│   │       ├── useThreatIntel.ts
│   │       └── useNews.ts
│   │
│   ├── types/                  # TypeScript型定義
│   │   ├── vulnerability.ts
│   │   ├── threat.ts
│   │   ├── news.ts
│   │   └── settings.ts
│   │
│   ├── utils/                  # ユーティリティ関数
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   ├── hooks/                  # カスタムフック
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useNotification.ts
│   │
│   ├── App.tsx                 # Appコンポーネント
│   ├── main.tsx                # Reactエントリーポイント
│   └── index.css               # グローバルスタイル
│
├── server/                     # Expressバックエンド
│   ├── index.ts                # サーバーエントリーポイント
│   ├── routes/                 # ルート定義
│   │   ├── vulnerabilities.ts
│   │   ├── threats.ts
│   │   ├── news.ts
│   │   └── settings.ts
│   ├── controllers/            # ビジネスロジック
│   │   ├── vulnerabilityController.ts
│   │   ├── threatController.ts
│   │   └── newsController.ts
│   ├── services/               # データ取得・加工
│   │   ├── fetchers/
│   │   │   ├── cisaFetcher.ts
│   │   │   ├── jvnFetcher.ts
│   │   │   └── rssFetcher.ts
│   │   └── scheduler.ts        # cron jobs
│   ├── middleware/             # Express middleware
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   └── database/
│       ├── schema.sql          # SQLスキーマ
│       └── seed.ts             # 初期データ
│
├── prisma/                     # Prisma ORM
│   ├── schema.prisma           # データベーススキーマ
│   └── migrations/             # マイグレーションファイル
│
├── public/                     # 静的ファイル
│   ├── icons/
│   └── images/
│
├── docs/                       # ドキュメント
│   ├── requirements-and-design.md
│   ├── api-integration-guide.md
│   └── user-manual.md
│
├── tests/                      # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                # 環境変数サンプル
├── .eslintrc.js                # ESLint設定
├── .prettierrc                 # Prettier設定
├── package.json
├── tsconfig.json               # TypeScript設定
├── tsconfig.node.json
├── vite.config.ts              # Vite設定
├── electron-builder.yml        # Electron Builder設定
└── README.md
```

---

## 7. 次のステップ

このドキュメントを基に、以下の順序で実装を進めることを推奨します:

1. **環境セットアップ**
   - Node.js/npm/pnpm インストール
   - プロジェクト初期化
   - 依存パッケージインストール

2. **フェーズ1（MVP）の実装**
   - 基本的なElectron + React環境構築
   - データベース設計・実装
   - CISA KEV統合
   - 基本UI実装

3. **テスト・フィードバック**
   - ローカル環境での動作確認
   - ユーザビリティテスト

4. **フェーズ2以降の実装**
   - 段階的に機能追加

---

## 付録: 参考リンク

### 公式ドキュメント
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [Prisma](https://www.prisma.io/)
- [TanStack Query (React Query)](https://tanstack.com/query/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

### APIドキュメント
- [CISA KEV Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [NVD API Documentation](https://nvd.nist.gov/developers/vulnerabilities)
- [JVN MyJVN API](https://jvndb.jvn.jp/apis/myjvn/)
- [VirusTotal API v3](https://developers.virustotal.com/reference/overview)
- [AbuseIPDB API](https://docs.abuseipdb.com/)
- [AlienVault OTX API](https://otx.alienvault.com/api)
- [MITRE ATT&CK](https://attack.mitre.org/)

---

**バージョン**: 1.0
**最終更新日**: 2026-11-01
**作成者**: SOCダッシュボードプロジェクトチーム
