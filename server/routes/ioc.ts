import { Router } from 'express'
import {
  searchFileHash,
  searchUrl,
  searchIpAddress,
  getApiStatus,
  checkUrlhaus,
  checkMalwareBazaar,
  checkOtxIp,
  checkOtxDomain,
  checkOtxHash,
  getOtxRecentPulses,
  getThreatFoxRecentIOCs,
  searchThreatFox,
  searchThreatFoxHashController,
  searchFeodoIPController,
  getFeodoBlocklist,
} from '../controllers/iocController'

const router = Router()

// Get API configuration status
router.get('/status', getApiStatus)

// VirusTotal - Search file hash (MD5, SHA1, SHA256)
router.get('/hash/:hash', searchFileHash)

// VirusTotal - Search URL/domain
router.post('/url', searchUrl)

// AbuseIPDB - Check IP address reputation
router.get('/ip/:ip', searchIpAddress)

// URLhaus - Check malicious URL
router.post('/urlhaus', checkUrlhaus)

// MalwareBazaar - Check malware hash
router.get('/malware/:hash', checkMalwareBazaar)

// AlienVault OTX - Check IP reputation
router.get('/otx/ip/:ip', checkOtxIp)

// AlienVault OTX - Check domain reputation
router.get('/otx/domain/:domain', checkOtxDomain)

// AlienVault OTX - Check hash reputation
router.get('/otx/hash/:hash', checkOtxHash)

// AlienVault OTX - Get recent pulses
router.get('/otx/pulses', getOtxRecentPulses)

// ThreatFox - Get recent IOCs
router.get('/threatfox/recent', getThreatFoxRecentIOCs)

// ThreatFox - Search IOC
router.post('/threatfox/search', searchThreatFox)

// ThreatFox - Search hash
router.get('/threatfox/hash/:hash', searchThreatFoxHashController)

// Feodo Tracker - Search IP
router.get('/feodo/ip/:ip', searchFeodoIPController)

// Feodo Tracker - Get C2 blocklist
router.get('/feodo/blocklist', getFeodoBlocklist)

export default router
