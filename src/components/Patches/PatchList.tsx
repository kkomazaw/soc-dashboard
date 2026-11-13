import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getPatches, getPatchStats, refreshPatches, updatePatchDeploymentStatus } from '@/services/api/patchApi'
import type { VendorPatch } from '@/services/api/patchApi'

const ITEMS_PER_PAGE = 50

export const PatchList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatch, setSelectedPatch] = useState<VendorPatch | null>(null)

  const { data: patchesData, isLoading, error, refetch } = useQuery({
    queryKey: ['patches'],
    queryFn: () => getPatches(),
  })

  const { data: stats } = useQuery({
    queryKey: ['patch-stats'],
    queryFn: getPatchStats,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshPatches()
      await refetch()
    } catch (err) {
      console.error('Failed to refresh patches:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStatusUpdate = async (patchId: string, status: string, notes?: string) => {
    try {
      await updatePatchDeploymentStatus(patchId, status, notes)
      await refetch()
      setSelectedPatch(null)
    } catch (err) {
      console.error('Failed to update patch status:', err)
    }
  }

  const getSeverityColor = (severity: string): string => {
    const lowerSeverity = severity.toLowerCase()
    if (lowerSeverity.includes('critical')) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    if (lowerSeverity.includes('important') || lowerSeverity.includes('high')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    if (lowerSeverity.includes('moderate') || lowerSeverity.includes('medium')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'skipped':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const filteredPatches = patchesData?.patches.filter((patch: VendorPatch) => {
    const matchesSearch =
      searchTerm === '' ||
      patch.patchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.cveIds.some(cve => cve.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesVendor = vendorFilter === 'all' || patch.vendor === vendorFilter
    const matchesSeverity = severityFilter === 'all' || patch.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || patch.deploymentStatus === statusFilter

    return matchesSearch && matchesVendor && matchesSeverity && matchesStatus
  })

  // Pagination
  const totalItems = filteredPatches?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayPatches = filteredPatches?.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Error loading patches</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate filtered stats based on current filters
  const getFilteredStats = () => {
    if (!filteredPatches) return null

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return {
      total: filteredPatches.length,
      thisMonth: filteredPatches.filter(p => new Date(p.releaseDate) >= thisMonth).length,
      pending: filteredPatches.filter(p => p.deploymentStatus === 'pending').length,
      criticalUndeployed: filteredPatches.filter(
        p => p.severity === 'Critical' && p.deploymentStatus !== 'deployed'
      ).length,
      last24Hours: filteredPatches.filter(p => new Date(p.releaseDate) >= last24Hours).length,
    }
  }

  const filteredStats = getFilteredStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Patch Management</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Centralized patch tracking from Microsoft, Red Hat, Cisco, VMware, Oracle, Adobe, Fortinet, and Palo Alto Networks
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Patch ID, CVE, Title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor</label>
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Vendors</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Red Hat">Red Hat</option>
              <option value="Cisco">Cisco</option>
              <option value="VMware">VMware</option>
              <option value="Oracle">Oracle</option>
              <option value="Adobe">Adobe</option>
              <option value="Fortinet">Fortinet</option>
              <option value="Palo Alto Networks">Palo Alto Networks</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Important">Important/High</option>
              <option value="Moderate">Moderate/Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="testing">Testing</option>
              <option value="deployed">Deployed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards - Filtered by selected vendor and filters */}
      {filteredStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {vendorFilter !== 'all' ? `${vendorFilter} Patches` : 'Total Patches'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredStats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical Undeployed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredStats.criticalUndeployed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <Download className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredStats.last24Hours}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patches List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Patch ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  CVEs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Release Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayPatches && displayPatches.length > 0 ? (
                displayPatches.map((patch) => (
                  <tr
                    key={patch.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedPatch(patch)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                        {patch.patchId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {patch.title}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{patch.vendor}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(patch.severity)}`}>
                        {patch.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{patch.cveCount}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(patch.releaseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(patch.deploymentStatus)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {patch.deploymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {patch.bulletinUrl && (
                        <a
                          href={patch.bulletinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No patches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span>-
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> patches
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patch Detail Modal */}
      {selectedPatch && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedPatch(null)}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-start justify-between border-b border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedPatch.patchId}</h2>
                  <p className="text-sm text-blue-100">{selectedPatch.title}</p>
                </div>
                <button
                  onClick={() => setSelectedPatch(null)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vendor</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPatch.vendor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPatch.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Severity</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getSeverityColor(selectedPatch.severity)}`}>
                      {selectedPatch.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Release Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedPatch.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedPatch.description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPatch.description}</p>
                  </div>
                )}

                {selectedPatch.cveIds.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Related CVEs ({selectedPatch.cveCount})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatch.cveIds.map((cve, idx) => (
                        <a
                          key={idx}
                          href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {cve}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deployment Status</p>
                  <select
                    value={selectedPatch.deploymentStatus}
                    onChange={(e) => handleStatusUpdate(selectedPatch.patchId, e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>

                {selectedPatch.bulletinUrl && (
                  <div>
                    <a
                      href={selectedPatch.bulletinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Security Bulletin
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
