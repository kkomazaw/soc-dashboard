import { Router } from 'express'
import { getCisaKev, refreshCisaKev } from '../controllers/vulnerabilityController'

const router = Router()

router.get('/cisa-kev', getCisaKev)
router.post('/cisa-kev/refresh', refreshCisaKev)

export default router
