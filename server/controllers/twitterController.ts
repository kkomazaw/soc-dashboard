import { Request, Response } from 'express'
import { TwitterApi } from 'twitter-api-v2'

// 開発用モックデータ（レート制限回避用）
const USE_MOCK_DATA = process.env.USE_TWITTER_MOCK === 'true'

// Twitter API v2 クライアント
const getTwitterClient = () => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN

  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN is not set in environment variables')
  }

  return new TwitterApi(bearerToken)
}

// モックツイートデータ
const generateMockTweets = (limit: number) => {
  const accounts = [
    { id: '1', name: 'CISA', username: 'CISAGov', verified: true },
    { id: '2', name: 'JPCERT/CC', username: 'jpcert', verified: true },
    { id: '3', name: 'ぴよ かんご', username: 'piyokango', verified: false },
    { id: '4', name: 'Talos Intelligence', username: 'TalosSecurity', verified: true },
    { id: '5', name: 'Unit 42', username: 'Unit42_Intel', verified: true },
  ]

  const tweets = []
  const now = Date.now()

  for (let i = 0; i < Math.min(limit, 20); i++) {
    const account = accounts[i % accounts.length]
    const createdAt = new Date(now - i * 15 * 60 * 1000) // 15分ごと

    tweets.push({
      id: `mock-${i}`,
      text: `【サンプルツイート ${i + 1}】CVE-2024-${1000 + i}に関する脆弱性情報が公開されました。影響範囲と対策について確認してください。#サイバーセキュリティ #脆弱性情報`,
      createdAt: createdAt.toISOString(),
      author: {
        id: account.id,
        name: account.name,
        username: account.username,
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&size=128&background=1DA1F2&color=fff`,
        verified: account.verified
      },
      metrics: {
        retweet_count: Math.floor(Math.random() * 100),
        reply_count: Math.floor(Math.random() * 50),
        like_count: Math.floor(Math.random() * 200),
        quote_count: Math.floor(Math.random() * 20)
      },
      entities: null,
      isRetweet: i % 5 === 0,
      isReply: i % 7 === 0
    })
  }

  return tweets
}

// リストのツイートを取得
export const getListTweets = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20

    // モックデータモード
    if (USE_MOCK_DATA) {
      console.log('🔧 Using mock Twitter data (USE_TWITTER_MOCK=true)')
      const mockTweets = generateMockTweets(limit)

      return res.json({
        tweets: mockTweets,
        meta: {
          result_count: mockTweets.length,
          mock: true
        }
      })
    }

    // 本物のAPI
    const listId = '2117533181436158234' // Security information list ID
    const client = getTwitterClient()

    // リストのツイートを取得
    const tweets = await client.v2.listTweets(listId, {
      max_results: limit,
      'tweet.fields': [
        'created_at',
        'author_id',
        'public_metrics',
        'entities',
        'referenced_tweets'
      ],
      'user.fields': [
        'name',
        'username',
        'profile_image_url',
        'verified'
      ],
      expansions: ['author_id', 'referenced_tweets.id'],
    })

    // レスポンスを整形
    const formattedTweets = tweets.data.data?.map((tweet) => {
      const author = tweets.includes?.users?.find(u => u.id === tweet.author_id)

      return {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          profileImageUrl: author.profile_image_url,
          verified: author.verified
        } : null,
        metrics: tweet.public_metrics,
        entities: tweet.entities,
        isRetweet: tweet.referenced_tweets?.some(ref => ref.type === 'retweeted'),
        isReply: tweet.referenced_tweets?.some(ref => ref.type === 'replied_to'),
      }
    }) || []

    res.json({
      tweets: formattedTweets,
      meta: tweets.meta
    })
  } catch (error: any) {
    console.error('Twitter API Error:', error)

    // Credits depleted error (402)
    if (error.code === 402) {
      console.error('Twitter API credits depleted. Please upgrade your plan or enable USE_TWITTER_MOCK=true')

      return res.status(402).json({
        error: 'Credits depleted',
        message: 'Twitter API credits have been exhausted. Please upgrade your Twitter API plan or set USE_TWITTER_MOCK=true in your .env file to use mock data.',
        hint: 'Add USE_TWITTER_MOCK=true to your .env file to continue development without real API calls'
      })
    }

    // レート制限エラー
    if (error.code === 429 || error.rateLimit) {
      const resetTime = error.rateLimit?.reset || Math.floor(Date.now() / 1000) + 15 * 60

      console.warn(`Twitter API rate limit hit. Reset at: ${new Date(resetTime * 1000).toISOString()}`)

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Twitter API rate limit exceeded. The limit resets every 15 minutes.',
        resetTime: resetTime
      })
    }

    // 認証エラー
    if (error.code === 401 || error.code === 403) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Twitter API credentials. Please check your TWITTER_BEARER_TOKEN.'
      })
    }

    // その他のエラー
    res.status(500).json({
      error: 'Failed to fetch tweets',
      message: error.message || 'Unknown error occurred'
    })
  }
}

// リスト情報を取得
export const getListInfo = async (req: Request, res: Response) => {
  try {
    const listId = '2117533181436158234'

    const client = getTwitterClient()

    const list = await client.v2.list(listId, {
      'list.fields': ['owner_id', 'member_count', 'follower_count', 'description']
    })

    res.json({
      list: list.data
    })
  } catch (error: any) {
    console.error('Twitter API Error:', error)
    res.status(500).json({
      error: 'Failed to fetch list info',
      message: error.message || 'Unknown error occurred'
    })
  }
}
