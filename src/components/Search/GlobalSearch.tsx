import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, X, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearch } from '@/contexts/SearchContext'
import { useQuery } from '@tanstack/react-query'
import { fetchCisaKev } from '@/services/api/cisaApi'
import { getJvnVulnerabilities } from '@/services/api/jvnApi'
import { getRecentNvdCves } from '@/services/api/nvdApi'
import { getAllRedHatData } from '@/services/api/redhatApi'
import { AdvancedFilters } from './AdvancedFilters'
import { FilterPresets } from './FilterPresets'
import { HelpTooltip } from '../common/HelpTooltip'

interface SearchResult {
  id: string
  title: string
  description: string
  severity: string
  source: 'cisa' | 'jvn' | 'nvd' | 'redhat'
  publishedDate: string
  cveId?: string
  vendor?: string
  product?: string
  cvssScore?: number
  advisoryId?: string
}

export const GlobalSearch = () => {
  const { filters, updateFilters } = useSearch()
  const [showFilters, setShowFilters] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch all data sources
  const { data: cisaData } = useQuery({
    queryKey: ['cisa-kev'],
    queryFn: fetchCisaKev,
  })

  const { data: jvnData } = useQuery({
    queryKey: ['jvn-vulnerabilities'],
    queryFn: getJvnVulnerabilities,
  })

  const { data: nvdData } = useQuery({
    queryKey: ['nvd-recent-cves', 90],
    queryFn: () => getRecentNvdCves(90),
  })

  const { data: redhatData } = useQuery({
    queryKey: ['redhat-all'],
    queryFn: getAllRedHatData,
  })

  const toggleSeverity = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity]
    updateFilters({ severity: newSeverity })
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Combine and filter results
  const allSearchResults = useMemo(() => {
    const results: SearchResult[] = []

    // Add CISA KEV results
    if (cisaData && (filters.sources.length === 0 || filters.sources.includes('cisa'))) {
      cisaData.forEach((item) => {
        const matchesQuery = !filters.query ||
          item.vulnerabilityName?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.cveId?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.vendorProject?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.product?.toLowerCase().includes(filters.query.toLowerCase())

        // CISA KEV entries are all CRITICAL (actively exploited)
        const matchesSeverity = filters.severity.length === 0 ||
          filters.severity.includes('CRITICAL')

        const matchesVendor = filters.vendors.length === 0 ||
          filters.vendors.includes(item.vendorProject || '')

        const matchesProduct = filters.products.length === 0 ||
          filters.products.includes(item.product || '')

        const matchesDate = (!filters.dateRange.start || new Date(item.dateAdded) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.dateAdded) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesSeverity && matchesVendor && matchesProduct && matchesDate) {
          results.push({
            id: item.cveId || `cisa-${item.id}`,
            title: item.vulnerabilityName || item.cveId,
            description: item.shortDescription || '',
            severity: 'CRITICAL',
            source: 'cisa',
            publishedDate: typeof item.dateAdded === 'string' ? item.dateAdded : item.dateAdded.toISOString(),
            cveId: item.cveId,
            vendor: item.vendorProject,
            product: item.product,
          })
        }
      })
    }

    // Add JVN results
    if (jvnData?.data && (filters.sources.length === 0 || filters.sources.includes('jvn'))) {
      jvnData.data.forEach((item: any, index: number) => {
        const matchesQuery = !filters.query ||
          item.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.identifier?.toLowerCase().includes(filters.query.toLowerCase())

        const matchesSeverity = filters.severity.length === 0 ||
          filters.severity.includes(item.severity?.toUpperCase() || 'UNKNOWN')

        const matchesDate = (!filters.dateRange.start || new Date(item.publishedDate) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.publishedDate) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesSeverity && matchesDate) {
          results.push({
            id: item.identifier || item.jvnId || item.cveId || `jvn-${index}`,
            title: item.title,
            description: item.description || '',
            severity: item.severity || 'UNKNOWN',
            source: 'jvn',
            publishedDate: item.publishedDate,
            cveId: item.cveId,
          })
        }
      })
    }

    // Add NVD results
    if (nvdData?.data && (filters.sources.length === 0 || filters.sources.includes('nvd'))) {
      nvdData.data.forEach((item: any, index: number) => {
        const matchesQuery = !filters.query ||
          item.cveId?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.description?.toLowerCase().includes(filters.query.toLowerCase())

        const matchesSeverity = filters.severity.length === 0 ||
          filters.severity.includes(item.severity?.toUpperCase() || 'UNKNOWN')

        const matchesCvss = (item.cvssScore ?? 0) >= filters.cvssRange.min &&
          (item.cvssScore ?? 0) <= filters.cvssRange.max

        const matchesDate = (!filters.dateRange.start || new Date(item.publishedDate) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.publishedDate) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesSeverity && matchesCvss && matchesDate) {
          results.push({
            id: item.cveId || `nvd-${item.id || index}`,
            title: item.cveId || 'Unknown CVE',
            description: item.description || '',
            severity: item.severity || 'UNKNOWN',
            source: 'nvd',
            publishedDate: item.publishedDate,
            cveId: item.cveId,
            cvssScore: item.cvssScore,
          })
        }
      })
    }

    // Add Red Hat results
    if (redhatData && (filters.sources.length === 0 || filters.sources.includes('redhat'))) {
      // Add Red Hat CVEs
      if (redhatData.cves) {
        redhatData.cves.forEach((item: any, index: number) => {
          const matchesQuery = !filters.query ||
            item.cveId?.toLowerCase().includes(filters.query.toLowerCase()) ||
            item.bugzillaDesc?.toLowerCase().includes(filters.query.toLowerCase())

          // Map Red Hat severity to standard severity levels
          const normalizedSeverity = item.severity?.toUpperCase() || 'UNKNOWN'
          const matchesSeverity = filters.severity.length === 0 ||
            filters.severity.includes(normalizedSeverity) ||
            (normalizedSeverity === 'IMPORTANT' && filters.severity.includes('HIGH')) ||
            (normalizedSeverity === 'MODERATE' && filters.severity.includes('MEDIUM'))

          const cvssScore = parseFloat(item.cvss3Score || item.cvssScore || '0')
          const matchesCvss = cvssScore >= filters.cvssRange.min &&
            cvssScore <= filters.cvssRange.max

          const matchesDate = (!filters.dateRange.start || new Date(item.publicDate) >= new Date(filters.dateRange.start)) &&
            (!filters.dateRange.end || new Date(item.publicDate) <= new Date(filters.dateRange.end))

          if (matchesQuery && matchesSeverity && matchesCvss && matchesDate) {
            // Map Red Hat severity to standard levels for display consistency
            let displaySeverity = normalizedSeverity
            if (normalizedSeverity === 'IMPORTANT') {
              displaySeverity = 'HIGH'
            } else if (normalizedSeverity === 'MODERATE') {
              displaySeverity = 'MEDIUM'
            }

            results.push({
              id: item.cveId || `redhat-cve-${item.id || index}`,
              title: item.cveId || 'Unknown CVE',
              description: item.bugzillaDesc || item.details?.join(', ') || '',
              severity: displaySeverity,
              source: 'redhat',
              publishedDate: item.publicDate,
              cveId: item.cveId,
              cvssScore: cvssScore || undefined,
              vendor: 'Red Hat',
            })
          }
        })
      }

      // Add Red Hat Advisories with CVEs
      if (redhatData.advisories) {
        redhatData.advisories.forEach((item: any, index: number) => {
          // Only include advisories with CVEs
          if (!item.cves || item.cves.length === 0) return

          const matchesQuery = !filters.query ||
            item.advisoryId?.toLowerCase().includes(filters.query.toLowerCase()) ||
            item.synopsis?.toLowerCase().includes(filters.query.toLowerCase()) ||
            item.cves?.some((cve: string) => cve.toLowerCase().includes(filters.query.toLowerCase()))

          // Map Red Hat severity to standard severity levels
          const normalizedSeverity = item.severity?.toUpperCase() || 'UNKNOWN'
          const matchesSeverity = filters.severity.length === 0 ||
            filters.severity.includes(normalizedSeverity) ||
            (normalizedSeverity === 'IMPORTANT' && filters.severity.includes('HIGH')) ||
            (normalizedSeverity === 'MODERATE' && filters.severity.includes('MEDIUM'))

          const matchesDate = (!filters.dateRange.start || new Date(item.publicDate) >= new Date(filters.dateRange.start)) &&
            (!filters.dateRange.end || new Date(item.publicDate) <= new Date(filters.dateRange.end))

          if (matchesQuery && matchesSeverity && matchesDate) {
            // Map Red Hat severity to standard levels for display consistency
            let displaySeverity = normalizedSeverity
            if (normalizedSeverity === 'IMPORTANT') {
              displaySeverity = 'HIGH'
            } else if (normalizedSeverity === 'MODERATE') {
              displaySeverity = 'MEDIUM'
            }

            results.push({
              id: item.advisoryId || `redhat-advisory-${item.id || index}`,
              title: `${item.advisoryId}: ${item.synopsis}`,
              description: item.description || item.synopsis || '',
              severity: displaySeverity,
              source: 'redhat',
              publishedDate: item.publicDate,
              cveId: item.cves[0], // First CVE as primary
              vendor: 'Red Hat',
              advisoryId: item.advisoryId,
            })
          }
        })
      }
    }

    return results
  }, [cisaData, jvnData, nvdData, redhatData, filters])

  // Pagination calculations
  const totalPages = Math.ceil(allSearchResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const searchResults = allSearchResults.slice(startIndex, endIndex)

  // Effect to reset page when results change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [allSearchResults.length, currentPage, totalPages])

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-600'
      case 'HIGH':
        return 'bg-orange-600'
      case 'MEDIUM':
        return 'bg-yellow-600'
      case 'LOW':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'cisa':
        return 'bg-blue-600'
      case 'jvn':
        return 'bg-green-600'
      case 'nvd':
        return 'bg-purple-600'
      case 'redhat':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            脆弱性検索
          </h2>
          <HelpTooltip
            title="脆弱性検索について"
            content={[
              '複数の脆弱性データベース（CISA KEV、JVN、NVD、Red Hat）を横断して検索できる統合検索機能です。',
              'CVE ID、脆弱性の説明、ベンダー名、製品名などで検索できます。フィルター機能を使用して、ソース、重要度、日付範囲、CVSSスコアで絞り込むことも可能です。',
              'プリセット機能では、「最近の重大な脆弱性」「今週の脆弱性」などの事前定義された検索条件をワンクリックで適用できます。',
              '検索結果には各データソースからの脆弱性情報が統合され、最大100件まで表示されます。'
            ]}
            size="md"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CISA KEV、JVN、NVD、Red Hatを横断検索
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => {
                updateFilters({ query: e.target.value })
                setCurrentPage(1)
              }}
              placeholder="脆弱性、CVE ID、ベンダー、製品を検索..."
              className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {filters.query && (
              <button
                onClick={() => {
                  updateFilters({ query: '' })
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            フィルター
          </button>

          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              showPresets
                ? 'bg-purple-600 dark:bg-purple-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            プリセット
          </button>
        </div>

        {/* Quick Severity Filters */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">重要度:</span>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => {
              const isActive = filters.severity.includes(severity)
              const colorClasses = {
                CRITICAL: isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
                HIGH: isActive
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800',
                MEDIUM: isActive
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800',
                LOW: isActive
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
              }[severity]

              return (
                <button
                  key={severity}
                  onClick={() => toggleSeverity(severity)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${colorClasses}`}
                >
                  {severity}
                </button>
              )
            })}
            {filters.severity.length > 0 && (
              <button
                onClick={() => {
                  updateFilters({ severity: [] })
                  setCurrentPage(1)
                }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
              >
                クリア
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <AdvancedFilters />
        </div>
      )}

      {/* Filter Presets Panel */}
      {showPresets && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <FilterPresets />
        </div>
      )}

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Search className="w-5 h-5" />
              検索結果
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {allSearchResults.length > 0
                  ? `(${allSearchResults.length}件中 ${startIndex + 1}-${Math.min(endIndex, allSearchResults.length)}件を表示)`
                  : '(0件)'}
              </span>
            </h3>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ページ {currentPage} / {totalPages}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">検索結果がありません</p>
              <p className="text-sm mt-1">検索クエリまたはフィルターを調整してください</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((result) => (
                <div
                  key={`${result.source}-${result.id}`}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge(result.source)} text-white uppercase`}>
                          {result.source}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityColor(result.severity)} text-white uppercase`}>
                          {result.severity}
                        </span>
                        {result.cveId && (
                          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{result.cveId}</span>
                        )}
                        {result.cvssScore !== undefined && result.cvssScore !== null && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">CVSS: {result.cvssScore.toFixed(1)}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{result.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{result.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>{new Date(result.publishedDate).toLocaleDateString('ja-JP')}</span>
                        {result.vendor && <span>ベンダー: {result.vendor}</span>}
                        {result.product && <span>製品: {result.product}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && allSearchResults.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {allSearchResults.length}件中 {startIndex + 1}-{Math.min(endIndex, allSearchResults.length)}件を表示
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  最初
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  最後
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
