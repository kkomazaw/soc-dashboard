import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, AlertTriangle, Calendar, Search, ExternalLink, TrendingUp, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { fetchSecurityIncidents, type SecurityIncident } from '@/services/api/securityIncidentsApi'

export const SecurityIncidents = () => {
  // Fetch security incidents from API
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: fetchSecurityIncidents,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null)

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (!incidents) return []

    return incidents.filter((incident) => {
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
  }, [incidents, searchQuery, selectedSeverity, selectedCategory, selectedStatus])

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-gray-100 font-semibold">データの読み込みに失敗しました</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : '不明なエラーが発生しました'}
          </p>
        </div>
      </div>
    )
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
            <div className="text-2xl font-bold text-white">{incidents?.length || 0}</div>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <div className="text-sm text-red-200">活動中</div>
            <div className="text-2xl font-bold text-white">
              {incidents?.filter(i => i.status === 'active').length || 0}
            </div>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <div className="text-sm text-red-200">緩和済み</div>
            <div className="text-2xl font-bold text-white">
              {incidents?.filter(i => i.status === 'mitigated').length || 0}
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
