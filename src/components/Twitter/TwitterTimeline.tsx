import { useEffect, useState } from 'react'
import { Twitter, ExternalLink, AlertCircle } from 'lucide-react'
import { TWITTER_ACCOUNTS, TWITTER_CATEGORIES, type TwitterCategory } from '@/data/twitterAccounts'

export const TwitterTimeline = () => {
  const [selectedCategory, setSelectedCategory] = useState<TwitterCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState(TWITTER_ACCOUNTS[0].username)

  const filteredAccounts = selectedCategory === 'all'
    ? TWITTER_ACCOUNTS
    : TWITTER_ACCOUNTS.filter(account => account.category === selectedCategory)

  useEffect(() => {
    // Twitter widget script loader
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.onload = () => {
      setIsLoading(false)
      // Refresh Twitter widgets when the script loads
      if (window.twttr?.widgets) {
        window.twttr.widgets.load()
      }
    }
    document.body.appendChild(script)

    return () => {
      // Clean up - only if script exists
      const scripts = document.querySelectorAll('script[src="https://platform.twitter.com/widgets.js"]')
      scripts.forEach(s => s.parentNode?.removeChild(s))
    }
  }, [])

  useEffect(() => {
    // Reload widgets when account changes
    const timer = setTimeout(() => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.load()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [selectedAccount])

  const currentAccount = TWITTER_ACCOUNTS.find(acc => acc.username === selectedAccount)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Twitter className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            X フィード
          </h2>
        </div>

        {/* Info Banner */}
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              CLAUDE.mdに記載されたセキュリティアカウントのツイートを表示します
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            カテゴリ
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              すべて
            </button>
            {TWITTER_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Account Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            アカウント ({filteredAccounts.length})
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          >
            {filteredAccounts.map(account => (
              <option key={account.username} value={account.username}>
                @{account.username} - {account.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Account Info */}
      {currentAccount && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`https://twitter.com/${currentAccount.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  @{currentAccount.username}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {currentAccount.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentAccount.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Twitter Embedded Timeline */}
        <div className="w-full h-full">
          <a
            className="twitter-timeline"
            data-height="100%"
            data-theme="dark"
            data-chrome="noheader noborders"
            data-tweet-limit="20"
            href={`https://twitter.com/${selectedAccount}`}
          >
            Loading tweets from @{selectedAccount}...
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          リアルタイム更新 • データ提供: X (Twitter)
        </p>
      </div>
    </div>
  )
}

// TypeScript declaration for Twitter widgets
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void
      }
    }
  }
}
