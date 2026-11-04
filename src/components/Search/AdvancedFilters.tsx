import { useSearch } from '@/contexts/SearchContext'
import { X, RotateCcw } from 'lucide-react'

export const AdvancedFilters = () => {
  const { filters, updateFilters, resetFilters } = useSearch()

  const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const sourceOptions = [
    { value: 'cisa', label: 'CISA KEV' },
    { value: 'jvn', label: 'JVN' },
    { value: 'nvd', label: 'NVD' },
  ]

  const toggleSeverity = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity]
    updateFilters({ severity: newSeverity })
  }

  const toggleSource = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source]
    updateFilters({ sources: newSources })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) =>
                updateFilters({
                  dateRange: { ...filters.dateRange, start: e.target.value || null },
                })
              }
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) =>
                updateFilters({
                  dateRange: { ...filters.dateRange, end: e.target.value || null },
                })
              }
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Severity
          </label>
          <div className="space-y-2">
            {severityOptions.map((severity) => (
              <label key={severity} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.severity.includes(severity)}
                  onChange={() => toggleSeverity(severity)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">{severity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sources
          </label>
          <div className="space-y-2">
            {sourceOptions.map((source) => (
              <label key={source.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source.value)}
                  onChange={() => toggleSource(source.value)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">{source.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CVSS Score Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CVSS Score Range
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.cvssRange.min}
                onChange={(e) =>
                  updateFilters({
                    cvssRange: {
                      ...filters.cvssRange,
                      min: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.cvssRange.max}
                onChange={(e) =>
                  updateFilters({
                    cvssRange: {
                      ...filters.cvssRange,
                      max: parseFloat(e.target.value) || 10,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Max"
              />
            </div>
            <div className="text-xs text-gray-400">
              Current: {filters.cvssRange.min.toFixed(1)} - {filters.cvssRange.max.toFixed(1)}
            </div>
          </div>
        </div>

        {/* KEV Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Special Filters
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inKEV === true}
                onChange={(e) =>
                  updateFilters({ inKEV: e.target.checked ? true : null })
                }
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">In CISA KEV Only</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasExploit === true}
                onChange={(e) =>
                  updateFilters({ hasExploit: e.target.checked ? true : null })
                }
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">Has Known Exploit</span>
            </label>
          </div>
        </div>

        {/* Vendor/Product */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vendor / Product
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Filter by vendor..."
              onChange={(e) => {
                const value = e.target.value.trim()
                updateFilters({
                  vendors: value ? [value] : [],
                })
              }}
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              placeholder="Filter by product..."
              onChange={(e) => {
                const value = e.target.value.trim()
                updateFilters({
                  products: value ? [value] : [],
                })
              }}
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.severity.length > 0 ||
        filters.sources.length > 0 ||
        filters.dateRange.start ||
        filters.dateRange.end ||
        filters.cvssRange.min > 0 ||
        filters.cvssRange.max < 10 ||
        filters.inKEV ||
        filters.hasExploit) && (
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active Filters:</span>
            {filters.severity.map((sev) => (
              <span
                key={sev}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
              >
                {sev}
                <button
                  onClick={() => toggleSeverity(sev)}
                  className="hover:bg-blue-700 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.sources.map((src) => (
              <span
                key={src}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded uppercase"
              >
                {src}
                <button
                  onClick={() => toggleSource(src)}
                  className="hover:bg-green-700 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
