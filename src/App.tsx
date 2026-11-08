import { useState, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SearchProvider } from '@/contexts/SearchContext'
import { MainLayout } from './components/layout/MainLayout'
import { NotificationBanner } from './components/Settings/NotificationBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useNotificationMonitor } from './hooks/useNotificationMonitor'

// Lazy load components for better performance
const Overview = lazy(() => import('./components/Dashboard/Overview').then(m => ({ default: m.Overview })))
const CisaKevList = lazy(() => import('./components/Vulnerabilities/CisaKevList').then(m => ({ default: m.CisaKevList })))
const JvnList = lazy(() => import('./components/Vulnerabilities/JvnList').then(m => ({ default: m.JvnList })))
const NvdList = lazy(() => import('./components/Vulnerabilities/NvdList').then(m => ({ default: m.NvdList })))
const RedHatSecurityList = lazy(() => import('./components/Vulnerabilities/RedHatSecurityList').then(m => ({ default: m.RedHatSecurityList })))
const NewsFeed = lazy(() => import('./components/News/NewsFeed').then(m => ({ default: m.NewsFeed })))
const IocSearch = lazy(() => import('./components/ThreatIntel/IocSearch'))
const AttackMatrix = lazy(() => import('./components/ThreatIntel/AttackMatrix').then(m => ({ default: m.AttackMatrix })))
const VulnerabilityTrends = lazy(() => import('./components/Analytics/VulnerabilityTrends').then(m => ({ default: m.VulnerabilityTrends })))
const EnhancedDashboard = lazy(() => import('./components/Analytics/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })))
const GlobalSearch = lazy(() => import('./components/Search/GlobalSearch').then(m => ({ default: m.GlobalSearch })))
const CVETimeline = lazy(() => import('./components/CVETimeline/CVETimeline').then(m => ({ default: m.CVETimeline })))
const CisaKevAnalytics = lazy(() => import('./components/Analytics/CisaKevAnalytics').then(m => ({ default: m.CisaKevAnalytics })))
const NvdAnalytics = lazy(() => import('./components/Analytics/NvdAnalytics').then(m => ({ default: m.NvdAnalytics })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const [currentView, setCurrentView] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Enable notification monitoring
  useNotificationMonitor()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />
      case 'vulnerabilities':
      case 'cisa-kev':
        return <CisaKevList />
      case 'cisa-kev-analytics':
        return <CisaKevAnalytics />
      case 'jvn':
        return <JvnList />
      case 'nvd':
        return <NvdList />
      case 'nvd-analytics':
        return <NvdAnalytics />
      case 'redhat':
        return <RedHatSecurityList />
      case 'global-search':
        return <GlobalSearch />
      case 'cve-timeline':
        return <CVETimeline />
      case 'vulnerability-trends':
        return <VulnerabilityTrends />
      case 'enhanced-analytics':
        return <EnhancedDashboard />
      case 'news':
        return <NewsFeed />
      case 'ioc-search':
        return <IocSearch />
      case 'attack-matrix':
        return <AttackMatrix />
      default:
        return <Overview />
    }
  }

  return (
    <MainLayout
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        }
      >
        {renderView()}
      </Suspense>
    </MainLayout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SearchProvider>
            <NotificationBanner />
            <AppContent />
          </SearchProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
