import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
} from 'lucide-react'
import { getMatrix, refreshAttackData, searchTechniques, type AttackTechnique } from '@/services/api/attackApi'
import { useSearch } from '@/contexts/SearchContext'
import { ExportButton } from '../common/ExportButton'
import { exportAttack } from '@/services/api/exportApi'

export const AttackMatrix = () => {
  const { filters, updateFilters } = useSearch()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState<AttackTechnique | null>(null)
  const [expandedTactics, setExpandedTactics] = useState<Set<string>>(new Set())
  const [showTacticFilter, setShowTacticFilter] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attack-matrix'],
    queryFn: getMatrix,
  })

  const { data: searchResults, refetch: searchRefetch } = useQuery({
    queryKey: ['attack-search', searchTerm],
    queryFn: () => searchTechniques(searchTerm),
    enabled: searchTerm.length >= 2,
  })

  const handleRefresh = async () => {
    await refreshAttackData()
    refetch()
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    await exportAttack(format)
  }

  const toggleTactic = (tacticName: string) => {
    setExpandedTactics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tacticName)) {
        newSet.delete(tacticName)
      } else {
        newSet.add(tacticName)
      }
      return newSet
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.length >= 2) {
      searchRefetch()
    }
  }

  const toggleTacticFilter = (tacticShortName: string) => {
    const newTactics = filters.tactics.includes(tacticShortName)
      ? filters.tactics.filter((t) => t !== tacticShortName)
      : [...filters.tactics, tacticShortName]
    updateFilters({ tactics: newTactics })
  }

  const filteredData = useMemo(() => {
    if (!data?.data) return []
    if (filters.tactics.length === 0) return data.data

    return data.data.filter((tactic) =>
      filters.tactics.includes(tactic.shortName)
    )
  }, [data, filters.tactics])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error loading ATT&CK Matrix</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600 dark:text-red-400" />
            MITRE ATT&CK Matrix
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enterprise Tactics & Techniques - {data?.stats.totalTechniques || 0} techniques across {data?.stats.totalTactics || 0} tactics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={handleExport} label="Export" />
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search techniques by ID, name, or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
        {searchTerm.length >= 2 && searchResults && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {searchResults.count} matching techniques
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {searchResults.data.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechnique(tech)}
                  className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {tech.id} - {tech.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {tech.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Tactic Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowTacticFilter(!showTacticFilter)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Filter by Tactics
            </span>
            {filters.tactics.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {filters.tactics.length} selected
              </span>
            )}
          </div>
          {showTacticFilter ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {showTacticFilter && data?.data && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {data.data.map((tactic) => (
                <label
                  key={tactic.shortName}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.tactics.includes(tactic.shortName)}
                    onChange={() => toggleTacticFilter(tactic.shortName)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {tactic.name}
                  </span>
                </label>
              ))}
            </div>
            {filters.tactics.length > 0 && (
              <button
                onClick={() => updateFilters({ tactics: [] })}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        {filteredData.length === 0 && filters.tactics.length > 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tactics match your filter criteria</p>
            <button
              onClick={() => updateFilters({ tactics: [] })}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((tactic) => {
              const isExpanded = expandedTactics.has(tactic.shortName)

            return (
              <div
                key={tactic.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleTactic(tactic.shortName)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {tactic.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tactic.techniqueDetails.length} techniques
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tactic.techniqueDetails.map((technique) => (
                        <div
                          key={technique.id}
                          onClick={() => setSelectedTechnique(technique)}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white dark:bg-gray-700"
                        >
                          <div className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-1">
                            {technique.id}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {technique.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {technique.description}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {technique.platforms.slice(0, 3).map((platform, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded"
                              >
                                {platform}
                              </span>
                            ))}
                            {technique.platforms.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                +{technique.platforms.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}
      </div>

      {/* Technique Detail Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {selectedTechnique.id}
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedTechnique.name}
                </div>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedTechnique.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tactics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnique.tactics.map((tactic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-full text-sm font-medium"
                    >
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnique.platforms.map((platform, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTechnique.dataSource.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnique.dataSource.map((source, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTechnique.url && (
                <div>
                  <a
                    href={selectedTechnique.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on MITRE ATT&CK
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
