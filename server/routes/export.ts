import express from 'express'
import {
  exportCisaKevCSV,
  exportCisaKevPDF,
  exportJvnCSV,
  exportJvnPDF,
  exportNvdCSV,
  exportNvdPDF,
  exportAttackCSV,
  exportAttackPDF,
  exportNewsCSV,
} from '../controllers/exportController'

const router = express.Router()

// CISA KEV Export Routes
router.get('/cisa-kev/csv', exportCisaKevCSV)
router.get('/cisa-kev/pdf', exportCisaKevPDF)

// JVN Export Routes
router.get('/jvn/csv', exportJvnCSV)
router.get('/jvn/pdf', exportJvnPDF)

// NVD Export Routes
router.get('/nvd/csv', exportNvdCSV)
router.get('/nvd/pdf', exportNvdPDF)

// ATT&CK Export Routes
router.get('/attack/csv', exportAttackCSV)
router.get('/attack/pdf', exportAttackPDF)

// News Export Routes
router.get('/news/csv', exportNewsCSV)

export default router
