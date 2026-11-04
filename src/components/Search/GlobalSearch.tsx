import { useState, useMemo } from 'react'
import { Search, Filter, X, Bookmark } from 'lucide-react'
import { useSearch } from '@/contexts/SearchContext'
import { useQuery } from '@tanstack/react-query'
import { fetchCisaKev } from '@/services/api/cisaApi'
import { getJvnVulnerabilities } from '@/services/api/jvnApi'
import { getNvdCves } from '@/services/api/nvdApi'
import { AdvancedFilters } from './AdvancedFilters'
import { FilterPresets } from './FilterPresets'

interface SearchResult {
  id: string
  title: string
  description: string
  severity: string
  source: 'cisa' | 'jvn' | 'nvd'
  publishedDate: string
  cveId?: string
  vendor?: string
  product?: string
  cvssScore?: number
}

export const GlobalSearch = () => {
  const { filters, updateFilters } = useSearch()
  const [showFilters, setShowFilters] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // Fetch all data sources
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

  // Combine and filter results
  const searchResults = useMemo(() => {
    const results: SearchResult[] = []

    // Add CISA KEV results
    if (cisaData && (filters.sources.length === 0 || filters.sources.includes('cisa'))) {
      cisaData.forEach((item) => {
        const matchesQuery = !filters.query ||
          item.vulnerabilityName?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.cveId?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.vendorProject?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.product?.toLowerCase().includes(filters.query.toLowerCase())

        const matchesVendor = filters.vendors.length === 0 ||
          filters.vendors.includes(item.vendorProject || '')

        const matchesProduct = filters.products.length === 0 ||
          filters.products.includes(item.product || '')

        const matchesDate = (!filters.dateRange.start || new Date(item.dateAdded) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.dateAdded) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesVendor && matchesProduct && matchesDate) {
          results.push({
            id: item.cveId || `cisa-${item.id}`,
            title: item.vulnerabilityName || item.cveId,
            description: item.shortDescription || '',
            severity: 'CRITICAL',
            source: 'cisa',
            publishedDate: typeof item.dateAdded === 'string' ? item.dateAdded : item.dateAdded.toISOString(),
            cveId: item.cveId,
            vendor: item.vendorProject,
            product: item.product,
          })
        }
      })
    }

    // Add JVN results
    if (jvnData?.data && (filters.sources.length === 0 || filters.sources.includes('jvn'))) {
      jvnData.data.forEach((item: any, index: number) => {
        const matchesQuery = !filters.query ||
          item.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.identifier?.toLowerCase().includes(filters.query.toLowerCase())

        const matchesSeverity = filters.severity.length === 0 ||
          filters.severity.includes(item.severity?.toUpperCase() || 'UNKNOWN')

        const matchesDate = (!filters.dateRange.start || new Date(item.publishedDate) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.publishedDate) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesSeverity && matchesDate) {
          results.push({
            id: item.identifier || item.jvnId || item.cveId || `jvn-${index}`,
            title: item.title,
            description: item.description || '',
            severity: item.severity || 'UNKNOWN',
            source: 'jvn',
            publishedDate: item.publishedDate,
            cveId: item.cveId,
          })
        }
      })
    }

    // Add NVD results
    if (nvdData?.data && (filters.sources.length === 0 || filters.sources.includes('nvd'))) {
      nvdData.data.forEach((item: any, index: number) => {
        const matchesQuery = !filters.query ||
          item.cveId?.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.description?.toLowerCase().includes(filters.query.toLowerCase())

        const matchesSeverity = filters.severity.length === 0 ||
          filters.severity.includes(item.severity?.toUpperCase() || 'UNKNOWN')

        const matchesCvss = item.cvssScore >= filters.cvssRange.min &&
          item.cvssScore <= filters.cvssRange.max

        const matchesDate = (!filters.dateRange.start || new Date(item.publishedDate) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || new Date(item.publishedDate) <= new Date(filters.dateRange.end))

        if (matchesQuery && matchesSeverity && matchesCvss && matchesDate) {
          results.push({
            id: item.cveId || `nvd-${item.id || index}`,
            title: item.cveId || 'Unknown CVE',
            description: item.description || '',
            severity: item.severity || 'UNKNOWN',
            source: 'nvd',
            publishedDate: item.publishedDate,
            cveId: item.cveId,
            cvssScore: item.cvssScore,
          })
        }
      })
    }

    return results.slice(0, 100) // Limit to 100 results
  }, [cisaData, jvnData, nvdData, filters])

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-600'
      case 'HIGH':
        return 'bg-orange-600'
      case 'MEDIUM':
        return 'bg-yellow-600'
      case 'LOW':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'cisa':
        return 'bg-blue-600'
      case 'jvn':
        return 'bg-green-600'
      case 'nvd':
        return 'bg-purple-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            placeholder="Search vulnerabilities, CVE IDs, vendors, products..."
            className="w-full pl-10 pr-10 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          {filters.query && (
            <button
              onClick={() => updateFilters({ query: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            showPresets
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          Presets
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <AdvancedFilters />
        </div>
      )}

      {/* Filter Presets Panel */}
      {showPresets && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <FilterPresets />
        </div>
      )}

      {/* Results */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Results
            <span className="text-sm font-normal text-gray-400">
              ({searchResults.length} {searchResults.length === 100 ? '+ ' : ''}results)
            </span>
          </h3>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No results found</p>
              <p className="text-sm mt-1">Try adjusting your search query or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {searchResults.map((result) => (
                <div
                  key={`${result.source}-${result.id}`}
                  className="p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSourceBadge(result.source)} text-white uppercase`}>
                          {result.source}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityColor(result.severity)} text-white uppercase`}>
                          {result.severity}
                        </span>
                        {result.cveId && (
                          <span className="text-xs font-mono text-blue-400">{result.cveId}</span>
                        )}
                        {result.cvssScore !== undefined && (
                          <span className="text-xs text-gray-400">CVSS: {result.cvssScore.toFixed(1)}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-1">{result.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{result.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
                        {result.vendor && <span>Vendor: {result.vendor}</span>}
                        {result.product && <span>Product: {result.product}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
