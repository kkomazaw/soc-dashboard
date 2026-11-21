import { useState, useMemo } from 'react'
import {
  Users,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Globe,
  Target,
  TrendingUp,
  Eye,
  Shield,
} from 'lucide-react'
import { useThreatActors, useThreatActorStats } from '@/hooks/useThreatActors'

export const ThreatActorsList = () => {
  const { data: actors, isLoading, error } = useThreatActors()
  const { data: stats } = useThreatActorStats()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string[]>([])
  const [selectedOrigin, setSelectedOrigin] = useState<string[]>([])

  // Filter threat actors
  const filteredActors = useMemo(() => {
    if (!actors) return []

    return actors
      .filter((actor) => {
        // Search filter
        const matchesSearch =
          !searchQuery ||
          actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (actor.description && actor.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          actor.actorId.toLowerCase().includes(searchQuery.toLowerCase())

        // Type filter
        const matchesType = selectedType.length === 0 || selectedType.includes(actor.actorType)

        // Origin filter
        const matchesOrigin =
          selectedOrigin.length === 0 || (actor.origin && selectedOrigin.includes(actor.origin))

        return matchesSearch && matchesType && matchesOrigin
      })
      .sort((a, b) => {
        const dateA = a.firstSeen ? new Date(a.firstSeen).getTime() : 0
        const dateB = b.firstSeen ? new Date(b.firstSeen).getTime() : 0
        return dateB - dateA
      })
  }, [actors, searchQuery, selectedType, selectedOrigin])

  const getActorTypeColor = (type: string) => {
    switch (type) {
      case 'nation-state':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'cybercrime':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'hacktivist':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'insider':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
      default:
        return 'bg-blue-600 text-white'
    }
  }

  const getActorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nation-state': '国家支援',
      cybercrime: 'サイバー犯罪',
      hacktivist: 'ハクティビスト',
      insider: '内部犯行',
    }
    return labels[type] || type
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

  const getMotivationLabel = (motivation: string) => {
    const labels: Record<string, string> = {
      espionage: 'スパイ活動',
      'financial-gain': '金銭目的',
      disruption: '破壊活動',
      ideology: 'イデオロギー',
      revenge: '復讐',
    }
    return labels[motivation] || motivation
  }

  const toggleFilter = (filterType: 'type' | 'origin', value: string) => {
    if (filterType === 'type') {
      setSelectedType((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
    } else {
      setSelectedOrigin((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
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
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                脅威アクター
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                サイバー攻撃を実行する組織・個人の追跡
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    総アクター数
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    国家支援
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.byType['nation-state']}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
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
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="アクター名、説明、IDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
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
          {/* Type Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              アクタータイプ
            </p>
            <div className="flex flex-wrap gap-2">
              {['nation-state', 'cybercrime', 'hacktivist'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter('type', type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType.includes(type)
                      ? getActorTypeColor(type) + ' ring-2 ring-offset-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getActorTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Origin Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              起源国
            </p>
            <div className="flex flex-wrap gap-2">
              {['CN', 'RU', 'KP', 'IR'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleFilter('origin', origin)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedOrigin.includes(origin)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-offset-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {origin}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Threat Actors List */}
      <div className="space-y-4">
        {filteredActors.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              該当する脅威アクターはありません
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              フィルターを変更するか、検索条件を見直してください
            </p>
          </div>
        ) : (
          filteredActors.map((actor) => (
            <div
              key={actor.actorId}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {actor.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getActorTypeColor(
                        actor.actorType
                      )}`}
                    >
                      {getActorTypeLabel(actor.actorType)}
                    </span>
                    {actor.sophistication && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSophisticationBadge(
                          actor.sophistication
                        )}`}
                      >
                        {getSophisticationLabel(actor.sophistication)}
                      </span>
                    )}
                  </div>

                  {actor.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {actor.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {actor.origin && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span>起源: {actor.origin}</span>
                      </div>
                    )}
                    {actor.primaryMotivation && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{getMotivationLabel(actor.primaryMotivation)}</span>
                      </div>
                    )}
                    {actor.firstSeen && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          初観測: {new Date(actor.firstSeen).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Targeted Sectors */}
                  {actor.targetedSectors && actor.targetedSectors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        標的業界:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {actor.targetedSectors.map((sector, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Targeted Countries */}
                  {actor.targetedCountries && actor.targetedCountries.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        標的国:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {actor.targetedCountries.map((country, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
