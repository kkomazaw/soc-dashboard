import express from 'express'
import {
  getNvdCves,
  getRecentNvd,
  searchCve,
  refreshNvdData,
  getNvdApiStatus,
} from '../controllers/nvdController'

const router = express.Router()

router.get('/', getNvdCves)
router.get('/recent', getRecentNvd)
router.get('/status', getNvdApiStatus)
router.get('/search/:cveId', searchCve)
router.post('/refresh', refreshNvdData)

export default router
