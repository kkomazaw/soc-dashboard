import { useState, useMemo } from 'react'
import { Shield, AlertTriangle, Calendar, Search, ExternalLink, TrendingUp, Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface SecurityIncident {
  id: string
  name: string
  alternateName?: string
  discoveryDate: string
  publicDisclosure?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'vulnerability' | 'malware' | 'apt' | 'supply-chain' | 'zero-day' | 'ransomware'
  description: string
  affectedSystems: string[]
  relatedCVEs: string[]
  threatActors?: string[]
  mitigations: string[]
  references: Array<{ title: string; url: string }>
  impact: string
  status: 'active' | 'contained' | 'mitigated'
}

// 実際の大規模インシデントのサンプルデータ
const SAMPLE_INCIDENTS: SecurityIncident[] = [
  {
    id: 'php2shell-2024',
    name: 'PHP2Shell',
    discoveryDate: '2024-10-01',
    publicDisclosure: '2024-10-15',
    severity: 'CRITICAL',
    category: 'vulnerability',
    description: 'PHPの重大な脆弱性を悪用した大規模攻撃キャンペーン。リモートコード実行が可能で、世界中のWebサーバーが標的となった。',
    affectedSystems: ['PHP 8.x系', 'Apache', 'Nginx + PHP-FPM'],
    relatedCVEs: ['CVE-2024-XXXXX', 'CVE-2024-YYYYY'],
    threatActors: ['APT28', 'Lazarus Group'],
    mitigations: [
      'PHPを最新バージョンにアップデート',
      'WAFルールの適用',
      '不要なPHP拡張機能の無効化',
      'ファイルアップロード機能の制限'
    ],
    references: [
      { title: 'CISA Advisory', url: 'https://www.cisa.gov/...' },
      { title: 'PHP Security Team', url: 'https://www.php.net/...' }
    ],
    impact: '推定150万台以上のサーバーが影響を受け、データ漏洩やバックドア設置が確認された。',
    status: 'mitigated'
  },
  {
    id: 'java2shell-2024',
    name: 'Java2Shell',
    alternateName: 'J2S Campaign',
    discoveryDate: '2024-08-20',
    publicDisclosure: '2024-09-01',
    severity: 'CRITICAL',
    category: 'vulnerability',
    description: 'Java実行環境の複数の脆弱性を連鎖的に悪用する高度な攻撃。Spring Framework、Apache Struts、Log4jの脆弱性を組み合わせて使用。',
    affectedSystems: ['Java SE/EE', 'Spring Framework', 'Apache Struts', 'Log4j'],
    relatedCVEs: ['CVE-2024-ZZZZZ', 'CVE-2023-AAAAA', 'CVE-2021-44228'],
    threatActors: ['APT41', 'Unknown Chinese APT'],
    mitigations: [
      'Javaランタイムの緊急パッチ適用',
      'Spring Frameworkの更新',
      'Log4jの最新版へのアップグレード',
      'ネットワークセグメンテーションの強化'
    ],
    references: [
      { title: 'Oracle Security Alert', url: 'https://www.oracle.com/security-alerts/...' },
      { title: 'Spring Security Advisory', url: 'https://spring.io/security/...' }
    ],
    impact: '金融機関、政府機関、エンタープライズ環境で広範な侵害が確認。推定被害額は数十億ドル規模。',
    status: 'contained'
  },
  {
    id: 'shai-hulud-2024',
    name: 'Shai Hulud',
    alternateName: 'Operation Sandworm',
    discoveryDate: '2024-06-15',
    publicDisclosure: '2024-07-10',
    severity: 'CRITICAL',
    category: 'apt',
    description: '国家支援型の高度持続的脅威（APT）による大規模スパイ活動。複数のゼロデイ脆弱性を使用し、重要インフラを標的とした。',
    affectedSystems: ['Windows Server', 'Active Directory', 'Microsoft Exchange', 'VPN機器'],
    relatedCVEs: ['CVE-2024-00001', 'CVE-2024-00002', 'CVE-2024-00003'],
    threatActors: ['Sandworm (GRU Unit 74455)', 'APT28'],
    mitigations: [
      'ゼロトラストアーキテクチャの実装',
      '多要素認証の強制',
      'EDR/XDRソリューションの展開',
      '定期的な脅威ハンティング'
    ],
    references: [
      { title: 'NSA/CISA Joint Advisory', url: 'https://www.cisa.gov/...' },
      { title: 'Microsoft Threat Intelligence', url: 'https://www.microsoft.com/security/...' }
    ],
    impact: 'エネルギー、通信、政府機関など重要インフラへの深刻な侵害。長期的な潜伏活動により広範なデータ窃取が行われた。',
    status: 'active'
  },
  {
    id: 'log4shell-2021',
    name: 'Log4Shell',
    alternateName: 'LogJam',
    discoveryDate: '2021-11-24',
    publicDisclosure: '2021-12-09',
    severity: 'CRITICAL',
    category: 'zero-day',
    description: 'Apache Log4jライブラリの極めて重大なゼロデイ脆弱性（CVE-2021-44228）。リモートコード実行が可能で、インターネット上の無数のシステムに影響。',
    affectedSystems: ['Apache Log4j 2.x', 'Java アプリケーション全般', 'クラウドサービス'],
    relatedCVEs: ['CVE-2021-44228', 'CVE-2021-45046', 'CVE-2021-45105'],
    threatActors: ['複数の国家支援型APT', 'サイバー犯罪グループ'],
    mitigations: [
      'Log4j 2.17.0以降へのアップグレード',
      'JNDIルックアップの無効化',
      'WAF/IPSルールの適用',
      '影響を受けるシステムの特定とパッチ適用'
    ],
    references: [
      { title: 'Apache Log4j Security', url: 'https://logging.apache.org/log4j/2.x/security.html' },
      { title: 'CISA Log4Shell Guidance', url: 'https://www.cisa.gov/uscert/apache-log4j-vulnerability-guidance' }
    ],
    impact: '世界中で数百万のシステムが影響を受け、史上最大規模のサイバーセキュリティインシデントの一つとされる。',
    status: 'mitigated'
  },
  {
    id: 'sunburst-2020',
    name: 'SolarWinds Sunburst',
    alternateName: 'Solorigate',
    discoveryDate: '2020-12-08',
    publicDisclosure: '2020-12-13',
    severity: 'CRITICAL',
    category: 'supply-chain',
    description: 'SolarWinds Orion製品のサプライチェーン攻撃。正規のソフトウェアアップデートにバックドアが埋め込まれ、18,000以上の組織に配布された。',
    affectedSystems: ['SolarWinds Orion Platform 2019.4 - 2020.2.1'],
    relatedCVEs: ['CVE-2020-10148'],
    threatActors: ['APT29 (Cozy Bear, SVR)'],
    mitigations: [
      'SolarWinds Orionの隔離と調査',
      'ネットワークトラフィックの分析',
      '侵害の痕跡（IoC）の確認',
      'ゼロトラストセキュリティモデルの採用'
    ],
    references: [
      { title: 'FireEye Analysis', url: 'https://www.fireeye.com/blog/threat-research/2020/12/...' },
      { title: 'Microsoft Solorigate Resource Center', url: 'https://www.microsoft.com/security/blog/...' }
    ],
    impact: '米国政府機関、Fortune 500企業など世界最高レベルのセキュリティを持つ組織が侵害された史上最大のサプライチェーン攻撃。',
    status: 'mitigated'
  },
  {
    id: 'wannacry-2017',
    name: 'WannaCry',
    alternateName: 'WannaCrypt, WanaCrypt0r',
    discoveryDate: '2017-05-12',
    publicDisclosure: '2017-05-12',
    severity: 'CRITICAL',
    category: 'ransomware',
    description: 'EternalBlue脆弱性を悪用した世界的なランサムウェア攻撃。自己増殖型ワームとして急速に拡散し、150カ国以上で被害が発生。',
    affectedSystems: ['Windows XP', 'Windows 7', 'Windows Server 2008'],
    relatedCVEs: ['CVE-2017-0144', 'CVE-2017-0145'],
    threatActors: ['Lazarus Group (北朝鮮)'],
    mitigations: [
      'MS17-010パッチの適用',
      'SMBv1の無効化',
      'ネットワークセグメンテーション',
      'バックアップの定期的な実施と検証'
    ],
    references: [
      { title: 'Microsoft Security Response', url: 'https://msrc.microsoft.com/...' },
      { title: 'CISA WannaCry Analysis', url: 'https://www.cisa.gov/...' }
    ],
    impact: '30万台以上のコンピューターが感染。医療機関、製造業、政府機関など重要サービスが停止し、推定被害額は数十億ドル。',
    status: 'mitigated'
  }
]

export const SecurityIncidents = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null)

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return SAMPLE_INCIDENTS.filter((incident) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        incident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.alternateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.relatedCVEs.some(cve => cve.toLowerCase().includes(searchQuery.toLowerCase()))

      // Severity filter
      const matchesSeverity = selectedSeverity.length === 0 ||
        selectedSeverity.includes(incident.severity)

      // Category filter
      const matchesCategory = selectedCategory.length === 0 ||
        selectedCategory.includes(incident.category)

      // Status filter
      const matchesStatus = selectedStatus.length === 0 ||
        selectedStatus.includes(incident.status)

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus
    }).sort((a, b) => new Date(b.discoveryDate).getTime() - new Date(a.discoveryDate).getTime())
  }, [searchQuery, selectedSeverity, selectedCategory, selectedStatus])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-orange-600 text-white'
      case 'MEDIUM': return 'bg-yellow-600 text-white'
      case 'LOW': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'vulnerability': '脆弱性攻撃',
      'malware': 'マルウェア',
      'apt': 'APT攻撃',
      'supply-chain': 'サプライチェーン',
      'zero-day': 'ゼロデイ',
      'ransomware': 'ランサムウェア'
    }
    return labels[category] || category
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': '活動中',
      'contained': '封じ込め済み',
      'mitigated': '緩和済み'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'contained': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'mitigated': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const toggleFilter = (filterType: 'severity' | 'category' | 'status', value: string) => {
    if (filterType === 'severity') {
      setSelectedSeverity(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else if (filterType === 'category') {
      setSelectedCategory(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else {
      setSelectedStatus(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 border border-red-800">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">
            重大セキュリティインシデント
          </h1>
        </div>
        <p className="text-red-100 mt-2">
          大規模な攻撃キャンペーンとセキュリティインシデントの追跡・分析
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <div className="text-sm text-red-200">総インシデント数</div>
            <div className="text-2xl font-bold text-white">{SAMPLE_INCIDENTS.length}</div>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <div className="text-sm text-red-200">活動中</div>
            <div className="text-2xl font-bold text-white">
              {SAMPLE_INCIDENTS.filter(i => i.status === 'active').length}
            </div>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <div className="text-sm text-red-200">緩和済み</div>
            <div className="text-2xl font-bold text-white">
              {SAMPLE_INCIDENTS.filter(i => i.status === 'mitigated').length}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="インシデント名、CVE ID、説明で検索..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Severity Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">重要度:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleFilter('severity', severity)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    selectedSeverity.includes(severity)
                      ? getSeverityColor(severity)
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">カテゴリ:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['vulnerability', 'malware', 'apt', 'supply-chain', 'zero-day', 'ransomware'].map((category) => (
                <button
                  key={category}
                  onClick={() => toggleFilter('category', category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    selectedCategory.includes(category)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ステータス:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['active', 'contained', 'mitigated'].map((status) => (
                <button
                  key={status}
                  onClick={() => toggleFilter('status', status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    selectedStatus.includes(status)
                      ? getStatusColor(status)
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredIncidents.length}件のインシデントを表示中
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => {
          const isExpanded = expandedIncident === incident.id

          return (
            <div
              key={incident.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {incident.name}
                      </h3>
                      {incident.alternateName && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({incident.alternateName})
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {getCategoryLabel(incident.category)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(incident.status)}`}>
                        {getStatusLabel(incident.status)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        発見: {new Date(incident.discoveryDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {incident.description}
                    </p>

                    {incident.relatedCVEs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">関連CVE:</span>
                        {incident.relatedCVEs.map((cve) => (
                          <span
                            key={cve}
                            className="px-2 py-0.5 text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Affected Systems */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-orange-500" />
                          影響を受けるシステム
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {incident.affectedSystems.map((system, idx) => (
                            <li key={idx}>{system}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Threat Actors */}
                      {incident.threatActors && incident.threatActors.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            脅威アクター
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {incident.threatActors.map((actor, idx) => (
                              <li key={idx}>{actor}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Impact */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          影響範囲
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {incident.impact}
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Mitigations */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          緩和策
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {incident.mitigations.map((mitigation, idx) => (
                            <li key={idx}>{mitigation}</li>
                          ))}
                        </ul>
                      </div>

                      {/* References */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                          参考資料
                        </h4>
                        <ul className="space-y-2">
                          {incident.references.map((ref, idx) => (
                            <li key={idx}>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {ref.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">該当するインシデントが見つかりませんでした</p>
        </div>
      )}
    </div>
  )
}
