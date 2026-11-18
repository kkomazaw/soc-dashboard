import { Twitter, ExternalLink, AlertCircle, RefreshCw, Heart, Repeat2, MessageCircle, Clock, CreditCard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getListTweets, type Tweet, RateLimitError, CreditsDepletedError } from '@/api/twitterApi'
import { useState, useEffect } from 'react'

// Twitter List URL for the security accounts feed
const TWITTER_LIST_URL = 'https://x.com/i/lists/2117533181436158234'

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}秒前`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const TweetCard = ({ tweet }: { tweet: Tweet }) => {
  const tweetUrl = tweet.author
    ? `https://twitter.com/${tweet.author.username}/status/${tweet.id}`
    : `https://twitter.com/i/web/status/${tweet.id}`

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex gap-3">
        {/* Profile Image */}
        {tweet.author && (
          <a
            href={`https://twitter.com/${tweet.author.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img
              src={tweet.author.profileImageUrl || '/default-avatar.png'}
              alt={tweet.author.name}
              className="w-12 h-12 rounded-full"
            />
          </a>
        )}

        <div className="flex-1 min-w-0">
          {/* Author Info */}
          {tweet.author && (
            <div className="flex items-center gap-1 mb-1">
              <a
                href={`https://twitter.com/${tweet.author.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 dark:text-gray-100 hover:underline"
              >
                {tweet.author.name}
              </a>
              {tweet.author.verified && (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                </svg>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                @{tweet.author.username}
              </span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
              >
                {formatRelativeTime(tweet.createdAt)}
              </a>
            </div>
          )}

          {/* Tweet Text */}
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words mb-2">
            {tweet.isRetweet && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <Repeat2 className="w-3 h-3" />
                <span>リツイート</span>
              </div>
            )}
            {tweet.text}
          </div>

          {/* Metrics */}
          {tweet.metrics && (
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
              {tweet.metrics.reply_count !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{tweet.metrics.reply_count}</span>
                </div>
              )}
              {tweet.metrics.retweet_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-4 h-4" />
                  <span>{tweet.metrics.retweet_count}</span>
                </div>
              )}
              {tweet.metrics.like_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{tweet.metrics.like_count}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const TwitterTimeline = () => {
  const [limit, setLimit] = useState(20)
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['twitter-list-tweets', limit],
    queryFn: () => getListTweets(limit),
    refetchInterval: (query) => {
      // If we're rate limited, don't auto-refresh
      if (rateLimitResetTime && Date.now() < rateLimitResetTime * 1000) {
        return false
      }
      // Otherwise refresh every 15 minutes (Twitter API resets every 15 min)
      return 15 * 60 * 1000
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on rate limit or credits depleted errors
      if (error instanceof RateLimitError || error instanceof CreditsDepletedError) {
        return false
      }
      // Retry other errors once
      return failureCount < 1
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Handle rate limit errors
  useEffect(() => {
    if (error instanceof RateLimitError && error.resetTime) {
      setRateLimitResetTime(error.resetTime)
    }
  }, [error])

  // Update countdown timer
  useEffect(() => {
    if (!rateLimitResetTime) {
      setTimeUntilReset('')
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const resetMs = rateLimitResetTime * 1000
      const diff = resetMs - now

      if (diff <= 0) {
        setRateLimitResetTime(null)
        setTimeUntilReset('')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeUntilReset(`${minutes}分${seconds}秒`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [rateLimitResetTime])

  const isRateLimited = error instanceof RateLimitError
  const isCreditsExhausted = error instanceof CreditsDepletedError

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600"></div>

        {/* Content */}
        <div className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Animated Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full blur-md"></div>
                <div className="relative bg-white dark:bg-gray-800 p-2.5 rounded-full shadow-lg">
                  <Twitter className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-sm">
                  セキュリティ情報 統合フィード
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {/* Live Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-white/90">LIVE</span>
                  </div>
                  <span className="text-xs text-white/70">•</span>
                  <span className="text-xs text-white/90">15分ごとに自動更新</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              title="タイムラインを再読み込み"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              再読み込み
            </button>
            <a
              href={TWITTER_LIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white rounded-lg font-medium text-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              title="Xでリストを開く"
            >
              <ExternalLink className="w-4 h-4" />
              Xで開く
            </a>
          </div>
        </div>
      </div>

      {/* Alert Banners Container */}
      <div className="border-b border-gray-200 dark:border-gray-800">

        {/* Rate Limit Warning */}
        {isRateLimited && timeUntilReset && (
          <div className="mx-4 mt-4 mb-2 p-3.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl shadow-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800/40 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                  Twitter APIレート制限中
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">次の更新まで:</span>
                  <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded-md font-mono text-xs font-semibold">
                    {timeUntilReset}
                  </span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  制限は15分ごとにリセットされます
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mx-4 mt-3 mb-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <div className="flex gap-2.5">
            <div className="flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              セキュリティ関連アカウントのTwitterリストから最新情報を表示
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ツイートを読み込んでいます...</p>
            </div>
          </div>
        )}

        {error && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-lg p-6">
              {isCreditsExhausted ? (
                <>
                  <CreditCard className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Twitter APIクレジット不足
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Twitter APIのクレジットが枯渇しました。
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-left">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      解決方法：
                    </p>
                    <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                      <li>Twitter Developer Portalでプランをアップグレードする</li>
                      <li className="font-semibold">または、.envファイルに以下を追加してモックデータを使用：
                        <code className="block mt-1 px-2 py-1 bg-gray-800 text-green-400 rounded">
                          USE_TWITTER_MOCK=true
                        </code>
                      </li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    モックデータモードでは、サンプルツイートが表示されます。
                  </p>
                </>
              ) : isRateLimited ? (
                <>
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Twitter APIレート制限
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Twitter APIの利用制限に達しました。
                  </p>
                  {timeUntilReset && (
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                      次の更新まで: {timeUntilReset}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    制限は15分ごとに自動的にリセットされます。リセット後、自動的に再取得を試みます。
                  </p>
                  <button
                    onClick={() => refetch()}
                    disabled={rateLimitResetTime !== null && Date.now() < rateLimitResetTime * 1000}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    手動で再試行
                  </button>
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    読み込みエラー
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {(error as Error).message || 'ツイートの読み込み中にエラーが発生しました'}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    再試行
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {data && data.tweets.length > 0 && (
          <div>
            {data.tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        )}

        {data && data.tweets.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">ツイートが見つかりませんでした</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10">
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {data?.tweets.length || 0}件のツイート
            </span>
          </div>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span className="text-gray-500 dark:text-gray-500">
            X (Twitter) API v2
          </span>
          {data?.meta?.mock && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-700 dark:text-yellow-300 rounded-md font-medium">
                デモデータ
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
