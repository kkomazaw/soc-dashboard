import Parser from 'rss-parser'

const parser = new Parser()

export interface RssFeedConfig {
  name: string
  url: string
  source: string
}

export interface NewsArticle {
  guid: string
  title: string
  link: string
  description?: string
  content?: string
  author?: string
  source: string
  category?: string
  publishedDate: string
  isRead?: boolean
  isStarred?: boolean
}

export const RSS_FEEDS: RssFeedConfig[] = [
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    source: 'bleepingcomputer',
  },
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    source: 'thehackernews',
  },
]

export const fetchRssFeed = async (
  feedConfig: RssFeedConfig
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching RSS feed: ${feedConfig.name}`)
    const feed = await parser.parseURL(feedConfig.url)

    const articles: NewsArticle[] = (feed.items || []).map((item) => ({
      guid: item.guid || item.link || `${feedConfig.source}-${Date.now()}-${Math.random()}`,
      title: item.title || 'No title',
      link: item.link || '',
      description: item.contentSnippet || item.content || '',
      content: item.content || '',
      author: item.creator || item.author || '',
      source: feedConfig.source,
      publishedDate: item.pubDate || new Date().toISOString(),
      isRead: false,
      isStarred: false,
    }))

    console.log(`Successfully fetched ${articles.length} articles from ${feedConfig.name}`)
    return articles
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${feedConfig.name}:`, error)
    return []
  }
}

export const fetchAllRssFeeds = async (): Promise<NewsArticle[]> => {
  try {
    const allArticles = await Promise.all(
      RSS_FEEDS.map((feed) => fetchRssFeed(feed))
    )

    const flattenedArticles = allArticles.flat()

    // Sort by published date (newest first)
    flattenedArticles.sort((a, b) => {
      const dateA = new Date(a.publishedDate).getTime()
      const dateB = new Date(b.publishedDate).getTime()
      return dateB - dateA
    })

    return flattenedArticles
  } catch (error) {
    console.error('Failed to fetch all RSS feeds:', error)
    throw new Error(`RSS fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
