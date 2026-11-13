import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getJvnVulnerabilities, refreshJvnData } from '@/services/api/jvnApi'
import { ExportButton } from '../common/ExportButton'
import { exportJvn } from '@/services/api/exportApi'
import { HelpTooltip } from '../common/HelpTooltip'

const ITEMS_PER_PAGE = 50

export const JvnList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Pagination logic
  const totalItems = filteredVulnerabilities?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayVulnerabilities = filteredVulnerabilities?.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1)
  }

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSeverityChange = (value: string) => {
    setSeverityFilter(value)
    setCurrentPage(1)
  }

  // Extract ID from URL or full identifier string
  const extractJvnId = (identifier: string): string => {
    // If it's a URL, extract the ID from it
    if (identifier.startsWith('http')) {
      // For JPCERT URLs like https://www.jpcert.or.jp/at/2024/at240001.html
      const jpcertMatch = identifier.match(/at-?(\d{4}-\d{4})/i)
      if (jpcertMatch) {
        return `JPCERT-${jpcertMatch[1]}`
      }
      // For JVN URLs like https://jvn.jp/vu/JVNVU98765432/
      const jvnMatch = identifier.match(/JVN[A-Z]*#?(\d{8})/i)
      if (jvnMatch) {
        return `JVN#${jvnMatch[1]}`
      }
      // Extract filename or last segment
      const segments = identifier.split('/').filter(s => s)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment) {
        // Remove file extension
        return lastSegment.replace(/\.(html|php|htm)$/, '')
      }
    }
    return identifier
  }

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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JVN 脆弱性情報</h2>
            <HelpTooltip
              title="JVN脆弱性情報について"
              content={[
                'JVN（Japan Vulnerability Notes）は、IPA（情報処理推進機構）とJPCERT/CCが共同運営する日本の脆弱性情報ポータルです。',
                '日本で広く使われている製品やシステムの脆弱性情報を日本語で提供しており、国内環境での脆弱性対応に不可欠な情報源です。',
                'JPCERT/CCの緊急注意喚起も含まれており、国内で特に影響の大きい脆弱性や攻撃活動を迅速に把握できます。',
                'CVE IDとの対応関係も明示されており、NVDなどのグローバル情報源との相互参照が可能です。'
              ]}
              size="md"
            />
          </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.stats.currentYear}年公開総数</p>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">深刻度</label>
            <select
              value={severityFilter}
              onChange={(e) => handleSeverityChange(e.target.value)}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                  JVN ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  深刻度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  CVSS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  公開日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  リンク
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayVulnerabilities && displayVulnerabilities.length > 0 ? (
                displayVulnerabilities.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap w-48">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                          {extractJvnId(vuln.jvnId)}
                        </span>
                        {vuln.cveId && (
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{vuln.cveId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
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
                    <td className="px-4 py-4 whitespace-nowrap w-24">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                          vuln.severity
                        )}`}
                      >
                        {vuln.severity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-20">
                      <span className={`text-sm font-semibold ${getCvssColor(vuln.cvssScore)}`}>
                        {vuln.cvssScore?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-32">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {vuln.publishedDate
                          ? new Date(vuln.publishedDate).toLocaleDateString('ja-JP')
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-20 text-center">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    全<span className="font-medium">{totalItems}</span>件中{' '}
                    <span className="font-medium">{startIndex + 1}</span>-
                    <span className="font-medium">{Math.min(endIndex, totalItems)}</span>件を表示
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">前へ</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 10) {
                        pageNum = i + 1
                      } else if (currentPage <= 5) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 4) {
                        pageNum = totalPages - 9 + i
                      } else {
                        pageNum = currentPage - 4 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">次へ</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredVulnerabilities && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          表示中: {displayVulnerabilities?.length || 0} 件
          {totalItems !== data?.data.length && (
            <span> (フィルター適用後: {totalItems} 件 / 全 {data?.data.length} 件)</span>
          )}
          {totalItems === data?.data.length && data?.data.length && (
            <span> (全 {data.data.length} 件)</span>
          )}
        </p>
      )}
    </div>
  )
}
