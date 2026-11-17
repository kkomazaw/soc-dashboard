import express from 'express'
import {
  getNvdCves,
  getRecentNvd,
  searchCve,
  refreshNvdData,
  refreshNvdHistoricalData,
  getNvdApiStatus,
} from '../controllers/nvdController'

const router = express.Router()

router.get('/', getNvdCves)
router.get('/recent', getRecentNvd)
router.get('/status', getNvdApiStatus)
router.get('/search/:cveId', searchCve)
router.post('/refresh', refreshNvdData)
router.post('/refresh-historical', refreshNvdHistoricalData)

export default router
