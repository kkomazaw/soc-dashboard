import { useCisaKev } from '@/hooks/useVulnerabilities'
import type { CisaKevItem } from '@/types/vulnerability'
import { Shield, TrendingUp, Calendar, AlertTriangle, Package, Clock } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316']

export const CisaKevAnalytics = () => {
  const { data: vulnerabilities, isLoading, error } = useCisaKev()

  const analytics = useMemo(() => {
    if (!vulnerabilities || vulnerabilities.length === 0) {
      return null
    }

    // 1. Top 10 Vendors
    const vendorCounts = vulnerabilities.reduce((acc, item) => {
      const vendor = item.vendorProject || 'Unknown'
      acc[vendor] = (acc[vendor] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topVendors = Object.entries(vendorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([vendor, count]) => ({ vendor, count }))

    // 2. Top 10 Products
    const productCounts = vulnerabilities.reduce((acc, item) => {
      const product = item.product || 'Unknown'
      acc[product] = (acc[product] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([product, count]) => ({ product, count }))

    // 3. Ransomware Campaign Usage
    const ransomwareStats = {
      known: vulnerabilities.filter(v => v.knownRansomwareCampaignUse).length,
      unknown: vulnerabilities.filter(v => !v.knownRansomwareCampaignUse).length,
    }

    const ransomwareData = [
      { name: 'ランサムウェア利用確認済み', value: ransomwareStats.known },
      { name: '未確認', value: ransomwareStats.unknown },
    ]

    // 4. Monthly trend (last 12 months)
    const now = new Date()
    const monthlyData: Record<string, number> = {}

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[key] = 0
    }

    vulnerabilities.forEach(item => {
      const date = new Date(item.dateAdded)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++
      }
    })

    const trendData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }))

    // 5. Age distribution (days since added)
    const ageDistribution = {
      '0-30日': 0,
      '31-90日': 0,
      '91-180日': 0,
      '181-365日': 0,
      '1年以上': 0,
    }

    vulnerabilities.forEach(item => {
      const daysSinceAdded = Math.floor((now.getTime() - new Date(item.dateAdded).getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceAdded <= 30) {
        ageDistribution['0-30日']++
      } else if (daysSinceAdded <= 90) {
        ageDistribution['31-90日']++
      } else if (daysSinceAdded <= 180) {
        ageDistribution['91-180日']++
      } else if (daysSinceAdded <= 365) {
        ageDistribution['181-365日']++
      } else {
        ageDistribution['1年以上']++
      }
    })

    const ageData = Object.entries(ageDistribution).map(([age, count]) => ({
      age,
      count,
    }))

    // 6. Due date status
    const dueDateStats = {
      overdue: 0,
      within7days: 0,
      within30days: 0,
      moreThan30days: 0,
    }

    vulnerabilities.forEach(item => {
      if (!item.dueDate) return

      const daysUntilDue = Math.floor((new Date(item.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDue < 0) {
        dueDateStats.overdue++
      } else if (daysUntilDue <= 7) {
        dueDateStats.within7days++
      } else if (daysUntilDue <= 30) {
        dueDateStats.within30days++
      } else {
        dueDateStats.moreThan30days++
      }
    })

    const dueDateData = [
      { status: '期限超過', count: dueDateStats.overdue, color: '#ef4444' },
      { status: '7日以内', count: dueDateStats.within7days, color: '#f59e0b' },
      { status: '30日以内', count: dueDateStats.within30days, color: '#3b82f6' },
      { status: '30日超', count: dueDateStats.moreThan30days, color: '#10b981' },
    ]

    return {
      topVendors,
      topProducts,
      ransomwareData,
      trendData,
      ageData,
      dueDateData,
      totalCount: vulnerabilities.length,
      ransomwareCount: ransomwareStats.known,
    }
  }, [vulnerabilities])

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
          CISA KEV Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Known Exploited Vulnerabilities の多面的分析
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">総脆弱性数</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">ランサムウェア利用</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {analytics.ransomwareCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ({((analytics.ransomwareCount / analytics.totalCount) * 100).toFixed(1)}%)
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">影響ベンダー数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {analytics.topVendors.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top 10</p>
            </div>
            <Package className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">今月の追加</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {analytics.trendData[analytics.trendData.length - 1]?.count || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {analytics.trendData[analytics.trendData.length - 1]?.month}
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
            月次追加トレンド（過去12ヶ月）
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

        {/* Ransomware Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            ランサムウェアキャンペーン利用状況
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.ransomwareData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.ransomwareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#6b7280'} />
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

        {/* Top Vendors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            影響を受けるベンダー Top 10
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topVendors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="vendor" type="category" width={100} stroke="#9ca3af" />
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

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            影響を受ける製品 Top 10
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="product" type="category" width={120} stroke="#9ca3af" />
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

        {/* Age Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            カタログ登録からの経過時間
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

        {/* Due Date Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            修正期限ステータス
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dueDateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count">
                {analytics.dueDateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
