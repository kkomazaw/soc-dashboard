import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AttackTacticsChartProps {
  tactics: Array<{
    name: string
    techniqueCount: number
  }>
}

const TACTIC_COLORS: { [key: string]: string } = {
  'Initial Access': '#ef4444',
  'Execution': '#f97316',
  'Persistence': '#f59e0b',
  'Privilege Escalation': '#eab308',
  'Defense Evasion': '#84cc16',
  'Credential Access': '#22c55e',
  'Discovery': '#10b981',
  'Lateral Movement': '#14b8a6',
  'Collection': '#06b6d4',
  'Command and Control': '#0ea5e9',
  'Exfiltration': '#3b82f6',
  'Impact': '#6366f1',
  'Reconnaissance': '#8b5cf6',
  'Resource Development': '#a855f7',
}

export const AttackTacticsChart = ({ tactics }: AttackTacticsChartProps) => {
  // Sort by technique count descending and take top 10
  const chartData = tactics
    .sort((a, b) => b.techniqueCount - a.techniqueCount)
    .slice(0, 10)
    .map((tactic) => ({
      name: tactic.name.replace(/-/g, ' '),
      count: tactic.techniqueCount,
      color: TACTIC_COLORS[tactic.name.replace(/-/g, ' ')] || '#6b7280',
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No ATT&CK data available
      </div>
    )
  }

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        layout="horizontal"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          height={70}
          interval={0}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          domain={[0, maxCount]}
          allowDecimals={false}
          label={{
            value: 'Techniques',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#6b7280', fontSize: 12 }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          itemStyle={{ color: '#4b5563' }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Techniques">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
