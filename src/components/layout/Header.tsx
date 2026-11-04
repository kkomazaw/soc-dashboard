import { RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const Header = ({
  onRefresh,
  isRefreshing = false,
}: HeaderProps) => {
  const now = new Date()
  const formattedDate = now.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white px-6 py-4 shadow-lg border-b border-gray-700 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">SOC Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 dark:text-gray-400">
            最終更新: {formattedDate}
          </span>
          <ThemeToggle />
          <Button
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>更新</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
