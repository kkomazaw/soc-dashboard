import { useState, useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup,
} from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'

interface ThreatLocation {
  country: string
  countryCode: string
  threatCount: number
  critical: number
  high: number
  medium: number
  low: number
  topThreats: string[]
}

interface WorldThreatMapProps {
  data: ThreatLocation[]
  onCountryClick?: (countryCode: string, countryName: string) => void
}

// GeoJSON world map topology URL with ISO codes
const geoUrl =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'

// Numeric ID to alpha-2 code mapping (for world-atlas backup)
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '840': 'US', // USA
  '156': 'CN', // China
  '643': 'RU', // Russia
  '826': 'GB', // UK
  '276': 'DE', // Germany
  '250': 'FR', // France
  '392': 'JP', // Japan
  '410': 'KR', // South Korea
  '356': 'IN', // India
  '076': 'BR', // Brazil
  '528': 'NL', // Netherlands
  '642': 'RO', // Romania
}

// ISO 3166-1 alpha-2 to alpha-3 country code mapping for common countries
const COUNTRY_CODE_MAP: Record<string, string> = {
  US: 'USA',
  GB: 'GBR',
  CN: 'CHN',
  RU: 'RUS',
  IN: 'IND',
  BR: 'BRA',
  DE: 'DEU',
  FR: 'FRA',
  JP: 'JPN',
  IT: 'ITA',
  CA: 'CAN',
  ES: 'ESP',
  AU: 'AUS',
  MX: 'MEX',
  KR: 'KOR',
  NL: 'NLD',
  SE: 'SWE',
  NO: 'NOR',
  DK: 'DNK',
  FI: 'FIN',
  PL: 'POL',
  BE: 'BEL',
  CH: 'CHE',
  AT: 'AUT',
  PT: 'PRT',
  GR: 'GRC',
  CZ: 'CZE',
  RO: 'ROU',
  HU: 'HUN',
  IE: 'IRL',
  NZ: 'NZL',
  SG: 'SGP',
  IL: 'ISR',
  SA: 'SAU',
  AE: 'ARE',
  ZA: 'ZAF',
  TR: 'TUR',
  TH: 'THA',
  VN: 'VNM',
  PH: 'PHL',
  MY: 'MYS',
  ID: 'IDN',
  PK: 'PAK',
  BD: 'BGD',
  NG: 'NGA',
  EG: 'EGY',
  AR: 'ARG',
  CL: 'CHL',
  CO: 'COL',
  PE: 'PER',
  VE: 'VEN',
  UA: 'UKR',
  BG: 'BGR',
  HR: 'HRV',
  RS: 'SRB',
  SK: 'SVK',
  SI: 'SVN',
  LT: 'LTU',
  LV: 'LVA',
  EE: 'EST',
}

export const WorldThreatMap = ({ data, onCountryClick }: WorldThreatMapProps) => {
  const [tooltipContent, setTooltipContent] = useState<string>('')
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  // Calculate color scale
  const maxThreatCount = useMemo(() => {
    return Math.max(...data.map((d) => d.threatCount), 1)
  }, [data])

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxThreatCount * 0.3, maxThreatCount * 0.6, maxThreatCount])
      .range(['#1e3a8a', '#3b82f6', '#f59e0b', '#dc2626'])
      .clamp(true)
  }, [maxThreatCount])

  const getCountryColor = (geo: any) => {
    const countryProperties = geo.properties

    // Try to get ISO alpha-2 code from Natural Earth properties
    let alpha2Code = countryProperties?.ISO_A2 || countryProperties?.iso_a2

    // Fallback to numeric ID mapping
    if (!alpha2Code || alpha2Code === '-99') {
      alpha2Code = NUMERIC_TO_ALPHA2[geo.id]
    }

    if (!alpha2Code || alpha2Code === '-99') {
      return '#1f2937' // gray-800 for unknown countries
    }

    // Look up threat data using alpha-2 code directly
    const threat = data.find(t => t.countryCode === alpha2Code)

    if (threat) {
      return colorScale(threat.threatCount)
    }

    return '#1f2937' // gray-800 for countries with no threats
  }

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryProperties = geo.properties

    // Try to get ISO alpha-2 code
    let alpha2Code = countryProperties?.ISO_A2 || countryProperties?.iso_a2

    // Fallback to numeric ID mapping
    if (!alpha2Code || alpha2Code === '-99') {
      alpha2Code = NUMERIC_TO_ALPHA2[geo.id]
    }

    const countryName = countryProperties?.NAME || countryProperties?.name || 'Unknown'

    // Find threat data using alpha-2 code
    const threat = alpha2Code ? data.find(t => t.countryCode === alpha2Code) : null

    if (threat) {
      const content = `${threat.country || countryName}
Total Threats: ${threat.threatCount.toLocaleString()}
Critical: ${threat.critical} | High: ${threat.high}
Medium: ${threat.medium} | Low: ${threat.low}
Top Threats: ${threat.topThreats.join(', ')}`
      setTooltipContent(content)
    } else {
      setTooltipContent(`${countryName}\nNo threats detected`)
    }

    setTooltipPosition({ x: event.clientX, y: event.clientY })
    setShowTooltip(true)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setTooltipContent('')
  }

  const handleCountryClick = (geo: any) => {
    if (!onCountryClick) return

    const countryProperties = geo.properties

    // Try to get ISO alpha-2 code
    let alpha2Code = countryProperties?.ISO_A2 || countryProperties?.iso_a2

    // Fallback to numeric ID mapping
    if (!alpha2Code || alpha2Code === '-99') {
      alpha2Code = NUMERIC_TO_ALPHA2[geo.id]
    }

    const countryName = countryProperties?.NAME || countryProperties?.name || 'Unknown'

    // Find threat data using alpha-2 code
    const threat = alpha2Code ? data.find(t => t.countryCode === alpha2Code) : null

    // Only trigger click if there's threat data
    if (threat && alpha2Code) {
      onCountryClick(alpha2Code, threat.country || countryName)
    }
  }

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <ZoomableGroup>
          <Sphere stroke="#1e293b" strokeWidth={0.5} fill="#0f172a" />
          <Graticule stroke="#1e293b" strokeWidth={0.5} />
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryColor(geo)}
                  stroke="#374151"
                  strokeWidth={0.5}
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={(event) => handleMouseEnter(geo, event)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      outline: 'none',
                    },
                    hover: {
                      fill: '#fbbf24',
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#fb923c',
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {showTooltip && tooltipContent && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y + 15}px`,
            maxWidth: '250px',
          }}
        >
          <pre className="text-xs whitespace-pre-wrap font-mono">{tooltipContent}</pre>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
        <p className="text-xs font-semibold text-white mb-2">Threat Intensity</p>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-xs text-gray-300">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-xs text-gray-300">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs text-gray-300">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-800"></div>
              <span className="text-xs text-gray-300">None</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2">
        <p className="text-xs text-gray-300">Hover for details • Click for drill-down</p>
        <p className="text-xs text-gray-400">Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  )
}
