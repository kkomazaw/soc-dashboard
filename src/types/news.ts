export interface NewsArticle {
  id?: number
  guid: string
  title: string
  link: string
  description?: string
  content?: string
  author?: string
  source: string
  category?: string
  publishedDate: Date | string
  isRead?: boolean
  isStarred?: boolean
  createdAt?: Date | string
}

export type NewsCategory =
  | 'vulnerability'
  | 'ransomware'
  | 'apt'
  | 'malware'
  | 'data-breach'
  | 'patch'
  | 'other'

export type NewsSource =
  | 'bleepingcomputer'
  | 'thehackernews'
  | 'darkreading'
  | 'scannetsecurity'
  | 'other'
