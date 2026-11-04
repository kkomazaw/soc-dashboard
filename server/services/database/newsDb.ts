import { prisma } from './prismaClient'
import type { NewsArticle as PrismaNewsArticle } from '@prisma/client'

export interface NewsArticleData {
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

/**
 * Save or update news articles in the database
 */
export const saveNewsArticles = async (
  articles: NewsArticleData[]
): Promise<void> => {
  console.log(`Saving ${articles.length} news articles to database...`)

  try {
    // Use transaction for better performance
    await prisma.$transaction(
      articles.map((article) =>
        prisma.newsArticle.upsert({
          where: { guid: article.guid },
          update: {
            title: article.title,
            link: article.link,
            description: article.description || null,
            content: article.content || null,
            author: article.author || null,
            source: article.source,
            category: article.category || null,
            publishedDate: new Date(article.publishedDate),
            isRead: article.isRead ?? false,
            isStarred: article.isStarred ?? false,
          },
          create: {
            guid: article.guid,
            title: article.title,
            link: article.link,
            description: article.description || null,
            content: article.content || null,
            author: article.author || null,
            source: article.source,
            category: article.category || null,
            publishedDate: new Date(article.publishedDate),
            isRead: article.isRead ?? false,
            isStarred: article.isStarred ?? false,
          },
        })
      )
    )

    console.log(`Successfully saved ${articles.length} news articles`)
  } catch (error) {
    console.error('Failed to save news articles to database:', error)
    throw error
  }
}

/**
 * Get all news articles from the database
 */
export const getAllNewsArticles = async (): Promise<PrismaNewsArticle[]> => {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: {
        publishedDate: 'desc',
      },
    })

    console.log(`Retrieved ${articles.length} news articles from database`)
    return articles
  } catch (error) {
    console.error('Failed to retrieve news articles from database:', error)
    throw error
  }
}

/**
 * Get news articles from a specific source
 */
export const getNewsBySource = async (
  source: string
): Promise<PrismaNewsArticle[]> => {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: {
        source,
      },
      orderBy: {
        publishedDate: 'desc',
      },
    })

    return articles
  } catch (error) {
    console.error(`Failed to retrieve news from source ${source}:`, error)
    throw error
  }
}

/**
 * Get unread news articles
 */
export const getUnreadNews = async (): Promise<PrismaNewsArticle[]> => {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: {
        isRead: false,
      },
      orderBy: {
        publishedDate: 'desc',
      },
    })

    return articles
  } catch (error) {
    console.error('Failed to retrieve unread news:', error)
    throw error
  }
}

/**
 * Mark article as read
 */
export const markAsRead = async (guid: string): Promise<void> => {
  try {
    await prisma.newsArticle.update({
      where: { guid },
      data: { isRead: true },
    })
  } catch (error) {
    console.error(`Failed to mark article ${guid} as read:`, error)
    throw error
  }
}

/**
 * Toggle starred status
 */
export const toggleStarred = async (guid: string): Promise<void> => {
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { guid },
    })

    if (article) {
      await prisma.newsArticle.update({
        where: { guid },
        data: { isStarred: !article.isStarred },
      })
    }
  } catch (error) {
    console.error(`Failed to toggle starred status for ${guid}:`, error)
    throw error
  }
}

/**
 * Get database statistics
 */
export const getNewsStats = async () => {
  try {
    const total = await prisma.newsArticle.count()
    const unread = await prisma.newsArticle.count({
      where: { isRead: false },
    })
    const starred = await prisma.newsArticle.count({
      where: { isStarred: true },
    })

    return { total, unread, starred }
  } catch (error) {
    console.error('Failed to get news stats:', error)
    throw error
  }
}
