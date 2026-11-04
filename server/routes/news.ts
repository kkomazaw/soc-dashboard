import { Router } from 'express'
import { getNewsFeed, refreshNews } from '../controllers/newsController'

const router = Router()

router.get('/feed', getNewsFeed)
router.post('/feed/refresh', refreshNews)

export default router
