import { useState, useEffect } from 'react'
import { Search, AlertCircle, CheckCircle, XCircle, Loader2, Shield, ExternalLink } from 'lucide-react'
import {
  searchFileHash,
  searchUrl,
  searchIpAddress,
  getApiStatus,
  type FileHashResult,
  type UrlResult,
  type IpResult,
  type ApiStatus,
} from '@/services/api/iocApi'

type SearchType = 'hash' | 'url' | 'ip'

const IocSearch = () => {
  const [searchType, setSearchType] = useState<SearchType>('ip')
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hashResult, setHashResult] = useState<FileHashResult | null>(null)
  const [urlResult, setUrlResult] = useState<UrlResult | null>(null)
  const [ipResult, setIpResult] = useState<IpResult | null>(null)
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)

  useEffect(() => {
    const fetchApiStatus = async () => {
      try {
        const status = await getApiStatus()
        setApiStatus(status)
      } catch (err) {
        console.error('Failed to fetch API status')
      }
    }
    fetchApiStatus()
  }, [])

  const performSearch = async (type: SearchType, query: string) => {
    if (!query.trim()) {
      setError('Please enter a value to search')
      return
    }

    setIsLoading(true)
    setError(null)
    setHashResult(null)
    setUrlResult(null)
    setIpResult(null)

    try {
      if (type === 'hash') {
        const result = await searchFileHash(query.trim())
        setHashResult(result)
      } else if (type === 'url') {
        const result = await searchUrl(query.trim())
        setUrlResult(result)
      } else if (type === 'ip') {
        const result = await searchIpAddress(query.trim())
        setIpResult(result)
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Not found in database')
      } else if (err.response?.status === 503) {
        setError(err.response?.data?.message || 'API service not configured')
      } else {
        setError(err.response?.data?.message || 'Search failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    await performSearch(searchType, searchInput)
  }

  const getThreatLevel = (score: number): { color: string; label: string } => {
    if (score >= 75) return { color: 'text-red-600', label: 'Critical' }
    if (score >= 50) return { color: 'text-orange-600', label: 'High' }
    if (score >= 25) return { color: 'text-yellow-600', label: 'Medium' }
    return { color: 'text-green-600', label: 'Low' }
  }

  const getDetectionColor = (malicious: number, total: number): string => {
    const percentage = (malicious / total) * 100
    if (percentage >= 50) return 'text-red-600'
    if (percentage >= 25) return 'text-orange-600'
    if (percentage >= 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">IoC Search</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Search for Indicators of Compromise using threat intelligence services
        </p>
      </div>

      {/* API Status */}
      {apiStatus && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-200">API Services Status</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {apiStatus.virusTotal.configured ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className={apiStatus.virusTotal.configured ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}>
                    VirusTotal {apiStatus.virusTotal.configured ? '(Configured)' : '(Not Configured)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus.abuseIPDB.configured ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className={apiStatus.abuseIPDB.configured ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}>
                    AbuseIPDB {apiStatus.abuseIPDB.configured ? '(Configured)' : '(Not Configured)'}
                  </span>
                </div>
              </div>
              {(!apiStatus.virusTotal.configured || !apiStatus.abuseIPDB.configured) && (
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  Configure API keys in .env file to enable all features
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Search Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('ip')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'ip'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                IP Address
              </button>
              <button
                onClick={() => setSearchType('hash')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'hash'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                File Hash
              </button>
              <button
                onClick={() => setSearchType('url')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                URL/Domain
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {searchType === 'ip' && 'IP Address'}
              {searchType === 'hash' && 'File Hash (MD5, SHA1, SHA256)'}
              {searchType === 'url' && 'URL or Domain'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  searchType === 'ip'
                    ? '192.168.1.1'
                    : searchType === 'hash'
                    ? 'abc123...'
                    : 'https://example.com'
                }
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IP Address Result */}
      {ipResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              IP Address Reputation Report
            </h3>
            <a
              href={`https://www.abuseipdb.com/check/${ipResult.ipAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on AbuseIPDB
            </a>
          </div>
          <div className="p-6 space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Abuse Confidence Score</p>
                  <p className={`text-4xl font-bold ${getThreatLevel(ipResult.abuseConfidenceScore).color}`}>
                    {ipResult.abuseConfidenceScore}%
                  </p>
                  <p className={`text-sm font-medium ${getThreatLevel(ipResult.abuseConfidenceScore).color}`}>
                    {getThreatLevel(ipResult.abuseConfidenceScore).label} Risk
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ipResult.totalReports}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {ipResult.numDistinctUsers} users</p>
                </div>
              </div>
            </div>

            {/* IP Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                <p className="font-mono text-gray-900 dark:text-gray-100">{ipResult.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                <p className="text-gray-900 dark:text-gray-100">{ipResult.country} ({ipResult.countryCode})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ISP</p>
                <p className="text-gray-900 dark:text-gray-100">{ipResult.isp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usage Type</p>
                <p className="text-gray-900 dark:text-gray-100">{ipResult.usageType}</p>
              </div>
              {ipResult.domain && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Domain</p>
                  <p className="text-gray-900 dark:text-gray-100">{ipResult.domain}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Flags</p>
                <div className="flex gap-2 mt-1">
                  {ipResult.isTor && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Tor Exit Node
                    </span>
                  )}
                  {ipResult.isWhitelisted && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Whitelisted
                    </span>
                  )}
                  {!ipResult.isPublic && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Private
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            {ipResult.recentReports && ipResult.recentReports.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Reports</h4>
                <div className="space-y-3">
                  {ipResult.recentReports.slice(0, 5).map((report, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(report.date).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{report.country}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{report.comment}</p>
                      <div className="flex flex-wrap gap-1">
                        {report.categories.map((cat, catIdx) => (
                          <span
                            key={catIdx}
                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Hash Result */}
      {hashResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">File Analysis Report</h3>
            <a
              href={`https://www.virustotal.com/gui/file/${hashResult.sha256}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on VirusTotal
            </a>
          </div>
          <div className="p-6 space-y-6">
            {/* Detection Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</p>
                  <p className={`text-4xl font-bold ${getDetectionColor(hashResult.stats.malicious, Object.values(hashResult.stats).reduce((a, b) => a + b, 0))}`}>
                    {hashResult.detectionRate}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{hashResult.stats.malicious}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Malicious</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hashResult.stats.suspicious}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{hashResult.stats.harmless}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Harmless</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{hashResult.stats.undetected}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Undetected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hash Values */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">SHA-256</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{hashResult.sha256}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">SHA-1</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{hashResult.sha1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">MD5</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{hashResult.md5}</p>
              </div>
            </div>

            {/* File Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
                <p className="text-gray-900 dark:text-gray-100">{(hashResult.size / 1024).toFixed(2)} KB</p>
              </div>
              {hashResult.type && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">File Type</p>
                  <p className="text-gray-900 dark:text-gray-100">{hashResult.type}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">First Seen</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(hashResult.firstSeen).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Analysis</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(hashResult.lastAnalysis).toLocaleString()}
                </p>
              </div>
            </div>

            {/* File Names */}
            {hashResult.names.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Known File Names</p>
                <div className="flex flex-wrap gap-2">
                  {hashResult.names.slice(0, 10).map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Result */}
      {urlResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">URL Analysis Report</h3>
            <a
              href={`https://www.virustotal.com/gui/search/${encodeURIComponent(urlResult.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on VirusTotal
            </a>
          </div>
          <div className="p-6 space-y-6">
            {/* Detection Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</p>
                  <p className={`text-4xl font-bold ${getDetectionColor(urlResult.stats.malicious, Object.values(urlResult.stats).reduce((a, b) => a + b, 0))}`}>
                    {urlResult.detectionRate}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{urlResult.stats.malicious}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Malicious</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{urlResult.stats.suspicious}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{urlResult.stats.harmless}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Harmless</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{urlResult.stats.undetected}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Undetected</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">URL</p>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{urlResult.url}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Analysis</p>
              <p className="text-gray-900 dark:text-gray-100">{new Date(urlResult.lastAnalysis).toLocaleString()}</p>
            </div>

            {/* Categories */}
            {Object.keys(urlResult.categories).length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(urlResult.categories).map(([vendor, category], idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                      title={vendor}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IocSearch
