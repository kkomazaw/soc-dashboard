// X (Twitter) Security Accounts
export interface TwitterAccount {
  username: string
  displayName: string
  category: string
  description: string
}

export const TWITTER_ACCOUNTS: TwitterAccount[] = [
  // 1. 脆弱性・速報ボット（最速検知向け）
  {
    username: 'CISAGov',
    displayName: 'CISA',
    category: '脆弱性・速報ボット',
    description: '米CISA（サイバーセキュリティ・インフラセキュリティ庁）の公式',
  },
  {
    username: 'CISAKev',
    displayName: 'CISA KEV',
    category: '脆弱性・速報ボット',
    description: '悪用確認済み脆弱性（KEV）の更新通知',
  },
  {
    username: 'CVEnew',
    displayName: 'CVE Updates',
    category: '脆弱性・速報ボット',
    description: 'MITREが管理する新しいCVE識別番号の割り当て・更新',
  },
  {
    username: 'vulmonfeed',
    displayName: 'Vulmon',
    category: '脆弱性・速報ボット',
    description: '新たなエクスプロイトコード（PoC）公開の検知',
  },

  // 2. 国内の公式機関・信頼できる専門アナリスト
  {
    username: 'jpcert',
    displayName: 'JPCERT/CC',
    category: '国内公式機関',
    description: '国内のインシデント対応調整機関',
  },
  {
    username: 'IPAjp',
    displayName: 'IPA',
    category: '国内公式機関',
    description: '情報処理推進機構',
  },
  {
    username: 'piyokango',
    displayName: 'piyokango',
    category: '国内専門アナリスト',
    description: '国内のインシデント動向の網羅的な観測',
  },
  {
    username: 'ninoseki',
    displayName: 'ninoseki',
    category: '国内専門アナリスト',
    description: 'ダークウェブや脅威アクターの動向観測',
  },

  // 3. 海外の主要セキュリティ企業・リサーチ機関
  {
    username: 'TalosSecurity',
    displayName: 'Cisco Talos',
    category: '海外セキュリティ企業',
    description: '世界最大規模の民間脅威インテリジェンス組織',
  },
  {
    username: 'Unit42_Intel',
    displayName: 'Unit 42',
    category: '海外セキュリティ企業',
    description: 'Palo Alto Networks - APTグループの活動分析',
  },
  {
    username: 'Mandiant',
    displayName: 'Mandiant',
    category: '海外セキュリティ企業',
    description: 'Google Cloud Mandiant - APT動向分析',
  },
  {
    username: 'ThreatIntel',
    displayName: 'Google Threat Intel',
    category: '海外セキュリティ企業',
    description: 'Google Cloud Threat Intelligence',
  },
  {
    username: 'msftsecintel',
    displayName: 'Microsoft Security',
    category: '海外セキュリティ企業',
    description: 'Microsoft Security Threat Intelligence',
  },
  {
    username: 'vxunderground',
    displayName: 'vx-underground',
    category: '海外セキュリティ企業',
    description: 'マルウェアサンプル収集・侵害速報',
  },

  // 4. 著名グローバルリサーチャー・専門記者
  {
    username: 'briankrebs',
    displayName: 'Brian Krebs',
    category: 'グローバルリサーチャー',
    description: '著名な調査報道ジャーナリスト',
  },
  {
    username: 'GossiTheDog',
    displayName: 'Kevin Beaumont',
    category: 'グローバルリサーチャー',
    description: '元Microsoft - 脆弱性の実際の悪用状況',
  },
  {
    username: 'FlorianRoth',
    displayName: 'Florian Roth',
    category: 'グローバルリサーチャー',
    description: 'Sigmaルールの作者 - 検知ルール即日公開',
  },
]

export const TWITTER_CATEGORIES = [
  '脆弱性・速報ボット',
  '国内公式機関',
  '国内専門アナリスト',
  '海外セキュリティ企業',
  'グローバルリサーチャー',
] as const

export type TwitterCategory = typeof TWITTER_CATEGORIES[number]
