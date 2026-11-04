import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import { format, subDays, parseISO, startOfDay, isAfter } from 'date-fns'
import { Calendar, Activity, Filter } from 'lucide-react'

interface Vulnerability {
  dateAdded: string | Date
  severity?: string
  source?: string
}

interface AdvancedTrendsChartProps {
  vulnerabilities: Vulnerability[]
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'
type ChartType = 'line' | 'area' | 'bar'
type ViewMode = 'total' | 'severity' | 'source'

export const AdvancedTrendsChart = ({ vulnerabilities }: AdvancedTrendsChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [viewMode, setViewMode] = useState<ViewMode>('severity')
  const [showMovingAverage, setShowMovingAverage] = useState(false)

  const timeRangeConfig: Record<TimeRange, number | null> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
    'all': null,
  }

  const chartData = useMemo(() => {
    const days = timeRangeConfig[timeRange]
    const startDate = days ? subDays(new Date(), days - 1) : null

    // Filter vulnerabilities based on time range
    const filteredVulns = startDate
      ? vulnerabilities.filter((v) => {
          try {
            const vulnDate = typeof v.dateAdded === 'string' ? parseISO(v.dateAdded) : v.dateAdded
            return isAfter(vulnDate, startDate)
          } catch {
            return false
          }
        })
      : vulnerabilities

    // Determine date range
    const dateRange: string[] = []
    if (days) {
      for (let i = 0; i < days; i++) {
        dateRange.push(format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd'))
      }
    } else {
      // For 'all', find min/max dates
      const dates = filteredVulns
        .map((v) => {
          try {
            return typeof v.dateAdded === 'string' ? parseISO(v.dateAdded) : v.dateAdded
          } catch {
            return null
          }
        })
        .filter((d): d is Date => d !== null)

      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxDate = new Date()
        const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

        for (let i = 0; i <= daysDiff; i++) {
          dateRange.push(format(subDays(maxDate, daysDiff - i), 'yyyy-MM-dd'))
        }
      }
    }

    // Build chart data
    const data = dateRange.map((date) => {
      const vulnsOnDate = filteredVulns.filter((vuln) => {
        try {
          const vulnDate = typeof vuln.dateAdded === 'string' ? parseISO(vuln.dateAdded) : vuln.dateAdded
          return format(startOfDay(vulnDate), 'yyyy-MM-dd') === date
        } catch {
          return false
        }
      })

      const dataPoint: any = {
        date: format(parseISO(date), 'MMM dd'),
        fullDate: date,
        total: vulnsOnDate.length,
      }

      // Add severity breakdown
      dataPoint.critical = vulnsOnDate.filter((v) => v.severity === 'CRITICAL').length
      dataPoint.high = vulnsOnDate.filter((v) => v.severity === 'HIGH').length
      dataPoint.medium = vulnsOnDate.filter((v) => v.severity === 'MEDIUM').length
      dataPoint.low = vulnsOnDate.filter((v) => v.severity === 'LOW').length

      // Add source breakdown
      dataPoint.cisa = vulnsOnDate.filter((v) => v.source === 'cisa').length
      dataPoint.jvn = vulnsOnDate.filter((v) => v.source === 'jvn').length
      dataPoint.nvd = vulnsOnDate.filter((v) => v.source === 'nvd').length

      return dataPoint
    })

    // Calculate 7-day moving average if enabled
    if (showMovingAverage && data.length >= 7) {
      for (let i = 6; i < data.length; i++) {
        const sum = data.slice(i - 6, i + 1).reduce((acc, d) => acc + d.total, 0)
        data[i].movingAvg = Math.round((sum / 7) * 10) / 10
      }
    }

    return data
  }, [vulnerabilities, timeRange, showMovingAverage])

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    const axisProps = {
      xAxis: {
        dataKey: 'date',
        tick: { fill: '#9ca3af', fontSize: 11 },
        stroke: '#4b5563',
      },
      yAxis: {
        tick: { fill: '#9ca3af', fontSize: 11 },
        stroke: '#4b5563',
        allowDecimals: false,
      },
    }

    const tooltipProps = {
      contentStyle: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        border: '1px solid #4b5563',
        borderRadius: '8px',
        color: '#f3f4f6',
      },
      labelStyle: { color: '#f3f4f6', fontWeight: 'bold' },
    }

    const renderLines = () => {
      if (viewMode === 'severity') {
        return (
          <>
            <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} name="Critical" dot={false} />
            <Line type="monotone" dataKey="high" stroke="#ea580c" strokeWidth={2} name="High" dot={false} />
            <Line type="monotone" dataKey="medium" stroke="#facc15" strokeWidth={2} name="Medium" dot={false} />
            <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} name="Low" dot={false} />
          </>
        )
      } else if (viewMode === 'source') {
        return (
          <>
            <Line type="monotone" dataKey="cisa" stroke="#3b82f6" strokeWidth={2} name="CISA KEV" dot={false} />
            <Line type="monotone" dataKey="jvn" stroke="#8b5cf6" strokeWidth={2} name="JVN" dot={false} />
            <Line type="monotone" dataKey="nvd" stroke="#06b6d4" strokeWidth={2} name="NVD" dot={false} />
          </>
        )
      } else {
        return (
          <>
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} name="Total" dot={false} />
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="7-day MA"
                dot={false}
              />
            )}
          </>
        )
      }
    }

    const renderAreas = () => {
      if (viewMode === 'severity') {
        return (
          <>
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.8} name="Critical" />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#ea580c" fill="#ea580c" fillOpacity={0.8} name="High" />
            <Area type="monotone" dataKey="medium" stackId="1" stroke="#facc15" fill="#facc15" fillOpacity={0.8} name="Medium" />
            <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.8} name="Low" />
          </>
        )
      } else if (viewMode === 'source') {
        return (
          <>
            <Area type="monotone" dataKey="cisa" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="CISA KEV" />
            <Area type="monotone" dataKey="jvn" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} name="JVN" />
            <Area type="monotone" dataKey="nvd" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.8} name="NVD" />
          </>
        )
      } else {
        return <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total" />
      }
    }

    const renderBars = () => {
      if (viewMode === 'severity') {
        return (
          <>
            <Bar dataKey="critical" stackId="a" fill="#dc2626" name="Critical" />
            <Bar dataKey="high" stackId="a" fill="#ea580c" name="High" />
            <Bar dataKey="medium" stackId="a" fill="#facc15" name="Medium" />
            <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
          </>
        )
      } else if (viewMode === 'source') {
        return (
          <>
            <Bar dataKey="cisa" stackId="a" fill="#3b82f6" name="CISA KEV" />
            <Bar dataKey="jvn" stackId="a" fill="#8b5cf6" name="JVN" />
            <Bar dataKey="nvd" stackId="a" fill="#06b6d4" name="NVD" />
          </>
        )
      } else {
        return <Bar dataKey="total" fill="#3b82f6" name="Total" />
      }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis {...axisProps.xAxis} />
            <YAxis {...axisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Brush dataKey="date" height={30} stroke="#6366f1" fill="#1f2937" />
            {renderLines()}
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis {...axisProps.xAxis} />
            <YAxis {...axisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Brush dataKey="date" height={30} stroke="#6366f1" fill="#1f2937" />
            {renderAreas()}
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis {...axisProps.xAxis} />
            <YAxis {...axisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Brush dataKey="date" height={30} stroke="#6366f1" fill="#1f2937" />
            {renderBars()}
          </BarChart>
        )
    }
  }

  const totalVulns = chartData.reduce((sum, d) => sum + d.total, 0)
  const avgPerDay = chartData.length > 0 ? (totalVulns / chartData.length).toFixed(1) : '0'
  const peakDay = chartData.reduce((max, d) => (d.total > max.total ? d : max), chartData[0] || { total: 0, date: '' })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {(['7d', '30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  chartType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {(['total', 'severity', 'source'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Moving Average Toggle */}
        {viewMode === 'total' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMovingAverage}
              onChange={(e) => setShowMovingAverage(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-xs text-gray-300">7-day MA</span>
          </label>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Total in Period</p>
          <p className="text-2xl font-bold text-white mt-1">{totalVulns}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Average per Day</p>
          <p className="text-2xl font-bold text-white mt-1">{avgPerDay}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Peak Day</p>
          <p className="text-2xl font-bold text-white mt-1">{peakDay?.total || 0}</p>
          <p className="text-xs text-gray-500">{peakDay?.date || 'N/A'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
