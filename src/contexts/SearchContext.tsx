import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface SearchFilters {
  query: string
  dateRange: {
    start: string | null
    end: string | null
  }
  severity: string[]
  sources: string[]
  vendors: string[]
  products: string[]
  cvssRange: {
    min: number
    max: number
  }
  tactics: string[]
  hasExploit: boolean | null
  inKEV: boolean | null
}

interface SearchContextType {
  filters: SearchFilters
  updateFilters: (updates: Partial<SearchFilters>) => void
  resetFilters: () => void
  savePreset: (name: string) => void
  loadPreset: (name: string) => void
  deletePreset: (name: string) => void
  presets: Record<string, SearchFilters>
}

const defaultFilters: SearchFilters = {
  query: '',
  dateRange: {
    start: null,
    end: null,
  },
  severity: [],
  sources: [],
  vendors: [],
  products: [],
  cvssRange: {
    min: 0,
    max: 10,
  },
  tactics: [],
  hasExploit: null,
  inKEV: null,
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

interface SearchProviderProps {
  children: ReactNode
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const saved = localStorage.getItem('soc-dashboard-filters')
    return saved ? JSON.parse(saved) : defaultFilters
  })

  const [presets, setPresets] = useState<Record<string, SearchFilters>>(() => {
    const saved = localStorage.getItem('soc-dashboard-filter-presets')
    return saved ? JSON.parse(saved) : {}
  })

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updates }
      localStorage.setItem('soc-dashboard-filters', JSON.stringify(newFilters))
      return newFilters
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    localStorage.setItem('soc-dashboard-filters', JSON.stringify(defaultFilters))
  }, [])

  const savePreset = useCallback(
    (name: string) => {
      const newPresets = { ...presets, [name]: filters }
      setPresets(newPresets)
      localStorage.setItem('soc-dashboard-filter-presets', JSON.stringify(newPresets))
    },
    [filters, presets]
  )

  const loadPreset = useCallback(
    (name: string) => {
      const preset = presets[name]
      if (preset) {
        setFilters(preset)
        localStorage.setItem('soc-dashboard-filters', JSON.stringify(preset))
      }
    },
    [presets]
  )

  const deletePreset = useCallback(
    (name: string) => {
      const newPresets = { ...presets }
      delete newPresets[name]
      setPresets(newPresets)
      localStorage.setItem('soc-dashboard-filter-presets', JSON.stringify(newPresets))
    },
    [presets]
  )

  return (
    <SearchContext.Provider
      value={{
        filters,
        updateFilters,
        resetFilters,
        savePreset,
        loadPreset,
        deletePreset,
        presets,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}
