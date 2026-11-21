import { useState, useMemo } from 'react'
import {
  Target,
  AlertTriangle,
  Calendar,
  Search,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Eye,
} from 'lucide-react'
import { useCampaigns, useCampaignStats } from '@/hooks/useCampaigns'
import type { Campaign } from '@/types/campaign'

interface CampaignsListProps {
  onCampaignClick?: (campaignId: string) => void
}

export const CampaignsList = ({ onCampaignClick }: CampaignsListProps) => {
  // Fetch campaigns and stats from API
  const { data: campaigns, isLoading, error } = useCampaigns()
  const { data: stats } = useCampaignStats()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedObjective, setSelectedObjective] = useState<string[]>([])
  const [selectedSophistication, setSelectedSophistication] = useState<string[]>([])
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null)

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return []

    return campaigns
      .filter((campaign) => {
        // Search filter
        const matchesSearch =
          !searchQuery ||
          campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.campaignId.toLowerCase().includes(searchQuery.toLowerCase())

        // Status filter
        const matchesStatus =
          selectedStatus.length === 0 || selectedStatus.includes(campaign.status)

        // Objective filter
        const matchesObjective =
          selectedObjective.length === 0 ||
          (campaign.objective && selectedObjective.includes(campaign.objective))

        // Sophistication filter
        const matchesSophistication =
          selectedSophistication.length === 0 ||
          (campaign.sophistication &&
            selectedSophistication.includes(campaign.sophistication))

        return matchesSearch && matchesStatus && matchesObjective && matchesSophistication
      })
      .sort((a, b) => {
        const dateA = new Date(a.firstSeen).getTime()
        const dateB = new Date(b.firstSeen).getTime()
        return dateB - dateA
      })
  }, [campaigns, searchQuery, selectedStatus, selectedObjective, selectedSophistication])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const getObjectiveColor = (objective: string) => {
    switch (objective) {
      case 'espionage':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'financial-gain':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'disruption':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getSophisticationBadge = (sophistication: string) => {
    switch (sophistication) {
      case 'strategic':
        return 'bg-red-600 text-white'
      case 'expert':
        return 'bg-orange-600 text-white'
      case 'advanced':
        return 'bg-yellow-600 text-white'
      case 'intermediate':
        return 'bg-blue-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      espionage: 'スパイ活動',
      'financial-gain': '金銭目的',
      disruption: '破壊活動',
      'data-theft': 'データ窃取',
    }
    return labels[objective] || objective
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '活動中',
      inactive: '非活動',
      ongoing: '進行中',
    }
    return labels[status] || status
  }

  const getSophisticationLabel = (sophistication: string) => {
    const labels: Record<string, string> = {
      strategic: '戦略的',
      expert: 'エキスパート',
      advanced: '高度',
      intermediate: '中級',
      novice: '初級',
    }
    return labels[sophistication] || sophistication
  }

  const toggleFilter = (
    filterType: 'status' | 'objective' | 'sophistication',
    value: string
  ) => {
    if (filterType === 'status') {
      setSelectedStatus((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
    } else if (filterType === 'objective') {
      setSelectedObjective((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
    } else {
      setSelectedSophistication((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
    }
  }

  const handleCampaignClick = (campaignId: string) => {
    if (onCampaignClick) {
      onCampaignClick(campaignId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          データの読み込みに失敗しました
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error ? error.message : 'エラーが発生しました'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                重大キャンペーン
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                脅威アクターによる大規模攻撃キャンペーンの追跡
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    総キャンペーン数
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.total}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    活動中
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.byStatus.active}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    スパイ活動
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.byObjective.espionage}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    エキスパート級
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.bySophistication.expert}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="キャンペーン名、説明、IDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">フィルター</h3>
        </div>

        <div className="space-y-3">
          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              状態
            </p>
            <div className="flex flex-wrap gap-2">
              {['active', 'ongoing', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => toggleFilter('status', status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedStatus.includes(status)
                      ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Objective Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              目的
            </p>
            <div className="flex flex-wrap gap-2">
              {['espionage', 'financial-gain', 'disruption'].map((objective) => (
                <button
                  key={objective}
                  onClick={() => toggleFilter('objective', objective)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedObjective.includes(objective)
                      ? getObjectiveColor(objective) +
                        ' ring-2 ring-offset-2 ring-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getObjectiveLabel(objective)}
                </button>
              ))}
            </div>
          </div>

          {/* Sophistication Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              洗練度
            </p>
            <div className="flex flex-wrap gap-2">
              {['strategic', 'expert', 'advanced'].map((sophistication) => (
                <button
                  key={sophistication}
                  onClick={() => toggleFilter('sophistication', sophistication)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSophistication.includes(sophistication)
                      ? getSophisticationBadge(sophistication) +
                        ' ring-2 ring-offset-2 ring-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getSophisticationLabel(sophistication)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              該当するキャンペーンはありません
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              フィルターを変更するか、検索条件を見直してください
            </p>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <div
              key={campaign.campaignId}
              className="bg-white dark:bg-gray-800 shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCampaignClick(campaign.campaignId)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                      {campaign.sophistication && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSophisticationBadge(campaign.sophistication)}`}>
                          {getSophisticationLabel(campaign.sophistication)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {campaign.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          初観測: {new Date(campaign.firstSeen).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      {campaign.lastSeen && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            最終観測: {new Date(campaign.lastSeen).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      )}
                      {campaign.objective && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getObjectiveColor(campaign.objective)}`}>
                          {getObjectiveLabel(campaign.objective)}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>信頼度: {campaign.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
