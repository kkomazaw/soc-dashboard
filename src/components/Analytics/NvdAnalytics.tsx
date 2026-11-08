import { useQuery } from '@tanstack/react-query'
import { getNvdCves } from '@/services/api/nvdApi'
import type { NvdCve } from '@/services/api/nvdApi'
import { Shield, TrendingUp, Calendar, AlertTriangle, BarChart3, Activity } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  NONE: '#6b7280',
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316']

export const NvdAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['nvd-cves'],
    queryFn: getNvdCves,
  })

  const analytics = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return null
    }

    const cves = data.data

    // 1. Severity distribution
    const severityCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    }

    cves.forEach(cve => {
      const severity = (cve.cvssSeverity?.toUpperCase() || 'NONE')
      if (severityCounts[severity] !== undefined) {
        severityCounts[severity]++
      } else {
        severityCounts.NONE++
      }
    })

    const severityData = Object.entries(severityCounts)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => ({
        severity,
        count,
        color: SEVERITY_COLORS[severity],
      }))

    // 2. CVSS score distribution (ranges)
    const scoreDistribution: Record<string, number> = {
      '0.0-3.9': 0,
      '4.0-6.9': 0,
      '7.0-8.9': 0,
      '9.0-10.0': 0,
      '未採点': 0,
    }

    cves.forEach(cve => {
      if (!cve.cvssScore) {
        scoreDistribution['未採点']++
      } else if (cve.cvssScore < 4.0) {
        scoreDistribution['0.0-3.9']++
      } else if (cve.cvssScore < 7.0) {
        scoreDistribution['4.0-6.9']++
      } else if (cve.cvssScore < 9.0) {
        scoreDistribution['7.0-8.9']++
      } else {
        scoreDistribution['9.0-10.0']++
      }
    })

    const scoreData = Object.entries(scoreDistribution).map(([range, count]) => ({
      range,
      count,
    }))

    // 3. Monthly trend (last 12 months)
    const now = new Date()
    const monthlyData: Record<string, number> = {}

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[key] = 0
    }

    cves.forEach(cve => {
      const date = new Date(cve.published)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++
      }
    })

    const trendData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }))

    // 4. Age distribution (days since published)
    const ageDistribution: Record<string, number> = {
      '0-7日': 0,
      '8-30日': 0,
      '31-90日': 0,
      '91-180日': 0,
      '180日超': 0,
    }

    cves.forEach(cve => {
      const daysSincePublished = Math.floor((now.getTime() - new Date(cve.published).getTime()) / (1000 * 60 * 60 * 24))

      if (daysSincePublished <= 7) {
        ageDistribution['0-7日']++
      } else if (daysSincePublished <= 30) {
        ageDistribution['8-30日']++
      } else if (daysSincePublished <= 90) {
        ageDistribution['31-90日']++
      } else if (daysSincePublished <= 180) {
        ageDistribution['91-180日']++
      } else {
        ageDistribution['180日超']++
      }
    })

    const ageData = Object.entries(ageDistribution).map(([age, count]) => ({
      age,
      count,
    }))

    // 5. Vulnerability status distribution
    const statusCounts: Record<string, number> = {}

    cves.forEach(cve => {
      const status = cve.vulnStatus || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const statusData = Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([status, count]) => ({
        status,
        count,
      }))

    // 6. CVSS version distribution
    const versionCounts: Record<string, number> = {
      'v3.1': 0,
      'v2.0': 0,
      '未採点': 0,
    }

    cves.forEach(cve => {
      if (!cve.cvssVersion) {
        versionCounts['未採点']++
      } else if (cve.cvssVersion === 'v3.1') {
        versionCounts['v3.1']++
      } else if (cve.cvssVersion === 'v2.0') {
        versionCounts['v2.0']++
      }
    })

    const versionData = Object.entries(versionCounts)
      .filter(([, count]) => count > 0)
      .map(([version, count]) => ({
        version,
        count,
      }))

    // Calculate statistics
    const cvssScores = cves.filter(c => c.cvssScore).map(c => c.cvssScore!)
    const avgCvssScore = cvssScores.length > 0
      ? cvssScores.reduce((a, b) => a + b, 0) / cvssScores.length
      : 0

    const criticalHighCount = severityCounts.CRITICAL + severityCounts.HIGH

    return {
      severityData,
      scoreData,
      trendData,
      ageData,
      statusData,
      versionData,
      totalCount: cves.length,
      criticalHighCount,
      avgCvssScore,
      currentMonthCount: trendData[trendData.length - 1]?.count || 0,
      currentMonth: trendData[trendData.length - 1]?.month || '',
    }
  }, [data])

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

  if (!analytics) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">データがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          NVD CVE Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          National Vulnerability Database の多面的分析
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">総CVE数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {analytics.totalCount}
              </p>
            </div>
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical/High</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {analytics.criticalHighCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ({((analytics.criticalHighCount / analytics.totalCount) * 100).toFixed(1)}%)
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均CVSSスコア</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {analytics.avgCvssScore.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CVSS Base Score</p>
            </div>
            <Activity className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">今月の公開</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {analytics.currentMonthCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {analytics.currentMonth}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            月次公開トレンド（過去12ヶ月）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            CVSS深刻度分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ severity, percent }) => `${severity}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* CVSS Score Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            CVSSスコア分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CVSS Version Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            CVSSバージョン分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.versionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ version, percent }) => `${version}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.versionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            公開からの経過時間
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="age" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vulnerability Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            脆弱性ステータス分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="status" type="category" width={120} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
