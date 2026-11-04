import { useState } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { Save, Trash2, Check, X } from 'lucide-react'

export const FilterPresets = () => {
  const { presets, savePreset, loadPreset, deletePreset } = useSearch()
  const [newPresetName, setNewPresetName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  const handleSave = () => {
    if (newPresetName.trim()) {
      savePreset(newPresetName.trim())
      setNewPresetName('')
      setShowSaveInput(false)
    }
  }

  const presetList = Object.keys(presets)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filter Presets</h3>
        <button
          onClick={() => setShowSaveInput(!showSaveInput)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Current
        </button>
      </div>

      {/* Save New Preset */}
      {showSaveInput && (
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Preset name..."
              className="flex-1 px-3 py-2 bg-gray-600 text-gray-100 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={!newPresetName.trim()}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowSaveInput(false)
                setNewPresetName('')
              }}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preset List */}
      {presetList.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved presets</p>
          <p className="text-sm mt-1">Save your current filters to quickly access them later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetList.map((presetName) => {
            const preset = presets[presetName]
            const activeFilters = [
              ...preset.severity,
              ...preset.sources.map((s) => s.toUpperCase()),
              preset.inKEV && 'KEV',
              preset.hasExploit && 'Has Exploit',
              preset.dateRange.start && `From: ${preset.dateRange.start}`,
              preset.dateRange.end && `To: ${preset.dateRange.end}`,
            ].filter(Boolean)

            return (
              <div
                key={presetName}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{presetName}</h4>
                  <button
                    onClick={() => {
                      if (confirm(`Delete preset "${presetName}"?`)) {
                        deletePreset(presetName)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {activeFilters.slice(0, 3).map((filter, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                      >
                        {filter}
                      </span>
                    ))}
                    {activeFilters.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                        +{activeFilters.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => loadPreset(presetName)}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Load Preset
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
