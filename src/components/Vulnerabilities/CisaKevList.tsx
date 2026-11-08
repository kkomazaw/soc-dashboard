import { useCisaKev } from '@/hooks/useVulnerabilities'
import type { CisaKevItem } from '@/types/vulnerability'
import { AlertCircle, Calendar, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { ExportButton } from '../common/ExportButton'
import { exportCisaKev } from '@/services/api/exportApi'
import { useState } from 'react'

const ITEMS_PER_PAGE = 50

export const CisaKevList = () => {
  const { data: vulnerabilities, isLoading, error } = useCisaKev()
  const [currentPage, setCurrentPage] = useState(1)

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

  // Pagination logic
  const totalItems = vulnerabilities?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayItems = vulnerabilities?.slice(startIndex, endIndex) || []

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
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
        )}
      </div>
    </div>
  )
}
