import express from 'express'
import {
  getJvnVulnerabilities,
  getRecentJvn,
  refreshJvnData,
} from '../controllers/jvnController'

const router = express.Router()

router.get('/', getJvnVulnerabilities)
router.get('/recent', getRecentJvn)
router.post('/refresh', refreshJvnData)

export default router
