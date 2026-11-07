import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import vulnerabilitiesRouter from './routes/vulnerabilities'
import newsRouter from './routes/news'
import iocRouter from './routes/ioc'
import jvnRouter from './routes/jvn'
import nvdRouter from './routes/nvd'
import redhatRouter from './routes/redhat'
import attackRouter from './routes/attack'
import exportRouter from './routes/export'
import mappingRouter from './routes/mapping'
import analyticsRouter from './routes/analytics'
import twitterRouter from './routes/twitter'
import { initializeScheduler } from './services/scheduler'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/vulnerabilities', vulnerabilitiesRouter)
app.use('/api/news', newsRouter)
app.use('/api/ioc', iocRouter)
app.use('/api/jvn', jvnRouter)
app.use('/api/nvd', nvdRouter)
app.use('/api/redhat', redhatRouter)
app.use('/api/attack', attackRouter)
app.use('/api/export', exportRouter)
app.use('/api/mapping', mappingRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/twitter', twitterRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 SOC Dashboard API server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints:`)
  console.log(`   - GET  /api/vulnerabilities/cisa-kev`)
  console.log(`   - POST /api/vulnerabilities/cisa-kev/refresh`)
  console.log(`   - GET  /api/jvn`)
  console.log(`   - GET  /api/jvn/recent`)
  console.log(`   - POST /api/jvn/refresh`)
  console.log(`   - GET  /api/nvd`)
  console.log(`   - GET  /api/nvd/recent`)
  console.log(`   - GET  /api/nvd/status`)
  console.log(`   - GET  /api/nvd/search/:cveId`)
  console.log(`   - POST /api/nvd/refresh`)
  console.log(`   - GET  /api/redhat/advisories`)
  console.log(`   - GET  /api/redhat/cves`)
  console.log(`   - GET  /api/redhat/stats`)
  console.log(`   - GET  /api/redhat/all`)
  console.log(`   - POST /api/redhat/refresh`)
  console.log(`   - GET  /api/attack/techniques`)
  console.log(`   - GET  /api/attack/tactics`)
  console.log(`   - GET  /api/attack/matrix`)
  console.log(`   - GET  /api/attack/search?q=keyword`)
  console.log(`   - GET  /api/attack/techniques/:techniqueId`)
  console.log(`   - POST /api/attack/refresh`)
  console.log(`   - GET  /api/news/feed`)
  console.log(`   - POST /api/news/feed/refresh`)
  console.log(`   - GET  /api/ioc/status`)
  console.log(`   - GET  /api/ioc/hash/:hash`)
  console.log(`   - POST /api/ioc/url`)
  console.log(`   - GET  /api/ioc/ip/:ip`)
  console.log(`   - GET  /api/export/cisa-kev/csv`)
  console.log(`   - GET  /api/export/cisa-kev/pdf`)
  console.log(`   - GET  /api/export/jvn/csv`)
  console.log(`   - GET  /api/export/jvn/pdf`)
  console.log(`   - GET  /api/export/nvd/csv`)
  console.log(`   - GET  /api/export/nvd/pdf`)
  console.log(`   - GET  /api/export/attack/csv`)
  console.log(`   - GET  /api/export/attack/pdf`)
  console.log(`   - GET  /api/export/news/csv`)
  console.log(`   - GET  /api/twitter/list/tweets`)
  console.log(`   - GET  /api/twitter/list/info`)
  console.log(`   - GET  /health`)
  console.log('')

  // Log API configuration status
  console.log(`🔑 API Configuration:`)
  console.log(`   - VirusTotal: ${process.env.VIRUSTOTAL_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`   - AbuseIPDB: ${process.env.ABUSEIPDB_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`   - NVD: ${process.env.NVD_API_KEY ? '✅ Configured' : '⚠️  Not configured (using public API with limits)'}`)
  console.log(`   - Twitter: ${process.env.TWITTER_BEARER_TOKEN ? '✅ Configured' : '❌ Not configured'}`)
  console.log('')

  // Initialize automatic data synchronization
  initializeScheduler()
})
