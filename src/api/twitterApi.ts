const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface Tweet {
  id: string
  text: string
  createdAt: string
  author: {
    id: string
    name: string
    username: string
    profileImageUrl?: string
    verified?: boolean
  } | null
  metrics?: {
    retweet_count?: number
    reply_count?: number
    like_count?: number
    quote_count?: number
  }
  entities?: any
  isRetweet?: boolean
  isReply?: boolean
}

export interface TwitterListResponse {
  tweets: Tweet[]
  meta?: {
    result_count?: number
    next_token?: string
    mock?: boolean
  }
}

export interface TwitterListInfo {
  list: {
    id: string
    name: string
    description?: string
    owner_id?: string
    member_count?: number
    follower_count?: number
  }
}

export class RateLimitError extends Error {
  resetTime?: number

  constructor(message: string, resetTime?: number) {
    super(message)
    this.name = 'RateLimitError'
    this.resetTime = resetTime
  }
}

export class CreditsDepletedError extends Error {
  hint?: string

  constructor(message: string, hint?: string) {
    super(message)
    this.name = 'CreditsDepletedError'
    this.hint = hint
  }
}

export const getListTweets = async (limit: number = 20): Promise<TwitterListResponse> => {
  const response = await fetch(`${API_BASE_URL}/twitter/list/tweets?limit=${limit}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch tweets' }))

    // Credits depleted error (402)
    if (response.status === 402) {
      throw new CreditsDepletedError(
        error.message || 'Twitter API credits have been exhausted.',
        error.hint
      )
    }

    // Rate limit error - throw special error with reset time
    if (response.status === 429) {
      throw new RateLimitError(
        error.message || 'Twitter API rate limit exceeded. Please wait before trying again.',
        error.resetTime
      )
    }

    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const getListInfo = async (): Promise<TwitterListInfo> => {
  const response = await fetch(`${API_BASE_URL}/twitter/list/info`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch list info' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}
