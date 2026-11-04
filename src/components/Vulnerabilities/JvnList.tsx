import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ExternalLink,
  TrendingUp,
} from 'lucide-react'
import { getJvnVulnerabilities, refreshJvnData } from '@/services/api/jvnApi'
import { ExportButton } from '../common/ExportButton'
import { exportJvn } from '@/services/api/exportApi'

export const JvnList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jvn-vulnerabilities'],
    queryFn: getJvnVulnerabilities,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshJvnData()
      await refetch()
    } catch (err) {
      console.error('Failed to refresh JVN data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    await exportJvn(format)
  }

  const getSeverityColor = (severity: string | null): string => {
    if (!severity) return 'bg-gray-100 text-gray-700'
    const lowerSeverity = severity.toLowerCase()
    if (lowerSeverity.includes('緊急') || lowerSeverity.includes('critical')) {
      return 'bg-red-100 text-red-700'
    }
    if (lowerSeverity.includes('重要') || lowerSeverity.includes('high')) {
      return 'bg-orange-100 text-orange-700'
    }
    if (lowerSeverity.includes('警告') || lowerSeverity.includes('medium')) {
      return 'bg-yellow-100 text-yellow-700'
    }
    if (lowerSeverity.includes('注意') || lowerSeverity.includes('low')) {
      return 'bg-blue-100 text-blue-700'
    }
    return 'bg-gray-100 text-gray-700'
  }

  const getCvssColor = (score: number | null): string => {
    if (!score) return 'text-gray-600'
    if (score >= 9.0) return 'text-red-600 font-bold'
    if (score >= 7.0) return 'text-orange-600 font-bold'
    if (score >= 4.0) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredVulnerabilities = data?.data.filter((vuln) => {
    const matchesSearch =
      searchTerm === '' ||
      vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.jvnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vuln.cveId && vuln.cveId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vuln.summary && vuln.summary.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSeverity =
      severityFilter === 'all' ||
      (vuln.severity && vuln.severity.includes(severityFilter))

    return matchesSearch && matchesSeverity
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Error loading JVN data</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JVN 脆弱性情報</h2>
          <div className="flex items-center gap-2">
            <ExportButton onExport={handleExport} label="Export" />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Japan Vulnerability Notes (JVN) および JPCERT/CC の脆弱性情報
        </p>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">総脆弱性数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">24時間以内</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.recent24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">緊急</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.bySeverity.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">重要</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.bySeverity.high}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">検索</label>
            <input
              type="text"
              placeholder="JVN ID, CVE ID, タイトル, 説明で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">深刻度</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="緊急">緊急 (Critical)</option>
              <option value="重要">重要 (High)</option>
              <option value="警告">警告 (Medium)</option>
              <option value="注意">注意 (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  JVN ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  深刻度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CVSS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  公開日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  リンク
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVulnerabilities && filteredVulnerabilities.length > 0 ? (
                filteredVulnerabilities.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                          {vuln.jvnId}
                        </span>
                        {vuln.cveId && (
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{vuln.cveId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                          {vuln.title}
                        </p>
                        {vuln.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {vuln.summary}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                          vuln.severity
                        )}`}
                      >
                        {vuln.severity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getCvssColor(vuln.cvssScore)}`}>
                        {vuln.cvssScore?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {vuln.publishedDate
                          ? new Date(vuln.publishedDate).toLocaleDateString('ja-JP')
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vuln.references && (
                        <a
                          href={vuln.references}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    該当する脆弱性が見つかりませんでした
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {filteredVulnerabilities && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {filteredVulnerabilities.length} 件の脆弱性を表示中
          {data?.data && filteredVulnerabilities.length !== data.data.length && (
            <span> (全 {data.data.length} 件)</span>
          )}
        </p>
      )}
    </div>
  )
}
