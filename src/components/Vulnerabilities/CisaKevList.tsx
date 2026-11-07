import { useCisaKev } from '@/hooks/useVulnerabilities'
import type { CisaKevItem } from '@/types/vulnerability'
import { AlertCircle, Calendar, Clock, ExternalLink } from 'lucide-react'
import { ExportButton } from '../common/ExportButton'
import { exportCisaKev } from '@/services/api/exportApi'

export const CisaKevList = () => {
  const { data: vulnerabilities, isLoading, error } = useCisaKev()

  const handleExport = async (format: 'csv' | 'pdf') => {
    await exportCisaKev(format)
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

  const getRecentItems = (items: CisaKevItem[] = []) => {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    return items.filter(
      (item) => new Date(item.dateAdded) >= oneDayAgo
    )
  }

  const recentItems = getRecentItems(vulnerabilities)
  const displayItems = vulnerabilities?.slice(0, 20) || []

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            CISA Known Exploited Vulnerabilities
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              総件数: {vulnerabilities?.length || 0}件
              {recentItems.length > 0 && (
                <span className="ml-4 text-red-600 dark:text-red-400 font-semibold">
                  新規 (24h): {recentItems.length}件
                </span>
              )}
            </div>
            <ExportButton onExport={handleExport} label="Export" />
          </div>
        </div>

        {recentItems.length > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              過去24時間の新規追加
            </h3>
            <div className="space-y-2">
              {recentItems.map((item) => (
                <div
                  key={item.cveId}
                  className="bg-white dark:bg-gray-800 rounded p-3 border border-red-300 dark:border-red-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${item.cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                      >
                        {item.cveId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.vendorProject} - {item.product}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {item.vulnerabilityName}
                      </div>
                    </div>
                    <div className="text-right text-sm flex-shrink-0 ml-4">
                      <div className="text-gray-600 dark:text-gray-400">
                        追加: {formatDate(item.dateAdded)}
                      </div>
                      {item.dueDate && (
                        <div className="text-red-600 dark:text-red-400 font-semibold">
                          期限: {formatDate(item.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CVE ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  製品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  脆弱性
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  追加日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  期限
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayItems.map((item) => (
                <tr key={item.cveId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${item.cveId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      {item.cveId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div>{item.vendorProject}</div>
                    <div className="text-gray-500 dark:text-gray-400">{item.product}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                    {item.vulnerabilityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(item.dateAdded)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.dueDate && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(item.dueDate)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
