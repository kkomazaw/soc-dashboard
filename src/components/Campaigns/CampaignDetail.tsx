import { useState } from 'react'
import {
  Target,
  Calendar,
  TrendingUp,
  Eye,
  Shield,
  Network,
  ArrowLeft,
  Activity,
  Users,
  Bug,
  AlertTriangle,
} from 'lucide-react'
import { useCampaign, useCampaignGraph } from '@/hooks/useCampaigns'

interface CampaignDetailProps {
  campaignId: string
  onBack: () => void
}

export const CampaignDetail = ({ campaignId, onBack }: CampaignDetailProps) => {
  const { data: campaign, isLoading, error } = useCampaign(campaignId)
  const { data: graph } = useCampaignGraph(campaignId)
  const [activeTab, setActiveTab] = useState<'overview' | 'relationships' | 'timeline'>('overview')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          キャンペーンが見つかりません
        </h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          一覧に戻る
        </button>
      </div>
    )
  }

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

  const getSophisticationBadge = (sophistication: string) => {
    switch (sophistication) {
      case 'strategic':
        return 'bg-red-600 text-white'
      case 'expert':
        return 'bg-orange-600 text-white'
      case 'advanced':
        return 'bg-yellow-600 text-white'
      default:
        return 'bg-blue-600 text-white'
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

  // Count entities by type from graph
  const threatActorsCount = graph?.entities.filter(e => e.type === 'threat-actor').length || 0
  const malwareCount = graph?.entities.filter(e => e.type === 'malware').length || 0
  const indicatorsCount = graph?.entities.filter(e => e.type === 'indicator').length || 0
  const attackPatternsCount = graph?.entities.filter(e => e.type === 'attack-pattern').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>キャンペーン一覧に戻る</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {campaign.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                {getStatusLabel(campaign.status)}
              </span>
              {campaign.sophistication && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSophisticationBadge(campaign.sophistication)}`}>
                  {getSophisticationLabel(campaign.sophistication)}
                </span>
              )}
              {campaign.objective && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {getObjectiveLabel(campaign.objective)}
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {campaign.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="font-medium">初観測</p>
                  <p>{new Date(campaign.firstSeen).toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
              {campaign.lastSeen && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-medium">最終観測</p>
                    <p>{new Date(campaign.lastSeen).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4" />
                <div>
                  <p className="font-medium">信頼度</p>
                  <p>{campaign.confidence}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                脅威アクター
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {threatActorsCount}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                マルウェア
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {malwareCount}
              </p>
            </div>
            <Bug className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                IoC
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {indicatorsCount}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                攻撃手法
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {attackPatternsCount}
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'relationships'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              関連エンティティ
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              タイムライン
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  キャンペーン情報
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      キャンペーンID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {campaign.campaignId}
                    </dd>
                  </div>
                  {campaign.aliases && campaign.aliases.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        別名
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {campaign.aliases.join(', ')}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      情報源
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {campaign.source || 'manual'}
                    </dd>
                  </div>
                  {campaign.sourceUrl && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        情報元URL
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={campaign.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {campaign.sourceUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'relationships' && graph && (
            <div className="space-y-6">
              {/* Threat Actors */}
              {threatActorsCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    脅威アクター
                  </h3>
                  <div className="space-y-2">
                    {graph.entities
                      .filter((e) => e.type === 'threat-actor')
                      .map((entity) => (
                        <div
                          key={entity.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {entity.name}
                          </p>
                          {entity.data.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {entity.data.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Malware */}
              {malwareCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    マルウェア
                  </h3>
                  <div className="space-y-2">
                    {graph.entities
                      .filter((e) => e.type === 'malware')
                      .map((entity) => (
                        <div
                          key={entity.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {entity.name}
                          </p>
                          {entity.data.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {entity.data.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Indicators */}
              {indicatorsCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    侵害指標 (IoC)
                  </h3>
                  <div className="space-y-2">
                    {graph.entities
                      .filter((e) => e.type === 'indicator')
                      .map((entity) => (
                        <div
                          key={entity.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white font-mono">
                                {entity.name}
                              </p>
                              {entity.data.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {entity.data.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {entity.data.indicatorType}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="mx-auto h-12 w-12 mb-2" />
              <p>タイムライン機能は開発中です</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
