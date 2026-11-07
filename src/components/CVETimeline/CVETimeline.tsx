import { useState } from 'react'
import { Search, Calendar, AlertTriangle, Shield, FileText, Clock, ExternalLink, X, Loader2 } from 'lucide-react'
import { useCveTimeline, useCveSearch } from '@/hooks/useCveTimeline'
import type { TimelineEvent } from '@/services/api/cveTimelineApi'

export const CVETimeline = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCve, setSelectedCve] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(true)

  const { data: searchResults, isLoading: isSearching } = useCveSearch(searchQuery)
  const { data: timelineData, isLoading: isLoadingTimeline } = useCveTimeline(selectedCve)

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'published':
        return <FileText className="w-5 h-5" />
      case 'added_to_kev':
        return <AlertTriangle className="w-5 h-5" />
      case 'advisory':
        return <Shield className="w-5 h-5" />
      case 'updated':
        return <Clock className="w-5 h-5" />
      case 'patch_available':
        return <Shield className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'published':
        return 'bg-blue-600 dark:bg-blue-500'
      case 'added_to_kev':
        return 'bg-red-600 dark:bg-red-500'
      case 'advisory':
        return 'bg-purple-600 dark:bg-purple-500'
      case 'updated':
        return 'bg-yellow-600 dark:bg-yellow-500'
      case 'patch_available':
        return 'bg-green-600 dark:bg-green-500'
      default:
        return 'bg-gray-600 dark:bg-gray-500'
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'nvd':
        return 'bg-purple-600 dark:bg-purple-700'
      case 'cisa':
        return 'bg-blue-600 dark:bg-blue-700'
      case 'jvn':
        return 'bg-green-600 dark:bg-green-700'
      case 'redhat':
        return 'bg-red-600 dark:bg-red-700'
      default:
        return 'bg-gray-600 dark:bg-gray-700'
    }
  }

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-600'
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-600'
      case 'HIGH':
      case 'IMPORTANT':
        return 'bg-orange-600'
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-yellow-600'
      case 'LOW':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      full: date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      short: date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    }
  }

  const handleSelectCve = (cveId: string) => {
    setSelectedCve(cveId)
    setShowSearch(false)
    setSearchQuery('')
  }

  const handleBack = () => {
    setSelectedCve(null)
    setShowSearch(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          CVEタイムライン
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          特定のCVEに関連する情報を時系列で確認
        </p>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CVE番号またはキーワードで検索 (例: CVE-2024-1234)"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          )}

          {searchResults && searchResults.results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                検索結果 ({searchResults.total}件)
              </h3>
              <div className="grid gap-2">
                {searchResults.results.map((result) => (
                  <button
                    key={result.cveId}
                    onClick={() => handleSelectCve(result.cveId)}
                    className="text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {result.cveId}
                          </span>
                          {result.severity && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityColor(result.severity)} text-white uppercase`}>
                              {result.severity}
                            </span>
                          )}
                          {result.cvssScore !== null && result.cvssScore !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              CVSS: {result.cvssScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {result.sources.map((source) => (
                            <span
                              key={source}
                              className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge(source)} text-white uppercase`}
                            >
                              {source}
                            </span>
                          ))}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(result.publishedDate).short}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery && !isSearching && searchResults && searchResults.results.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>検索結果がありません</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline Section */}
      {selectedCve && (
        <div className="space-y-4">
          {/* CVE Info Card */}
          {timelineData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                      {timelineData.cveInfo.cveId}
                    </h3>
                    {timelineData.cveInfo.severity && (
                      <span className={`px-3 py-1 text-sm font-semibold rounded ${getSeverityColor(timelineData.cveInfo.severity)} text-white uppercase`}>
                        {timelineData.cveInfo.severity}
                      </span>
                    )}
                    {timelineData.cveInfo.cvssScore !== null && (
                      <span className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded">
                        CVSS: {timelineData.cveInfo.cvssScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {timelineData.cveInfo.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">情報源:</span>
                    {timelineData.cveInfo.foundInSources.nvd && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge('nvd')} text-white uppercase`}>
                        NVD
                      </span>
                    )}
                    {timelineData.cveInfo.foundInSources.cisa && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge('cisa')} text-white uppercase`}>
                        CISA KEV
                      </span>
                    )}
                    {timelineData.cveInfo.foundInSources.jvn && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge('jvn')} text-white uppercase`}>
                        JVN
                      </span>
                    )}
                    {timelineData.cveInfo.foundInSources.redhat && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge('redhat')} text-white uppercase`}>
                        Red Hat
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {isLoadingTimeline && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          )}

          {timelineData && timelineData.timeline.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                イベントタイムライン ({timelineData.totalEvents}件)
              </h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* Timeline events */}
                <div className="space-y-6">
                  {timelineData.timeline.map((event, index) => (
                    <div key={index} className="relative pl-16">
                      {/* Icon */}
                      <div className={`absolute left-0 w-12 h-12 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white shadow-lg`}>
                        {getEventIcon(event.type)}
                      </div>

                      {/* Content */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {event.title}
                              </h4>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge(event.source)} text-white uppercase`}>
                                {event.source}
                              </span>
                              {event.severity && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityColor(event.severity)} text-white uppercase`}>
                                  {event.severity}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {formatDate(event.date).full}
                            </p>
                          </div>
                          {event.url && (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {event.cvssScore !== undefined && event.cvssScore !== null && (
                            <span>CVSS: {event.cvssScore.toFixed(1)}</span>
                          )}
                          {event.advisoryId && (
                            <span className="font-mono">{event.advisoryId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {timelineData && timelineData.timeline.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">
                このCVEのタイムラインデータがありません
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
