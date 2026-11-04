import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SeverityDistributionChartProps {
  data: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

const COLORS = {
  critical: '#dc2626', // red-600
  high: '#ea580c', // orange-600
  medium: '#facc15', // yellow-400
  low: '#22c55e', // green-500
}

export const SeverityDistributionChart = ({ data }: SeverityDistributionChartProps) => {
  const chartData = [
    { name: 'Critical', value: data.critical, color: COLORS.critical },
    { name: 'High', value: data.high, color: COLORS.high },
    { name: 'Medium', value: data.medium, color: COLORS.medium },
    { name: 'Low', value: data.low, color: COLORS.low },
  ].filter((item) => item.value > 0) // Only show categories with data

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:bg-gray-800"
        />
        <Legend
          wrapperStyle={{ color: '#6b7280' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
