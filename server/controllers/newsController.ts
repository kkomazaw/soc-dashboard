import type { Request, Response } from 'express'
import { getAllNewsArticles } from '../services/database/newsDb'
import { syncNewsData } from '../services/dataSync'

export const getNewsFeed = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving news articles from database...')

    // Get data from database
    let articles = await getAllNewsArticles()

    // If database is empty, sync from RSS feeds first
    if (articles.length === 0) {
      console.log('Database is empty, syncing from RSS feeds...')
      await syncNewsData()
      articles = await getAllNewsArticles()
    }

    // Convert Prisma Date objects to ISO strings for JSON response
    const responseData = articles.map((article) => ({
      guid: article.guid,
      title: article.title,
      link: article.link,
      description: article.description || '',
      content: article.content || '',
      author: article.author || '',
      source: article.source,
      category: article.category || '',
      publishedDate: article.publishedDate.toISOString(),
      isRead: article.isRead,
      isStarred: article.isStarred,
    }))

    console.log(`Successfully retrieved ${responseData.length} news articles`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({
      error: 'Failed to fetch news feed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const refreshNews = async (req: Request, res: Response) => {
  try {
    console.log('Manually refreshing news feed...')
    await syncNewsData()
    const articles = await getAllNewsArticles()

    const responseData = articles.map((article) => ({
      guid: article.guid,
      title: article.title,
      link: article.link,
      description: article.description || '',
      content: article.content || '',
      author: article.author || '',
      source: article.source,
      category: article.category || '',
      publishedDate: article.publishedDate.toISOString(),
      isRead: article.isRead,
      isStarred: article.isStarred,
    }))

    res.json({ message: 'News feed refreshed successfully', count: responseData.length })
  } catch (error) {
    console.error('Error refreshing news:', error)
    res.status(500).json({
      error: 'Failed to refresh news feed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
