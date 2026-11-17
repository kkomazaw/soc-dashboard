import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Newspaper,
  Shield,
  TrendingUp,
  Activity,
  Globe,
  Database,
  Clock,
  AlertCircle,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import { fetchCisaKev } from '@/services/api/cisaApi'
import { getJvnVulnerabilities } from '@/services/api/jvnApi'
import { getNvdCves } from '@/services/api/nvdApi'
import { getAllRedHatData } from '@/services/api/redhatApi'
import { fetchAllRssFeeds } from '@/services/api/rssParser'
import { getApiStatus } from '@/services/api/iocApi'
import { getMatrix } from '@/services/api/attackApi'
import { getMappingStats, triggerMappingAll } from '@/services/api/mappingApi'
import { SeverityDistributionChart } from './SeverityDistributionChart'
import { VulnerabilityTimelineChart } from './VulnerabilityTimelineChart'
import { AttackTacticsChart } from './AttackTacticsChart'
import { HelpTooltip } from '../common/HelpTooltip'
import { useSearch } from '@/contexts/SearchContext'

interface OverviewProps {
  onViewChange?: (view: string) => void
}

export const Overview = ({ onViewChange }: OverviewProps) => {
  const queryClient = useQueryClient()
  const { updateFilters } = useSearch()

  const { data: cisaData } = useQuery({
    queryKey: ['cisa-kev'],
    queryFn: fetchCisaKev,
  })

  const { data: jvnData } = useQuery({
    queryKey: ['jvn-vulnerabilities'],
    queryFn: getJvnVulnerabilities,
  })

  const { data: nvdData } = useQuery({
    queryKey: ['nvd-cves'],
    queryFn: getNvdCves,
  })

  const { data: redhatData } = useQuery({
    queryKey: ['redhat-all'],
    queryFn: getAllRedHatData,
  })

  const { data: newsData } = useQuery({
    queryKey: ['news'],
    queryFn: fetchAllRssFeeds,
  })

  const { data: iocStatus } = useQuery({
    queryKey: ['ioc-status'],
    queryFn: getApiStatus,
  })

  const { data: attackMatrix } = useQuery({
    queryKey: ['attack-matrix'],
    queryFn: getMatrix,
  })

  const { data: mappingStats } = useQuery({
    queryKey: ['mapping-stats'],
    queryFn: getMappingStats,
  })

  const mappingMutation = useMutation({
    mutationFn: triggerMappingAll,
    onSuccess: () => {
      // Refetch mapping stats after successful trigger
      queryClient.invalidateQueries({ queryKey: ['mapping-stats'] })
      alert('Mapping process started! This will run in the background. Refresh the page in a few moments to see updated statistics.')
    },
    onError: (error) => {
      console.error('Mapping trigger failed:', error)
      alert('Failed to trigger mapping process. Please check the console for details.')
    },
  })

  const handleGenerateMappings = () => {
    if (confirm('This will analyze all vulnerabilities and map them to ATT&CK techniques. This may take a few minutes. Continue?')) {
      mappingMutation.mutate()
    }
  }

  const handleCriticalThreatsClick = () => {
    if (onViewChange) {
      // Set filter to CRITICAL severity
      updateFilters({
        severity: ['CRITICAL'],
        sources: [], // Clear source filter to show all sources
        dateRange: { start: null, end: null }, // Clear date range
      })
      // Navigate to global search
      onViewChange('global-search')
    }
  }

  const handleHighSeverityClick = () => {
    if (onViewChange) {
      // Set filter to HIGH severity
      updateFilters({
        severity: ['HIGH'],
        sources: [], // Clear source filter to show all sources
        dateRange: { start: null, end: null }, // Clear date range
      })
      // Navigate to global search
      onViewChange('global-search')
    }
  }

  const handleCisaKevClick = () => {
    if (onViewChange) {
      // Set filter to CISA KEV source with last 3 days
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const today = new Date()

      updateFilters({
        severity: [], // Clear severity filter
        sources: ['cisa'], // Filter by CISA KEV
        dateRange: {
          start: threeDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        },
      })
      // Navigate to global search
      onViewChange('global-search')
    }
  }

  const handleNewsClick = () => {
    if (onViewChange) {
      // Navigate to news page
      onViewChange('news')
    }
  }

  const handleDataSourceClick = (source: string) => {
    if (onViewChange) {
      switch (source) {
        case 'cisa':
          onViewChange('cisa-kev')
          break
        case 'jvn':
          onViewChange('jvn')
          break
        case 'nvd':
          onViewChange('nvd')
          break
        case 'redhat':
          onViewChange('redhat')
          break
      }
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRecentCisaVulns = () => {
    if (!cisaData) return []
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return cisaData.filter(
      (item) => new Date(item.dateAdded) >= threeDaysAgo
    )
  }

  const getRecentNews = () => {
    if (!newsData) return []
    return newsData.slice(0, 5)
  }

  const getTotalCritical = () => {
    let count = 0

    // CISA KEV - all entries are CRITICAL (actively exploited)
    if (cisaData) {
      count += cisaData.length
    }

    // JVN Critical
    if (jvnData?.data) {
      count += jvnData.data.filter((item: any) =>
        item.severity?.toUpperCase() === 'CRITICAL'
      ).length
    }

    // NVD Critical
    if (nvdData?.data) {
      count += nvdData.data.filter((item: any) =>
        item.severity?.toUpperCase() === 'CRITICAL'
      ).length
    }

    // Red Hat CVEs - Critical only
    if (redhatData?.cves) {
      count += redhatData.cves.filter((cve: any) =>
        cve.severity?.toUpperCase() === 'CRITICAL'
      ).length
    }

    // Red Hat Advisories - Critical only
    if (redhatData?.advisories) {
      count += redhatData.advisories.filter((adv: any) =>
        adv.severity?.toUpperCase() === 'CRITICAL' && adv.cves && adv.cves.length > 0
      ).length
    }

    return count
  }

  const getTotalHigh = () => {
    let count = 0

    // JVN High
    if (jvnData?.data) {
      count += jvnData.data.filter((item: any) =>
        item.severity?.toUpperCase() === 'HIGH'
      ).length
    }

    // NVD High
    if (nvdData?.data) {
      count += nvdData.data.filter((item: any) =>
        item.severity?.toUpperCase() === 'HIGH'
      ).length
    }

    // Red Hat CVEs - High and Important
    if (redhatData?.cves) {
      count += redhatData.cves.filter((cve: any) => {
        const severity = cve.severity?.toUpperCase()
        return severity === 'HIGH' || severity === 'IMPORTANT'
      }).length
    }

    // Red Hat Advisories - High and Important
    if (redhatData?.advisories) {
      count += redhatData.advisories.filter((adv: any) => {
        const severity = adv.severity?.toUpperCase()
        return (severity === 'HIGH' || severity === 'IMPORTANT') && adv.cves && adv.cves.length > 0
      }).length
    }

    return count
  }

  const getSeverityDistribution = () => {
    let critical = 0
    let high = 0
    let medium = 0
    let low = 0

    // CISA KEV - all entries are CRITICAL
    if (cisaData) {
      critical += cisaData.length
    }

    // JVN
    if (jvnData?.data) {
      jvnData.data.forEach((item: any) => {
        const sev = item.severity?.toUpperCase()
        if (sev === 'CRITICAL') critical++
        else if (sev === 'HIGH') high++
        else if (sev === 'MEDIUM') medium++
        else if (sev === 'LOW') low++
      })
    }

    // NVD
    if (nvdData?.data) {
      nvdData.data.forEach((item: any) => {
        const sev = item.severity?.toUpperCase()
        if (sev === 'CRITICAL') critical++
        else if (sev === 'HIGH') high++
        else if (sev === 'MEDIUM') medium++
        else if (sev === 'LOW') low++
      })
    }

    // Red Hat CVEs
    if (redhatData?.cves) {
      redhatData.cves.forEach((cve: any) => {
        const sev = cve.severity?.toUpperCase()
        if (sev === 'CRITICAL') critical++
        else if (sev === 'HIGH' || sev === 'IMPORTANT') high++
        else if (sev === 'MEDIUM' || sev === 'MODERATE') medium++
        else if (sev === 'LOW') low++
      })
    }

    // Red Hat Advisories (only count those with CVEs)
    if (redhatData?.advisories) {
      redhatData.advisories.forEach((adv: any) => {
        if (adv.cves && adv.cves.length > 0) {
          const sev = adv.severity?.toUpperCase()
          if (sev === 'CRITICAL') critical++
          else if (sev === 'HIGH' || sev === 'IMPORTANT') high++
          else if (sev === 'MEDIUM' || sev === 'MODERATE') medium++
          else if (sev === 'LOW') low++
        }
      })
    }

    return { critical, high, medium, low }
  }

  const getAllVulnerabilities = () => {
    const cisa = cisaData?.filter(v => v.dateAdded).map((v) => ({
      dateAdded: v.dateAdded,
      severity: 'CRITICAL', // CISA KEV are actively exploited, treated as critical
    })) || []

    const jvn = jvnData?.data?.filter((v: any) => v.publishedDate).map((v: any) => ({
      dateAdded: v.publishedDate,
      severity: v.severity,
    })) || []

    const nvd = nvdData?.data?.filter((v: any) => v.publishedDate).map((v: any) => ({
      dateAdded: v.publishedDate,
      severity: v.severity,
    })) || []

    // Red Hat CVEs
    const redhatCves = redhatData?.cves?.filter((v: any) => v.publicDate).map((v: any) => ({
      dateAdded: v.publicDate,
      severity: v.severity?.toUpperCase() === 'IMPORTANT' ? 'HIGH' : v.severity?.toUpperCase(),
    })) || []

    // Red Hat Advisories
    const redhatAdvisories = redhatData?.advisories?.filter((v: any) => v.publicDate).map((v: any) => ({
      dateAdded: v.publicDate,
      severity: v.severity?.toUpperCase() === 'IMPORTANT' ? 'HIGH' : v.severity?.toUpperCase(),
    })) || []

    return [...cisa, ...jvn, ...nvd, ...redhatCves, ...redhatAdvisories]
  }

  const getTacticsData = () => {
    if (!attackMatrix?.data) return []

    return attackMatrix.data.map((tactic: any) => ({
      name: tactic.name,
      techniqueCount: tactic.techniqueDetails?.length || 0,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SOC Dashboard Overview</h2>
          <HelpTooltip
            title="SOCダッシュボードについて"
            content={[
              'SOC（Security Operations Center）の統合ダッシュボードです。複数の脅威インテリジェンスソースから収集した情報を一元的に表示します。',
              'CISA KEV（実際に悪用されている脆弱性）、NVD（包括的なCVEデータベース）、JVN（日本の脆弱性情報）、Red Hat、セキュリティニュースなど、重要な情報源を統合しています。',
              '重要度別の脆弱性分布、時系列の脆弱性トレンド、MITRE ATT&CKの戦術別テクニック分布などを視覚化して、セキュリティ態勢を包括的に把握できます。',
              '',
              '【クリック可能な要素】',
              '統計カード（上部）:',
              '• Critical Threats → 全ソースのCRITICAL脆弱性を検索',
              '• High Severity → 全ソースのHIGH脆弱性を検索',
              '• CISA KEV (Active) → 過去3日間のCISA KEV脆弱性を検索',
              '• News Updates → セキュリティニュースページへ移動',
              '',
              'データソース統計:',
              '• 各データソース（CISA KEV、JVN、NVD、Red Hat）をクリックすると、該当ソースの詳細ページへ移動します'
            ]}
            size="md"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Security Operations Center - 脅威インテリジェンス統合ダッシュボード
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={handleCriticalThreatsClick}
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-700 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Critical Threats</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-300 mt-2">
                {getTotalCritical()}
              </p>
              <p className="text-xs text-red-700 dark:text-red-200 mt-1">CISA KEV + CVSS 9.0+</p>
            </div>
            <div className="bg-red-200 dark:bg-red-700 rounded-full p-3">
              <AlertTriangle className="w-8 h-8 text-red-700 dark:text-red-200" />
            </div>
          </div>
        </div>

        <div
          onClick={handleHighSeverityClick}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg shadow-md p-6 border border-orange-200 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">High Severity</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-300 mt-2">
                {getTotalHigh()}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-200 mt-1">CVSS 7.0-8.9</p>
            </div>
            <div className="bg-orange-200 dark:bg-orange-700 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-orange-700 dark:text-orange-200" />
            </div>
          </div>
        </div>

        <div
          onClick={handleCisaKevClick}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">CISA KEV (Active)</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                {getRecentCisaVulns().length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">Last 3 days</p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-700 rounded-full p-3">
              <Shield className="w-8 h-8 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </div>

        <div
          onClick={handleNewsClick}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-700 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">News Updates</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-300 mt-2">
                {newsData?.length || 0}
              </p>
              <p className="text-xs text-green-700 dark:text-green-200 mt-1">Recent articles</p>
            </div>
            <div className="bg-green-200 dark:bg-green-700 rounded-full p-3">
              <Newspaper className="w-8 h-8 text-green-700 dark:text-green-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Data Sources Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CISA KEV */}
          <div
            onClick={() => handleDataSourceClick('cisa')}
            className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-2 -ml-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">CISA KEV</p>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cisaData?.length || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Known Exploited Vulnerabilities</p>
          </div>

          {/* JVN */}
          <div
            onClick={() => handleDataSourceClick('jvn')}
            className="border-l-4 border-purple-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-2 -ml-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">JVN</p>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {jvnData?.stats.total || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Japan Vulnerability Notes ({jvnData?.stats.recent24h || 0} new today)
            </p>
          </div>

          {/* NVD */}
          <div
            onClick={() => handleDataSourceClick('nvd')}
            className="border-l-4 border-indigo-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-2 -ml-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">NVD</p>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {nvdData?.stats.total || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              CVE Database ({nvdData?.stats.recent24h || 0} new today)
            </p>
          </div>

          {/* Red Hat */}
          <div
            onClick={() => handleDataSourceClick('redhat')}
            className="border-l-4 border-red-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-2 -ml-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">Red Hat</p>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {((redhatData?.cves?.length || 0) + (redhatData?.advisories?.length || 0))}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Red Hat Security ({redhatData?.cves?.length || 0} CVEs, {redhatData?.advisories?.length || 0} Advisories)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Visual Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Severity Distribution */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Severity Distribution
            </h4>
            <SeverityDistributionChart data={getSeverityDistribution()} />
          </div>

          {/* Vulnerability Timeline */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              30-Day Vulnerability Trend
            </h4>
            <VulnerabilityTimelineChart
              vulnerabilities={getAllVulnerabilities()}
              days={30}
            />
          </div>

          {/* MITRE ATT&CK Tactics */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              MITRE ATT&CK Tactics Distribution
            </h4>
            <AttackTacticsChart tactics={getTacticsData()} />
          </div>
        </div>
      </div>

      {/* CVE-to-ATT&CK Mapping Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            CVE-to-ATT&CK Mapping
          </h3>
          <button
            onClick={handleGenerateMappings}
            disabled={mappingMutation.isPending}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mappingMutation.isPending ? 'Processing...' : 'Generate Mappings'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 rounded-lg p-4">
            <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium">Total Mappings</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mt-2">
              {mappingStats?.total || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
            <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">Mapped CVEs</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
              {mappingStats?.uniqueCves || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 rounded-lg p-4">
            <p className="text-sm text-pink-900 dark:text-pink-100 font-medium">ATT&CK Techniques</p>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-300 mt-2">
              {mappingStats?.uniqueTechniques || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800 rounded-lg p-4">
            <p className="text-sm text-cyan-900 dark:text-cyan-100 font-medium">High Confidence</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-300 mt-2">
              {mappingStats?.byConfidence?.high || 0}
            </p>
          </div>
        </div>
      </div>

      {/* IoC Services Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          Threat Intelligence Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${iocStatus?.virusTotal.configured ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100">VirusTotal</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              iocStatus?.virusTotal.configured
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {iocStatus?.virusTotal.configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${iocStatus?.abuseIPDB.configured ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100">AbuseIPDB</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              iocStatus?.abuseIPDB.configured
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {iocStatus?.abuseIPDB.configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${iocStatus?.otx?.configured ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100">AlienVault OTX</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              iocStatus?.otx?.configured
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
            }`}>
              {iocStatus?.otx?.configured ? 'Configured' : 'Public API'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${iocStatus?.threatFox?.available ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100">ThreatFox</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              iocStatus?.threatFox?.available
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {iocStatus?.threatFox?.available ? 'Active' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${iocStatus?.feodoTracker?.available ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100">Feodo Tracker</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              iocStatus?.feodoTracker?.available
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {iocStatus?.feodoTracker?.available ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent CISA KEV */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
            Recent CISA KEV Additions
          </h3>
          {getRecentCisaVulns().length > 0 ? (
            <div className="space-y-3">
              {getRecentCisaVulns().slice(0, 5).map((vuln) => (
                <div
                  key={vuln.cveId}
                  className="border-l-4 border-red-500 pl-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm inline-flex items-center gap-1"
                      >
                        {vuln.cveId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {vuln.vendorProject} - {vuln.product}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(vuln.dateAdded)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent additions in the last 3 days</p>
          )}
        </div>

        {/* Recent News */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Newspaper className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Latest Security News
          </h3>
          {getRecentNews().length > 0 ? (
            <div className="space-y-3">
              {getRecentNews().map((article) => (
                <div key={article.guid} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 line-clamp-2 block"
                  >
                    {article.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent news available</p>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm opacity-90">Total Vulnerabilities</p>
            <p className="text-3xl font-bold mt-1">
              {(cisaData?.length || 0) + (jvnData?.stats.total || 0) + (nvdData?.stats.total || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Last 7 Days</p>
            <p className="text-3xl font-bold mt-1">
              {(jvnData?.stats.recent7days || 0) + (nvdData?.stats.recent7days || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">News Articles</p>
            <p className="text-3xl font-bold mt-1">
              {newsData?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Services Active</p>
            <p className="text-3xl font-bold mt-1">
              {3 + (iocStatus?.virusTotal.configured ? 1 : 0) + (iocStatus?.abuseIPDB.configured ? 1 : 0) + 1 + (iocStatus?.threatFox?.available ? 1 : 0) + (iocStatus?.feodoTracker?.available ? 1 : 0)}
              /8
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
