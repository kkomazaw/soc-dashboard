import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X,
  MapPin,
  AlertTriangle,
  Calendar,
  ExternalLink,
  TrendingUp,
  Shield,
  Activity,
  Clock
} from 'lucide-react'
import { fetchCountryReports } from '../../api/geoThreatApi'

interface ThreatReport {
  id: number
  ipAddress: string
  threatType: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  source: string
  description: string | null
  reportedDate: string
  metadata: any
}

interface CountryThreatDetailProps {
  countryCode: string
  countryName: string
  onClose: () => void
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-600 text-white'
    case 'high': return 'bg-orange-600 text-white'
    case 'medium': return 'bg-yellow-600 text-white'
    case 'low': return 'bg-green-600 text-white'
    default: return 'bg-gray-600 text-white'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return '🔴'
    case 'high': return '🟠'
    case 'medium': return '🟡'
    case 'low': return '🟢'
    default: return '⚪'
  }
}

export const CountryThreatDetail = ({ countryCode, countryName, onClose }: CountryThreatDetailProps) => {
  const [selectedThreatType, setSelectedThreatType] = useState<string | null>(null)

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['countryThreatReports', countryCode],
    queryFn: () => fetchCountryReports(countryCode),
    refetchInterval: 60000, // Refetch every minute
  })

  // Calculate statistics
  const stats = {
    totalReports: reports?.length || 0,
    uniqueIPs: new Set(reports?.map(r => r.ipAddress) || []).size,
    critical: reports?.filter(r => r.severity === 'critical').length || 0,
    high: reports?.filter(r => r.severity === 'high').length || 0,
    medium: reports?.filter(r => r.severity === 'medium').length || 0,
    low: reports?.filter(r => r.severity === 'low').length || 0,
  }

  // Get threat type breakdown
  const threatTypes = reports?.reduce<Record<string, number>>((acc, r) => {
    acc[r.threatType] = (acc[r.threatType] || 0) + 1
    return acc
  }, {}) || {}

  const sortedThreatTypes = Object.entries(threatTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Get source breakdown
  const sources = reports?.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1
    return acc
  }, {}) || {}

  // Filter reports
  const filteredReports = selectedThreatType
    ? reports?.filter(r => r.threatType === selectedThreatType)
    : reports

  // Group reports by date
  const reportsByDate = filteredReports?.reduce((acc, r) => {
    const date = new Date(r.reportedDate).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(r)
    return acc
  }, {} as Record<string, ThreatReport[]>) || {}

  const sortedDates = Object.keys(reportsByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {countryName} ({countryCode})
                </h2>
                <p className="text-blue-100 text-sm">Detailed Threat Intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading threat data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center text-red-600">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p>Failed to load threat data</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Total Reports</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalReports}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Unique IPs</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.uniqueIPs}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                    <p className="text-xs text-red-700 dark:text-red-300 mb-1">Critical</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.critical}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">High</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.high}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">Medium</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.medium}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-xs text-green-700 dark:text-green-300 mb-1">Low</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.low}</p>
                  </div>
                </div>

                {/* Threat Type Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Threat Type Distribution</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                    <button
                      onClick={() => setSelectedThreatType(null)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedThreatType === null
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      All ({stats.totalReports})
                    </button>
                    {sortedThreatTypes.map(([type, count]: [string, number]) => (
                      <button
                        key={type}
                        onClick={() => setSelectedThreatType(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedThreatType === type
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type} ({count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Sources */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Intelligence Sources</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sources).map(([source, count]: [string, number]) => (
                      <div key={source} className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{source}</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({count} reports)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threat Reports Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Threat Reports Timeline
                        {selectedThreatType && (
                          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                            (Filtered by: {selectedThreatType})
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {sortedDates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No threat reports found
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {sortedDates.map((date) => (
                          <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({reportsByDate[date].length} reports)
                              </span>
                            </div>
                            <div className="space-y-3 ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              {reportsByDate[date].map((report: ThreatReport) => (
                                <div
                                  key={report.id}
                                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg">{getSeverityIcon(report.severity)}</span>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {report.ipAddress}
                                          </span>
                                          <a
                                            href={`https://www.abuseipdb.com/check/${report.ipAddress}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                            title="View on AbuseIPDB"
                                          >
                                            <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                          </a>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(report.reportedDate).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(report.severity)}`}>
                                        {report.severity.toUpperCase()}
                                      </span>
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                        {report.confidence}% confidence
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {report.threatType}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {report.source}
                                      </span>
                                    </div>
                                  </div>
                                  {report.description && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                                      {report.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Investigation Note */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Further Investigation
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Click on any IP address link to view detailed threat information on AbuseIPDB.
                        You can also use the IoC Search feature from the main menu to investigate IPs using multiple threat intelligence sources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
