import { Request, Response } from 'express'
import { getAllCisaKev } from '../services/database/cisaKevDb'
import { getAllJvnVulnerabilities } from '../services/database/jvnDb'
import { getAllNvdCves } from '../services/database/nvdDb'
import { getAllTechniques } from '../services/database/attackDb'
import { getAllNewsArticles } from '../services/database/newsDb'
import {
  exportCisaKevToCSV,
  exportJvnToCSV,
  exportNvdToCSV,
  exportAttackTechniquesToCSV,
  exportNewsToCSV,
} from '../services/export/csvExporter'
import {
  exportCisaKevToPDF,
  exportJvnToPDF,
  exportNvdToPDF,
  exportAttackTechniquesToPDF,
} from '../services/export/pdfExporter'

// CISA KEV CSV Export
export const exportCisaKevCSV = async (req: Request, res: Response) => {
  try {
    const vulnerabilities = await getAllCisaKev()
    const csv = exportCisaKevToCSV(vulnerabilities)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="cisa-kev-export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting CISA KEV to CSV:', error)
    res.status(500).json({ error: 'Failed to export CISA KEV data to CSV' })
  }
}

// CISA KEV PDF Export
export const exportCisaKevPDF = async (req: Request, res: Response) => {
  try {
    const vulnerabilities = await getAllCisaKev()
    const pdfBuffer = await exportCisaKevToPDF(vulnerabilities)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="cisa-kev-export.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error exporting CISA KEV to PDF:', error)
    res.status(500).json({ error: 'Failed to export CISA KEV data to PDF' })
  }
}

// JVN CSV Export
export const exportJvnCSV = async (req: Request, res: Response) => {
  try {
    const vulnerabilities = await getAllJvnVulnerabilities()

    // Transform database fields to match CSV export expectations
    const transformedData = vulnerabilities.map((vuln) => ({
      vulnId: vuln.jvnId,
      title: vuln.title,
      severity: vuln.severity,
      cvssScore: vuln.cvssScore,
      publishedDate: vuln.publishedDate,
      lastModifiedDate: vuln.lastModifiedDate,
      description: vuln.summary,
    }))

    const csv = exportJvnToCSV(transformedData)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="jvn-export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting JVN to CSV:', error)
    res.status(500).json({ error: 'Failed to export JVN data to CSV' })
  }
}

// JVN PDF Export
export const exportJvnPDF = async (req: Request, res: Response) => {
  try {
    const vulnerabilities = await getAllJvnVulnerabilities()

    // Transform database fields to match PDF export expectations
    const transformedData = vulnerabilities.map((vuln) => ({
      vulnId: vuln.jvnId,
      title: vuln.title,
      severity: vuln.severity,
      cvssScore: vuln.cvssScore,
      publishedDate: vuln.publishedDate,
      lastModifiedDate: vuln.lastModifiedDate,
      description: vuln.summary,
    }))

    const pdfBuffer = await exportJvnToPDF(transformedData)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="jvn-export.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error exporting JVN to PDF:', error)
    res.status(500).json({ error: 'Failed to export JVN data to PDF' })
  }
}

// NVD CSV Export
export const exportNvdCSV = async (req: Request, res: Response) => {
  try {
    const cves = await getAllNvdCves()

    // Transform database fields to match CSV export expectations
    const transformedData = cves.map((cve) => ({
      cveId: cve.cveId,
      description: cve.description,
      severity: cve.cvssSeverity,
      cvssScore: cve.cvssScore,
      publishedDate: cve.published,
      lastModifiedDate: cve.lastModified,
      vulnStatus: cve.vulnStatus,
    }))

    const csv = exportNvdToCSV(transformedData)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="nvd-export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting NVD to CSV:', error)
    res.status(500).json({ error: 'Failed to export NVD data to CSV' })
  }
}

// NVD PDF Export
export const exportNvdPDF = async (req: Request, res: Response) => {
  try {
    const cves = await getAllNvdCves()

    // Transform database fields to match PDF export expectations
    const transformedData = cves.map((cve) => ({
      cveId: cve.cveId,
      description: cve.description,
      severity: cve.cvssSeverity,
      cvssScore: cve.cvssScore,
      publishedDate: cve.published,
      lastModifiedDate: cve.lastModified,
      vulnStatus: cve.vulnStatus,
    }))

    const pdfBuffer = await exportNvdToPDF(transformedData)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="nvd-export.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error exporting NVD to PDF:', error)
    res.status(500).json({ error: 'Failed to export NVD data to PDF' })
  }
}

// ATT&CK CSV Export
export const exportAttackCSV = async (req: Request, res: Response) => {
  try {
    const techniques = await getAllTechniques()

    // Transform database fields to match CSV export expectations
    const transformedData = techniques.map((tech) => ({
      techniqueId: tech.id,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics,
      platforms: tech.platforms,
      dataSource: tech.dataSource,
    }))

    const csv = exportAttackTechniquesToCSV(transformedData)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="attack-techniques-export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting ATT&CK to CSV:', error)
    res.status(500).json({ error: 'Failed to export ATT&CK data to CSV' })
  }
}

// ATT&CK PDF Export
export const exportAttackPDF = async (req: Request, res: Response) => {
  try {
    const techniques = await getAllTechniques()

    // Transform database fields to match PDF export expectations
    const transformedData = techniques.map((tech) => ({
      techniqueId: tech.id,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics,
      platforms: tech.platforms,
      dataSource: tech.dataSource,
    }))

    const pdfBuffer = await exportAttackTechniquesToPDF(transformedData)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="attack-techniques-export.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error exporting ATT&CK to PDF:', error)
    res.status(500).json({ error: 'Failed to export ATT&CK data to PDF' })
  }
}

// News CSV Export
export const exportNewsCSV = async (req: Request, res: Response) => {
  try {
    const articles = await getAllNewsArticles()

    // Transform database fields to match CSV export expectations
    const transformedData = articles.map((article) => ({
      title: article.title,
      source: article.source,
      link: article.link,
      publishedDate: article.publishedDate,
      description: article.description || '',
    }))

    const csv = exportNewsToCSV(transformedData)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="news-feed-export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting News to CSV:', error)
    res.status(500).json({ error: 'Failed to export News data to CSV' })
  }
}
