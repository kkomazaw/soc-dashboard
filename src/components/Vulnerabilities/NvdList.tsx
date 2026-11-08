import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Info,
} from 'lucide-react'
import { getNvdCves, refreshNvdData, getNvdApiStatus } from '@/services/api/nvdApi'
import { ExportButton } from '../common/ExportButton'
import { exportNvd } from '@/services/api/exportApi'

export const NvdList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nvd-cves'],
    queryFn: getNvdCves,
  })

  const { data: statusData } = useQuery({
    queryKey: ['nvd-status'],
    queryFn: getNvdApiStatus,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshNvdData(7)
      await refetch()
    } catch (err) {
      console.error('Failed to refresh NVD data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    await exportNvd(format)
  }

  const getSeverityColor = (severity: string | null): string => {
    if (!severity) return 'bg-gray-100 text-gray-700'
    const lowerSeverity = severity.toLowerCase()
    if (lowerSeverity === 'critical') return 'bg-red-100 text-red-700'
    if (lowerSeverity === 'high') return 'bg-orange-100 text-orange-700'
    if (lowerSeverity === 'medium') return 'bg-yellow-100 text-yellow-700'
    if (lowerSeverity === 'low') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getCvssColor = (score: number | null): string => {
    if (!score) return 'text-gray-600'
    if (score >= 9.0) return 'text-red-600 font-bold'
    if (score >= 7.0) return 'text-orange-600 font-bold'
    if (score >= 4.0) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredCves = data?.data.filter((cve) => {
    const matchesSearch =
      searchTerm === '' ||
      cve.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cve.description && cve.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSeverity =
      severityFilter === 'all' ||
      (cve.cvssSeverity && cve.cvssSeverity.toLowerCase() === severityFilter.toLowerCase())

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
            <p className="font-medium text-red-900 dark:text-red-200">Error loading NVD data</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NVD CVE Database</h2>
          <div className="flex items-center gap-2">
            <ExportButton onExport={handleExport} label="Export" />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          National Vulnerability Database - NIST's comprehensive CVE database
        </p>
      </div>

      {/* API Status Banner */}
      {statusData && !statusData.configured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">NVD API Key Not Configured</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Using public API with rate limits (5 requests per 30 seconds). Add NVD_API_KEY to .env for better performance.
              </p>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.recent24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.bySeverity.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="CVE ID, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CVE List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CVE ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CVSS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Published</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCves && filteredCves.length > 0 ? (
                filteredCves.map((cve) => (
                  <tr key={cve.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${cve.cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        {cve.cveId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 max-w-md">
                        {cve.description || 'No description available'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getCvssColor(cve.cvssScore)}`}>
                        {cve.cvssScore?.toFixed(1) || 'N/A'}
                      </span>
                      {cve.cvssVersion && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{cve.cvssVersion}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(cve.cvssSeverity)}`}>
                        {cve.cvssSeverity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(cve.published).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No CVEs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {filteredCves && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {filteredCves.length} CVE{filteredCves.length !== 1 ? 's' : ''}
          {data?.data && filteredCves.length !== data.data.length && (
            <span> (filtered from {data.data.length} total)</span>
          )}
        </p>
      )}
    </div>
  )
}
