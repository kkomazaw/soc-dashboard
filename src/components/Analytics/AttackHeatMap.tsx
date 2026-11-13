import { useState, useMemo } from 'react'
import { Target, AlertTriangle, TrendingUp, Filter, X, ExternalLink } from 'lucide-react'

interface TechniqueMapping {
  techniqueId: string
  techniqueName: string
  tactic: string
  cveCount: number
  severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recentActivity: number // CVEs in last 30 days
}

interface AttackHeatMapProps {
  mappings?: any[] // CVE-to-ATT&CK mappings from the API
  techniques?: any[] // ATT&CK techniques from the API
}

export const AttackHeatMap = ({ mappings = [], techniques = [] }: AttackHeatMapProps) => {
  const [selectedTactic, setSelectedTactic] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'cveCount' | 'critical' | 'recent'>('cveCount')
  const [minCves, setMinCves] = useState<number>(1)
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null)

  // Process mappings to create heat map data
  const heatMapData = useMemo(() => {
    const techniqueMap = new Map<string, TechniqueMapping>()

    // Aggregate mappings by technique
    mappings.forEach((mapping: any) => {
      const techId = mapping.techniqueId || mapping.technique_id
      if (!techId) return

      if (!techniqueMap.has(techId)) {
        const tech = techniques.find((t: any) => t.id === techId || t.techniqueId === techId)
        techniqueMap.set(techId, {
          techniqueId: techId,
          techniqueName: tech?.name || mapping.techniqueName || techId,
          tactic: tech?.tactic || mapping.tactic || 'Unknown',
          cveCount: 0,
          severity: { critical: 0, high: 0, medium: 0, low: 0 },
          recentActivity: 0,
        })
      }

      const data = techniqueMap.get(techId)!
      data.cveCount++

      // Count by severity
      const severity = (mapping.severity || 'MEDIUM').toUpperCase()
      if (severity === 'CRITICAL') data.severity.critical++
      else if (severity === 'HIGH') data.severity.high++
      else if (severity === 'MEDIUM') data.severity.medium++
      else if (severity === 'LOW') data.severity.low++

      // Check if recent (last 30 days)
      if (mapping.publishedDate) {
        const publishedDate = new Date(mapping.publishedDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        if (publishedDate >= thirtyDaysAgo) {
          data.recentActivity++
        }
      }
    })

    return Array.from(techniqueMap.values())
  }, [mappings, techniques])

  // Get unique tactics
  const tactics = useMemo(() => {
    const uniqueTactics = new Set(heatMapData.map((d) => d.tactic))
    return ['all', ...Array.from(uniqueTactics).sort()]
  }, [heatMapData])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = heatMapData.filter((d) => d.cveCount >= minCves)

    if (selectedTactic !== 'all') {
      filtered = filtered.filter((d) => d.tactic === selectedTactic)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'cveCount') return b.cveCount - a.cveCount
      if (sortBy === 'critical') return b.severity.critical - a.severity.critical
      if (sortBy === 'recent') return b.recentActivity - a.recentActivity
      return 0
    })

    return filtered.slice(0, 50) // Limit to top 50
  }, [heatMapData, selectedTactic, sortBy, minCves])

  // Calculate heat intensity (0-1) based on CVE count
  const maxCves = Math.max(...filteredData.map((d) => d.cveCount), 1)
  const getHeatColor = (count: number, maxValue: number) => {
    const intensity = count / maxValue
    if (intensity >= 0.8) return 'bg-red-600'
    if (intensity >= 0.6) return 'bg-orange-600'
    if (intensity >= 0.4) return 'bg-yellow-600'
    if (intensity >= 0.2) return 'bg-blue-600'
    return 'bg-gray-600'
  }

  const getHeatOpacity = (count: number, maxValue: number) => {
    const intensity = count / maxValue
    return Math.max(0.3, intensity)
  }

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, d) => sum + d.cveCount, 0)
    const criticalTotal = filteredData.reduce((sum, d) => sum + d.severity.critical, 0)
    const highTotal = filteredData.reduce((sum, d) => sum + d.severity.high, 0)
    const recentTotal = filteredData.reduce((sum, d) => sum + d.recentActivity, 0)

    return { total, criticalTotal, highTotal, recentTotal }
  }, [filteredData])

  // Get CVEs for selected technique
  const selectedTechniqueCVEs = useMemo(() => {
    if (!selectedTechnique) return []

    return mappings
      .filter((m: any) => {
        const techId = m.techniqueId || m.technique_id
        return techId === selectedTechnique
      })
      .map((m: any) => ({
        cveId: m.cveId,
        severity: m.severity || 'MEDIUM',
        publishedDate: m.publishedDate,
        source: m.source,
      }))
      .sort((a, b) => {
        // Sort by severity first
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        const aSev = severityOrder[a.severity.toUpperCase() as keyof typeof severityOrder] ?? 4
        const bSev = severityOrder[b.severity.toUpperCase() as keyof typeof severityOrder] ?? 4
        if (aSev !== bSev) return aSev - bSev

        // Then by date
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      })
  }, [selectedTechnique, mappings])

  const selectedTechniqueData = useMemo(() => {
    if (!selectedTechnique) return null
    return filteredData.find(t => t.techniqueId === selectedTechnique) ||
           heatMapData.find(t => t.techniqueId === selectedTechnique)
  }, [selectedTechnique, filteredData, heatMapData])

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-3 border border-blue-700">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-300" />
            <p className="text-xs text-blue-200">Total CVEs</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-3 border border-red-700">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-300" />
            <p className="text-xs text-red-200">Critical</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.criticalTotal}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-3 border border-orange-700">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-300" />
            <p className="text-xs text-orange-200">High</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.highTotal}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-3 border border-purple-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-300" />
            <p className="text-xs text-purple-200">Recent (30d)</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.recentTotal}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Tactic Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedTactic}
            onChange={(e) => setSelectedTactic(e.target.value)}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tactics.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic === 'all' ? 'All Tactics' : tactic}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          <div className="flex gap-1">
            {(['cveCount', 'critical', 'recent'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  sortBy === sort
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {sort === 'cveCount' ? 'Total' : sort === 'critical' ? 'Critical' : 'Recent'}
              </button>
            ))}
          </div>
        </div>

        {/* Min CVEs Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Min CVEs:</span>
          <input
            type="number"
            min="1"
            max="50"
            value={minCves}
            onChange={(e) => setMinCves(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="ml-auto text-xs text-gray-400">
          Showing {filteredData.length} techniques
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-h-[600px] overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No technique mappings found</p>
            <p className="text-xs mt-1">Try adjusting your filters or generate mappings from the Overview page</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((tech) => (
              <div
                key={tech.techniqueId}
                onClick={() => setSelectedTechnique(tech.techniqueId)}
                className="group relative bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-all cursor-pointer border border-gray-600 hover:border-blue-500"
              >
                <div className="flex items-start gap-3">
                  {/* Heat Indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-lg ${getHeatColor(tech.cveCount, maxCves)} flex flex-col items-center justify-center`}
                      style={{ opacity: getHeatOpacity(tech.cveCount, maxCves) }}
                    >
                      <div className="text-2xl font-bold text-white">{tech.cveCount}</div>
                      <div className="text-xs text-gray-200">CVEs</div>
                    </div>
                  </div>

                  {/* Technique Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-blue-400">{tech.techniqueId}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                            {tech.tactic}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-2">{tech.techniqueName}</h4>

                        {/* Severity Breakdown */}
                        <div className="flex items-center gap-3 text-xs">
                          {tech.severity.critical > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              <span className="text-gray-300">{tech.severity.critical} Critical</span>
                            </div>
                          )}
                          {tech.severity.high > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                              <span className="text-gray-300">{tech.severity.high} High</span>
                            </div>
                          )}
                          {tech.severity.medium > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                              <span className="text-gray-300">{tech.severity.medium} Medium</span>
                            </div>
                          )}
                          {tech.severity.low > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              <span className="text-gray-300">{tech.severity.low} Low</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Activity Badge */}
                      {tech.recentActivity > 0 && (
                        <div className="flex-shrink-0">
                          <div className="px-2 py-1 bg-purple-900 border border-purple-700 rounded text-xs text-purple-200 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{tech.recentActivity} recent</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Heat Map Legend</h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded opacity-80"></div>
            <span className="text-gray-300">Very High (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-600 rounded opacity-80"></div>
            <span className="text-gray-300">High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-600 rounded opacity-80"></div>
            <span className="text-gray-300">Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded opacity-80"></div>
            <span className="text-gray-300">Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded opacity-80"></div>
            <span className="text-gray-300">Minimal {'(<20%)'}</span>
          </div>
        </div>
      </div>

      {/* CVE Detail Modal */}
      {selectedTechnique && selectedTechniqueData && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTechnique(null)}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-xl shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900 to-blue-900 px-6 py-4 flex items-start justify-between border-b border-gray-700">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-300" />
                    <span className="text-sm font-mono text-purple-300">{selectedTechniqueData.techniqueId}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-800 text-purple-200 rounded">
                      {selectedTechniqueData.tactic}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {selectedTechniqueData.techniqueName}
                  </h2>
                  <p className="text-sm text-blue-200">
                    {selectedTechniqueCVEs.length} CVE{selectedTechniqueCVEs.length !== 1 ? 's' : ''} mapped to this technique
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Total CVEs</p>
                    <p className="text-xl font-bold text-white">{selectedTechniqueData.cveCount}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-red-900">
                    <p className="text-xs text-red-400 mb-1">Critical</p>
                    <p className="text-xl font-bold text-red-400">{selectedTechniqueData.severity.critical}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-orange-900">
                    <p className="text-xs text-orange-400 mb-1">High</p>
                    <p className="text-xl font-bold text-orange-400">{selectedTechniqueData.severity.high}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-purple-900">
                    <p className="text-xs text-purple-400 mb-1">Recent (30d)</p>
                    <p className="text-xl font-bold text-purple-400">{selectedTechniqueData.recentActivity}</p>
                  </div>
                </div>

                {/* CVE List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Related CVEs</h3>
                  {selectedTechniqueCVEs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No CVEs found for this technique
                    </div>
                  ) : (
                    selectedTechniqueCVEs.map((cve, index) => {
                      const severityColors = {
                        CRITICAL: 'border-red-700 bg-red-900/20',
                        HIGH: 'border-orange-700 bg-orange-900/20',
                        MEDIUM: 'border-yellow-700 bg-yellow-900/20',
                        LOW: 'border-green-700 bg-green-900/20',
                      }
                      const severityColor = severityColors[cve.severity.toUpperCase() as keyof typeof severityColors] || 'border-gray-700 bg-gray-800'

                      return (
                        <div
                          key={`${cve.cveId}-${index}`}
                          className={`p-3 rounded-lg border ${severityColor} hover:bg-opacity-40 transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-mono text-sm font-semibold text-white">
                                {cve.cveId}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                cve.severity.toUpperCase() === 'CRITICAL' ? 'bg-red-600 text-white' :
                                cve.severity.toUpperCase() === 'HIGH' ? 'bg-orange-600 text-white' :
                                cve.severity.toUpperCase() === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                                'bg-green-600 text-white'
                              }`}>
                                {cve.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {cve.source.toUpperCase()}
                              </span>
                              {cve.publishedDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(cve.publishedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <a
                              href={`https://nvd.nist.gov/vuln/detail/${cve.cveId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-blue-900/50 transition-colors text-blue-400"
                              title="View on NVD"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
