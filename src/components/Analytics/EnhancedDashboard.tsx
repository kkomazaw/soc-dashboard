import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, Target, Globe, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchCisaKev } from '@/services/api/cisaApi'
import { getJvnVulnerabilities } from '@/services/api/jvnApi'
import { getNvdCves } from '@/services/api/nvdApi'
import { getMatrix } from '@/services/api/attackApi'
import { getMappingStats, getAllMappings, triggerMappingAll } from '@/services/api/mappingApi'
import { AdvancedTrendsChart } from './AdvancedTrendsChart'
import { AttackHeatMap } from './AttackHeatMap'
import { ThreatGeography } from './ThreatGeography'
import { useState } from 'react'

export const EnhancedDashboard = () => {
  const [isGeneratingMappings, setIsGeneratingMappings] = useState(false)

  const { data: cisaData, isLoading: cisaLoading } = useQuery({
    queryKey: ['cisa-kev'],
    queryFn: fetchCisaKev,
  })

  const { data: jvnData, isLoading: jvnLoading } = useQuery({
    queryKey: ['jvn-vulnerabilities'],
    queryFn: getJvnVulnerabilities,
  })

  const { data: nvdData, isLoading: nvdLoading } = useQuery({
    queryKey: ['nvd-cves'],
    queryFn: getNvdCves,
  })

  const { data: attackMatrix, isLoading: attackLoading } = useQuery({
    queryKey: ['attack-matrix'],
    queryFn: getMatrix,
  })

  const { data: mappingStats, isLoading: mappingLoading } = useQuery({
    queryKey: ['mapping-stats'],
    queryFn: getMappingStats,
  })

  const { data: allMappings, isLoading: allMappingsLoading, refetch: refetchMappings } = useQuery({
    queryKey: ['all-mappings'],
    queryFn: getAllMappings,
    retry: 1,
  })

  const isLoading = cisaLoading || jvnLoading || nvdLoading || attackLoading || mappingLoading || allMappingsLoading

  const handleGenerateMappings = async () => {
    setIsGeneratingMappings(true)
    try {
      await triggerMappingAll()
      // Wait a bit for the backend to process
      setTimeout(() => {
        refetchMappings()
        setIsGeneratingMappings(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to generate mappings:', error)
      setIsGeneratingMappings(false)
    }
  }

  // Combine all vulnerabilities for trend analysis
  const getAllVulnerabilities = () => {
    const cisa = cisaData?.filter(v => v.dateAdded).map((v) => ({
      dateAdded: v.dateAdded,
      severity: 'CRITICAL',
      source: 'cisa',
    })) || []

    const jvn = jvnData?.data?.filter((v: any) => v.publishedDate).map((v: any) => ({
      dateAdded: v.publishedDate,
      severity: v.severity,
      source: 'jvn',
    })) || []

    const nvd = nvdData?.data?.filter((v: any) => v.publishedDate).map((v: any) => ({
      dateAdded: v.publishedDate,
      severity: v.severity,
      source: 'nvd',
    })) || []

    return [...cisa, ...jvn, ...nvd]
  }

  // Get CVE-to-ATT&CK mappings from the API
  const getMappings = () => {
    if (!allMappings) return []

    // Transform API mappings to the format expected by AttackHeatMap
    return allMappings.map((mapping) => ({
      cveId: mapping.cveId,
      techniqueId: mapping.technique?.id || mapping.techniqueId,
      techniqueName: mapping.technique?.name || '',
      tactic: mapping.technique?.tactics?.[0] || 'Unknown',
      severity: 'MEDIUM', // We'll need to join with CVE data to get actual severity
      publishedDate: mapping.createdAt,
      source: mapping.source,
    }))
  }

  const getTechniques = () => {
    // Extract techniques from attack matrix
    if (!attackMatrix?.data) return []

    const techniques: any[] = []
    attackMatrix.data.forEach((tactic: any) => {
      if (tactic.techniqueDetails) {
        tactic.techniqueDetails.forEach((tech: any) => {
          techniques.push({
            ...tech,
            tactic: tactic.name,
          })
        })
      }
    })

    return techniques
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading enhanced analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-800">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7" />
          Enhanced Security Analytics
        </h2>
        <p className="text-blue-200">
          Advanced threat intelligence visualization and trend analysis for SOC operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border border-blue-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Total Vulnerabilities</p>
              <p className="text-2xl font-bold text-white">
                {(cisaData?.length || 0) + (jvnData?.stats.total || 0) + (nvdData?.stats.total || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4 border border-red-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 rounded-lg p-3">
              <AlertCircle className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <p className="text-sm text-red-200">Critical Severity</p>
              <p className="text-2xl font-bold text-white">
                {(nvdData?.stats.bySeverity.critical || 0) + (jvnData?.stats.bySeverity.critical || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-700 rounded-lg p-3">
              <Target className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <p className="text-sm text-purple-200">ATT&CK Mappings</p>
              <p className="text-2xl font-bold text-white">
                {mappingStats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 border border-green-700">
          <div className="flex items-center gap-3">
            <div className="bg-green-700 rounded-lg p-3">
              <Globe className="w-6 h-6 text-green-200" />
            </div>
            <div>
              <p className="text-sm text-green-200">CISA KEV</p>
              <p className="text-2xl font-bold text-white">
                {cisaData?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Vulnerability Trends */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Advanced Vulnerability Trends</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Interactive time-series analysis with multiple view modes, time ranges, and chart types
        </p>
        <AdvancedTrendsChart vulnerabilities={getAllVulnerabilities()} />
      </div>

      {/* Attack Pattern Heat Map */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Attack Pattern Heat Map</h3>
          </div>
          {(!allMappings || allMappings.length === 0) && (
            <button
              onClick={handleGenerateMappings}
              disabled={isGeneratingMappings}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingMappings ? 'animate-spin' : ''}`} />
              {isGeneratingMappings ? 'Generating Mappings...' : 'Generate Mappings'}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-4">
          CVE-to-ATT&CK technique correlation analysis showing which attack techniques are most commonly exploited
        </p>
        <AttackHeatMap mappings={getMappings()} techniques={getTechniques()} />
      </div>

      {/* Geographic Threat Distribution */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Geographic Threat Distribution</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Global threat activity by country with severity breakdown and top threat types
        </p>
        <ThreatGeography />
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-lg p-6 border border-indigo-800">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-800 bg-opacity-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-200 mb-2">Trend Analysis</h4>
            <ul className="text-sm text-indigo-100 space-y-1">
              <li>• Use time range filters to identify vulnerability spikes</li>
              <li>• Compare severity distributions across different periods</li>
              <li>• Enable 7-day moving average to smooth out daily fluctuations</li>
              <li>• Switch between line, area, and bar charts for different perspectives</li>
            </ul>
          </div>
          <div className="bg-indigo-800 bg-opacity-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-200 mb-2">Attack Patterns</h4>
            <ul className="text-sm text-indigo-100 space-y-1">
              <li>• Identify most exploited ATT&CK techniques</li>
              <li>• Filter by tactic to focus on specific attack stages</li>
              <li>• Monitor recent activity (30 days) for emerging threats</li>
              <li>• Prioritize patching based on critical technique mappings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
