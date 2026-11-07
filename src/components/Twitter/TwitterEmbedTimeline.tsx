import { useEffect, useRef, useState } from 'react'
import { Twitter, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'

// Declare Twitter widgets on window object
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void
        createTimeline: (
          options: { sourceType: string; screenName?: string; userId?: string; listSlug?: string; ownerScreenName?: string; id?: string },
          element: HTMLElement,
          options?: {
            height?: string | number
            width?: string | number
            chrome?: string
            theme?: 'light' | 'dark'
            borderColor?: string
            lang?: string
            tweetLimit?: number
            ariaPolite?: 'polite' | 'assertive' | 'off'
          }
        ) => Promise<HTMLElement>
      }
    }
  }
}

interface TwitterEmbedTimelineProps {
  embedType: 'user' | 'list' | 'likes'
  username?: string
  listId?: string
  listSlug?: string
  ownerScreenName?: string
}

export const TwitterEmbedTimeline = ({
  embedType = 'list',
  username,
  listId = '2117533181436158234',
  listSlug,
  ownerScreenName,
}: TwitterEmbedTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadAttempts, setLoadAttempts] = useState(0)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }

    checkDarkMode()

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const loadTimeline = () => {
    if (!timelineRef.current) return

    setIsLoading(true)
    setError(null)

    // Clear previous content
    timelineRef.current.innerHTML = ''

    // Check if widgets.js is loaded
    if (window.twttr && window.twttr.widgets) {
      try {
        let timelineOptions: any = {}

        if (embedType === 'user' && username) {
          timelineOptions = {
            sourceType: 'profile',
            screenName: username,
          }
        } else if (embedType === 'list' && (listId || listSlug)) {
          if (listId) {
            timelineOptions = {
              sourceType: 'list',
              id: listId,
            }
          } else if (listSlug && ownerScreenName) {
            timelineOptions = {
              sourceType: 'list',
              listSlug: listSlug,
              ownerScreenName: ownerScreenName,
            }
          }
        } else if (embedType === 'likes' && username) {
          timelineOptions = {
            sourceType: 'likes',
            screenName: username,
          }
        }

        window.twttr.widgets
          .createTimeline(timelineOptions, timelineRef.current, {
            height: 600,
            theme: isDark ? 'dark' : 'light',
            chrome: 'noheader nofooter noborders',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            lang: 'ja',
            tweetLimit: 20,
          })
          .then((element) => {
            if (element) {
              setIsLoading(false)
              setError(null)
            } else {
              throw new Error('Timeline element was not created')
            }
          })
          .catch((err) => {
            console.error('Error creating timeline:', err)
            setIsLoading(false)
            setError(
              'タイムラインの読み込みに失敗しました。Xにログインしていない場合、表示されない可能性があります。'
            )
          })
      } catch (err) {
        console.error('Error loading timeline:', err)
        setIsLoading(false)
        setError('タイムラインの初期化に失敗しました')
      }
    } else {
      // widgets.js not loaded yet, wait and retry
      console.log('Waiting for widgets.js to load...')
      setTimeout(() => {
        if (loadAttempts < 5) {
          setLoadAttempts(loadAttempts + 1)
        } else {
          setIsLoading(false)
          setError('X widgets.js の読み込みに失敗しました')
        }
      }, 1000)
    }
  }

  // Load widgets.js script
  useEffect(() => {
    // Check if script already exists
    if (!document.getElementById('twitter-widgets-script')) {
      const script = document.createElement('script')
      script.id = 'twitter-widgets-script'
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.onload = () => {
        console.log('Twitter widgets.js loaded successfully')
        loadTimeline()
      }
      script.onerror = () => {
        setIsLoading(false)
        setError('X widgets.js の読み込みに失敗しました')
      }
      document.body.appendChild(script)
    } else {
      // Script already loaded
      loadTimeline()
    }

    return () => {
      // Cleanup on unmount
      if (timelineRef.current) {
        timelineRef.current.innerHTML = ''
      }
    }
  }, [])

  // Reload when dark mode or embed settings change
  useEffect(() => {
    if (window.twttr && window.twttr.widgets && !isLoading) {
      loadTimeline()
    }
  }, [isDark, embedType, username, listId, listSlug, ownerScreenName])

  // Retry loading on loadAttempts change
  useEffect(() => {
    if (loadAttempts > 0 && loadAttempts < 5) {
      loadTimeline()
    }
  }, [loadAttempts])

  const getListUrl = () => {
    if (embedType === 'list') {
      if (listSlug && ownerScreenName) {
        return `https://x.com/${ownerScreenName}/lists/${listSlug}`
      } else if (listId) {
        return `https://x.com/i/lists/${listId}`
      }
    } else if (embedType === 'user' && username) {
      return `https://x.com/${username}`
    }
    return 'https://x.com'
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              セキュリティ情報タイムライン（X埋め込み）
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadTimeline}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-700 rounded hover:border-blue-500 transition-colors disabled:opacity-50"
              title="タイムラインを再読み込み"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              再読み込み
            </button>
            <a
              href={getListUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Xで開く
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold mb-1">X（Twitter）の仕様変更について</p>
              <p>
                Xの仕様変更により、タイムライン埋め込みはXにログインしているユーザーのみ表示される場合があります。
                表示されない場合は、
                <a
                  href={getListUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  Xで直接開いてご覧ください
                </a>
                。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-y-auto relative">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">タイムラインを読み込んでいます...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64 p-6">
            <div className="text-center max-w-lg">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">読み込みエラー</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={loadTimeline}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  再試行
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  問題が解決しない場合は、
                  <a
                    href={getListUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Xで直接開いてください
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={timelineRef} className="w-full"></div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          データ提供: X (Twitter) Platform •
          <a
            href="https://developer.x.com/en/docs/twitter-for-websites/embedded-tweets/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            埋め込みドキュメント
          </a>
        </p>
      </div>
    </div>
  )
}
