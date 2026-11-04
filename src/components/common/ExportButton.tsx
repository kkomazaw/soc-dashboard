import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

interface ExportButtonProps {
  onExport: (format: 'csv' | 'pdf') => Promise<void>
  label?: string
  formats?: ('csv' | 'pdf')[]
  size?: 'sm' | 'md'
}

export const ExportButton = ({
  onExport,
  label = 'Export',
  formats = ['csv', 'pdf'],
  size = 'sm',
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    setShowMenu(false)
    try {
      await onExport(format)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  if (formats.length === 1) {
    // Single format - direct button
    const format = formats[0]
    return (
      <button
        onClick={() => handleExport(format)}
        disabled={isExporting}
        className={`${sizeClasses[size]} flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors`}
      >
        {isExporting ? (
          <>
            <Download className="w-4 h-4 animate-pulse" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            {format === 'csv' ? (
              <FileSpreadsheet className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{label} ({format.toUpperCase()})</span>
          </>
        )}
      </button>
    )
  }

  // Multiple formats - dropdown menu
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={`${sizeClasses[size]} flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors`}
      >
        {isExporting ? (
          <>
            <Download className="w-4 h-4 animate-pulse" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {formats.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors first:rounded-t-lg"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Export as CSV</span>
              </button>
            )}
            {formats.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors last:rounded-b-lg"
              >
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Export as PDF</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
