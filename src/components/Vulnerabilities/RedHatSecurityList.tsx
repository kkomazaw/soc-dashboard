import { useState } from 'react'
import { useAllRedHatData } from '@/hooks/useRedHat'
import { Shield, ExternalLink, Calendar, AlertCircle, RefreshCw, Filter } from 'lucide-react'
import type { RedHatAdvisory, RedHatCVE } from '@/services/api/redhatApi'
import { refreshRedHatData } from '@/services/api/redhatApi'

type ViewMode = 'all' | 'advisories' | 'cves'

export const RedHatSecurityList = () => {
  const { data, isLoading, error, refetch } = useAllRedHatData()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshRedHatData(30)
      await refetch()
    } catch (err) {
      console.error('Failed to refresh Red Hat data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          データの取得に失敗しました: {(error as Error).message}
        </p>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getSeverityColor = (severity: string | null) => {
    if (!severity) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    const sev = severity.toLowerCase()
    if (sev === 'critical') return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    if (sev === 'important') return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    if (sev === 'moderate') return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    if (sev === 'low') return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  const getRecentItems = (items: (RedHatAdvisory | RedHatCVE)[], dateField: 'publicDate') => {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    return items.filter((item) => new Date(item[dateField]) >= oneDayAgo)
  }

  const advisories = data?.advisories || []
  const cves = data?.cves || []
  const stats = data?.stats

  const recentAdvisories = getRecentItems(advisories, 'publicDate')
  const recentCVEs = getRecentItems(cves, 'publicDate')

  const displayAdvisories = viewMode === 'cves' ? [] : advisories.slice(0, 20)
  const displayCVEs = viewMode === 'advisories' ? [] : cves.slice(0, 20)

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
              Red Hat Security
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Red Hat Security Advisories (RHSA) and CVE Information
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-red-900 dark:text-red-200 font-medium">Critical</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.combined.bySeverity.critical}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                {stats.advisories.bySeverity.critical} RHSA + {stats.cves.bySeverity.critical} CVE
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-sm text-orange-900 dark:text-orange-200 font-medium">Important</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {stats.combined.bySeverity.important}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                {stats.advisories.bySeverity.important} RHSA + {stats.cves.bySeverity.important} CVE
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-sm text-yellow-900 dark:text-yellow-200 font-medium">Moderate</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.combined.bySeverity.moderate}
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {stats.advisories.bySeverity.moderate} RHSA + {stats.cves.bySeverity.moderate} CVE
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-blue-900 dark:text-blue-200 font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.combined.total}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {stats.advisories.total} RHSA + {stats.cves.total} CVE
              </div>
            </div>
          </div>
        )}

        {/* View Mode Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">表示モード:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setViewMode('advisories')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'advisories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              RHSA のみ
            </button>
            <button
              onClick={() => setViewMode('cves')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'cves'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              CVE のみ
            </button>
          </div>
        </div>

        {/* Recent Items Alert */}
        {(recentAdvisories.length > 0 || recentCVEs.length > 0) && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              過去24時間の新規追加
            </h3>
            <div className="text-sm text-red-700 dark:text-red-300">
              {recentAdvisories.length > 0 && <span>{recentAdvisories.length}件のRHSA</span>}
              {recentAdvisories.length > 0 && recentCVEs.length > 0 && <span> • </span>}
              {recentCVEs.length > 0 && <span>{recentCVEs.length}件のCVE</span>}
            </div>
          </div>
        )}

        {/* Security Advisories Table */}
        {displayAdvisories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Red Hat Security Advisories (RHSA)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Advisory ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      重要度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      概要
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CVE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      公開日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayAdvisories.map((advisory) => (
                    <tr key={advisory.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={advisory.resourceUrl || `https://access.redhat.com/errata/${advisory.advisoryId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                        >
                          {advisory.advisoryId}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(advisory.severity)}`}>
                          {advisory.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                        <div className="line-clamp-2">{advisory.synopsis}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {advisory.cves.slice(0, 3).map((cve, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                              {cve}
                            </span>
                          ))}
                          {advisory.cves.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{advisory.cves.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(advisory.publicDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CVEs Table */}
        {displayCVEs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Red Hat CVEs
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CVE ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      重要度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CVSS Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      関連RHSA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      公開日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayCVEs.map((cve) => (
                    <tr key={cve.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={cve.resourceUrl || `https://access.redhat.com/security/cve/${cve.cveId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                        >
                          {cve.cveId}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}>
                          {cve.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {cve.cvss3Score || cve.cvssScore || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {cve.advisories.slice(0, 2).map((advisory, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                              {advisory}
                            </span>
                          ))}
                          {cve.advisories.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{cve.advisories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(cve.publicDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {displayAdvisories.length === 0 && displayCVEs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>データがありません</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              データを取得
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
