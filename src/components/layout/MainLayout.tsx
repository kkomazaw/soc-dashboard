import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { TwitterTimeline } from '../Twitter/TwitterTimeline'

interface MainLayoutProps {
  children: ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
  currentView: string
  onViewChange: (view: string) => void
}

export const MainLayout = ({
  children,
  onRefresh,
  isRefreshing,
  currentView,
  onViewChange,
}: MainLayoutProps) => {
  const [showTwitterTimeline, setShowTwitterTimeline] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header onRefresh={onRefresh} isRefreshing={isRefreshing} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar currentView={currentView} onViewChange={onViewChange} />

        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-y-auto">
          {children}
        </main>

        {/* Twitter Timeline Panel */}
        <div className={`relative transition-all duration-300 ${showTwitterTimeline ? 'w-96' : 'w-0'}`}>
          {/* Toggle Button */}
          <button
            onClick={() => setShowTwitterTimeline(!showTwitterTimeline)}
            className="absolute -left-8 top-4 z-10 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-l-lg shadow-lg transition-colors"
            title={showTwitterTimeline ? 'Xフィードを非表示' : 'Xフィードを表示'}
          >
            {showTwitterTimeline ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Timeline Content */}
          {showTwitterTimeline && (
            <div className="h-full overflow-hidden">
              <TwitterTimeline />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
