import { Router } from 'express'
import { getListTweets, getListInfo } from '../controllers/twitterController'

const router = Router()

router.get('/list/tweets', getListTweets)
router.get('/list/info', getListInfo)

export default router
