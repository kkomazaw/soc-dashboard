import { useNews } from '@/hooks/useNews'
import { ExternalLink, Newspaper } from 'lucide-react'
import { ExportButton } from '../common/ExportButton'
import { exportNews } from '@/services/api/exportApi'

export const NewsFeed = () => {
  const { data: articles, isLoading, error } = useNews()

  const handleExport = async () => {
    // Only CSV is supported for news
    await exportNews()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          データの取得に失敗しました: {(error as Error).message}
        </p>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'bleepingcomputer':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'thehackernews':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const getSourceName = (source: string) => {
    switch (source) {
      case 'bleepingcomputer':
        return 'BleepingComputer'
      case 'thehackernews':
        return 'The Hacker News'
      default:
        return source
    }
  }

  const displayArticles = articles?.slice(0, 30) || []

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Newspaper className="w-6 h-6 mr-2" />
            セキュリティニュースフィード
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              総件数: {articles?.length || 0}件
            </div>
            <ExportButton onExport={handleExport} label="Export" formats={['csv']} />
          </div>
        </div>

        <div className="space-y-4">
          {displayArticles.map((article) => (
            <div
              key={article.guid}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeColor(
                        article.source
                      )}`}
                    >
                      {getSourceName(article.source)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedDate)}
                    </span>
                  </div>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 block hover:underline"
                  >
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                      {article.description}
                    </p>
                  )}
                  {article.author && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      著者: {article.author}
                    </p>
                  )}
                </div>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  title="外部リンクを開く"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
