import { useState, useMemo } from 'react'
import { Globe, MapPin, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ThreatLocation {
  country: string
  countryCode: string
  threatCount: number
  critical: number
  high: number
  medium: number
  low: number
  topThreats: string[]
}

interface ThreatGeographyProps {
  // This would be populated from IP-based threat intelligence
  threatData?: ThreatLocation[]
}

// Mock data for demonstration (will be replaced with real data from IP intelligence)
const MOCK_THREAT_DATA: ThreatLocation[] = [
  {
    country: 'United States',
    countryCode: 'US',
    threatCount: 1245,
    critical: 89,
    high: 312,
    medium: 658,
    low: 186,
    topThreats: ['Ransomware', 'Phishing', 'DDoS'],
  },
  {
    country: 'China',
    countryCode: 'CN',
    threatCount: 987,
    critical: 67,
    high: 289,
    medium: 501,
    low: 130,
    topThreats: ['APT', 'Data Exfiltration', 'Malware'],
  },
  {
    country: 'Russia',
    countryCode: 'RU',
    threatCount: 856,
    critical: 102,
    high: 267,
    medium: 398,
    low: 89,
    topThreats: ['APT', 'Ransomware', 'Botnet'],
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    threatCount: 534,
    critical: 45,
    high: 178,
    medium: 256,
    low: 55,
    topThreats: ['Phishing', 'Malware', 'DDoS'],
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    threatCount: 478,
    critical: 38,
    high: 156,
    medium: 234,
    low: 50,
    topThreats: ['Malware', 'Ransomware', 'Phishing'],
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    threatCount: 423,
    critical: 34,
    high: 142,
    medium: 198,
    low: 49,
    topThreats: ['APT', 'Malware', 'Phishing'],
  },
  {
    country: 'South Korea',
    countryCode: 'KR',
    threatCount: 389,
    critical: 31,
    high: 129,
    medium: 187,
    low: 42,
    topThreats: ['APT', 'DDoS', 'Malware'],
  },
  {
    country: 'India',
    countryCode: 'IN',
    threatCount: 367,
    critical: 28,
    high: 118,
    medium: 176,
    low: 45,
    topThreats: ['Phishing', 'Malware', 'Ransomware'],
  },
  {
    country: 'France',
    countryCode: 'FR',
    threatCount: 312,
    critical: 25,
    high: 101,
    medium: 152,
    low: 34,
    topThreats: ['Malware', 'Phishing', 'DDoS'],
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    threatCount: 289,
    critical: 22,
    high: 94,
    medium: 141,
    low: 32,
    topThreats: ['Banking Trojan', 'Phishing', 'Malware'],
  },
]

export const ThreatGeography = ({ threatData = MOCK_THREAT_DATA }: ThreatGeographyProps) => {
  const [sortBy, setSortBy] = useState<'total' | 'critical' | 'high'>('total')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')

  // Sort data
  const sortedData = useMemo(() => {
    const data = [...threatData]
    data.sort((a, b) => {
      if (sortBy === 'total') return b.threatCount - a.threatCount
      if (sortBy === 'critical') return b.critical - a.critical
      if (sortBy === 'high') return b.high - a.high
      return 0
    })
    return data
  }, [threatData, sortBy])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = sortedData.reduce((sum, d) => sum + d.threatCount, 0)
    const critical = sortedData.reduce((sum, d) => sum + d.critical, 0)
    const high = sortedData.reduce((sum, d) => sum + d.high, 0)
    const countries = sortedData.length

    return { total, critical, high, countries }
  }, [sortedData])

  // Prepare chart data (top 10 countries)
  const chartData = useMemo(() => {
    return sortedData.slice(0, 10).map((d) => ({
      country: d.countryCode,
      total: d.threatCount,
      critical: d.critical,
      high: d.high,
    }))
  }, [sortedData])

  const getCountryColor = (threatCount: number, maxCount: number) => {
    const intensity = threatCount / maxCount
    if (intensity >= 0.8) return '#dc2626' // red-600
    if (intensity >= 0.6) return '#ea580c' // orange-600
    if (intensity >= 0.4) return '#facc15' // yellow-400
    if (intensity >= 0.2) return '#3b82f6' // blue-500
    return '#6b7280' // gray-500
  }

  const maxThreatCount = Math.max(...sortedData.map((d) => d.threatCount), 1)

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-3 border border-blue-700">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-300" />
            <p className="text-xs text-blue-200">Total Threats</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-3 border border-red-700">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-300" />
            <p className="text-xs text-red-200">Critical</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.critical.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-3 border border-orange-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-300" />
            <p className="text-xs text-orange-200">High</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.high.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-3 border border-purple-700">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-purple-300" />
            <p className="text-xs text-purple-200">Countries</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.countries}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          <div className="flex gap-1">
            {(['total', 'critical', 'high'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  sortBy === sort
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {(['list', 'map'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Top 10 Countries by Threat Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="country"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              stroke="#4b5563"
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              stroke="#4b5563"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                border: '1px solid #4b5563',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
            />
            <Bar dataKey="total" fill="#3b82f6" name="Total Threats" radius={[4, 4, 0, 0]} />
            <Bar dataKey="critical" fill="#dc2626" name="Critical" radius={[4, 4, 0, 0]} />
            <Bar dataKey="high" fill="#ea580c" name="High" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Country List */}
      {viewMode === 'list' && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {sortedData.map((location, index) => (
              <div
                key={location.countryCode}
                className="group bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all border border-gray-600 hover:border-blue-500"
              >
                <div className="flex items-start gap-3">
                  {/* Rank & Color Indicator */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="text-xs font-bold text-gray-400 mb-1">#{index + 1}</div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: getCountryColor(location.threatCount, maxThreatCount),
                        opacity: 0.9,
                      }}
                    >
                      <span className="text-xl font-bold text-white">{location.countryCode}</span>
                    </div>
                  </div>

                  {/* Country Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1">{location.country}</h4>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-300">
                            <span className="font-semibold">{location.threatCount.toLocaleString()}</span> threats
                          </span>
                          {location.critical > 0 && (
                            <span className="text-red-400">
                              {location.critical} critical
                            </span>
                          )}
                          {location.high > 0 && (
                            <span className="text-orange-400">
                              {location.high} high
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Severity Bar */}
                    <div className="mb-2">
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-600">
                        {location.critical > 0 && (
                          <div
                            className="bg-red-600"
                            style={{ width: `${(location.critical / location.threatCount) * 100}%` }}
                          />
                        )}
                        {location.high > 0 && (
                          <div
                            className="bg-orange-600"
                            style={{ width: `${(location.high / location.threatCount) * 100}%` }}
                          />
                        )}
                        {location.medium > 0 && (
                          <div
                            className="bg-yellow-600"
                            style={{ width: `${(location.medium / location.threatCount) * 100}%` }}
                          />
                        )}
                        {location.low > 0 && (
                          <div
                            className="bg-green-600"
                            style={{ width: `${(location.low / location.threatCount) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Top Threats */}
                    <div className="flex flex-wrap gap-1">
                      {location.topThreats.map((threat) => (
                        <span
                          key={threat}
                          className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {threat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Map Placeholder */}
      {viewMode === 'map' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Interactive World Map</h3>
            <p className="text-sm text-gray-400 mb-4">
              Geographic threat visualization coming soon
            </p>
            <p className="text-xs text-gray-500">
              Will integrate with IP geolocation services to display threats on an interactive world map
            </p>
            <button
              onClick={() => setViewMode('list')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              View as List
            </button>
          </div>
        </div>
      )}

      {/* Data Source Note */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Globe className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300">
            <p className="font-semibold mb-1">Data Source Information</p>
            <p className="text-blue-200">
              Geographic threat data is currently showing sample data. In production, this will be integrated with
              IP geolocation services (AbuseIPDB, AlienVault OTX, etc.) to show real threat origins based on
              malicious IP addresses and attack sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
