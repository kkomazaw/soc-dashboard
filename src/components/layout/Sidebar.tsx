import { Home, Shield, Newspaper, ChevronRight, Search, Target, TrendingUp, BarChart3, Filter, Calendar } from 'lucide-react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'global-search', label: 'グローバル検索', icon: Filter },
  { id: 'cve-timeline', label: 'CVEタイムライン', icon: Calendar },
  { id: 'vulnerabilities', label: '脆弱性', icon: Shield, children: [
    { id: 'cisa-kev', label: 'CISA KEV' },
    { id: 'jvn', label: 'JVN' },
    { id: 'nvd', label: 'NVD' },
    { id: 'redhat', label: 'Red Hat Security' },
  ]},
  { id: 'vulnerability-trends', label: 'トレンド分析', icon: TrendingUp },
  { id: 'enhanced-analytics', label: '高度な分析', icon: BarChart3 },
  { id: 'ioc-search', label: 'IoC検索', icon: Search },
  { id: 'attack-matrix', label: 'ATT&CK Matrix', icon: Target },
  { id: 'news', label: 'ニュース', icon: Newspaper },
]

export const Sidebar = ({
  currentView,
  onViewChange,
}: SidebarProps) => {
  return (
    <aside className="bg-gray-900 dark:bg-gray-950 text-white w-64 min-h-screen p-4 border-r border-gray-800 dark:border-gray-900">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'hover:bg-gray-800 dark:hover:bg-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onViewChange(child.id)}
                    className={`w-full flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm transition-colors ${
                      currentView === child.id
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'hover:bg-gray-800 dark:hover:bg-gray-900 text-gray-300 dark:text-gray-400'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="flex-1 text-left">{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
