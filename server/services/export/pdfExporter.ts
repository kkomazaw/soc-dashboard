import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export const generatePDFReport = async (
  title: string,
  data: any[],
  fields: { key: string; label: string }[],
  options?: {
    subtitle?: string
    description?: string
  }
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(title, { align: 'center' })
        .moveDown()

      if (options?.subtitle) {
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(options.subtitle, { align: 'center' })
          .moveDown()
      }

      if (options?.description) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(options.description)
          .moveDown()
      }

      // Metadata
      const now = new Date()
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Generated: ${now.toLocaleString('ja-JP')}`, { align: 'right' })
        .text(`Total Records: ${data.length}`, { align: 'right' })
        .moveDown(2)

      // Table Header
      const tableTop = doc.y
      const columnWidth = (doc.page.width - 100) / fields.length

      doc.fontSize(10).font('Helvetica-Bold')
      fields.forEach((field, i) => {
        doc.text(
          field.label,
          50 + i * columnWidth,
          tableTop,
          { width: columnWidth - 10, ellipsis: true }
        )
      })

      doc
        .moveTo(50, doc.y + 5)
        .lineTo(doc.page.width - 50, doc.y + 5)
        .stroke()
        .moveDown(0.5)

      // Table Rows
      doc.fontSize(8).font('Helvetica')
      let currentPage = 1

      // Add footer to first page
      const addPageFooter = (pageNum: number) => {
        const currentY = doc.y
        doc
          .fontSize(8)
          .text(
            `Page ${pageNum}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          )
        doc.y = currentY
      }

      addPageFooter(currentPage)

      data.forEach((row, rowIndex) => {
        const rowTop = doc.y

        // Check if we need a new page
        if (rowTop > doc.page.height - 100) {
          doc.addPage()
          currentPage++
          addPageFooter(currentPage)
        }

        fields.forEach((field, colIndex) => {
          const value = row[field.key]
          const displayValue = value !== null && value !== undefined ? String(value) : ''

          doc.text(
            displayValue,
            50 + colIndex * columnWidth,
            rowTop,
            { width: columnWidth - 10, ellipsis: true }
          )
        })

        doc.moveDown(0.3)

        // Row separator
        if (rowIndex < data.length - 1) {
          doc
            .strokeColor('#CCCCCC')
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke()
            .moveDown(0.3)
        }
      })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// CISA KEV PDF export
export const exportCisaKevToPDF = async (vulnerabilities: any[]): Promise<Buffer> => {
  const fields = [
    { key: 'cveId', label: 'CVE ID' },
    { key: 'vendorProject', label: 'Vendor' },
    { key: 'product', label: 'Product' },
    { key: 'vulnerabilityName', label: 'Vulnerability' },
    { key: 'dateAdded', label: 'Date Added' },
  ]

  return generatePDFReport(
    'CISA Known Exploited Vulnerabilities',
    vulnerabilities.map((v) => ({
      ...v,
      dateAdded: v.dateAdded ? new Date(v.dateAdded).toLocaleDateString() : '',
    })),
    fields,
    {
      subtitle: 'Security Operations Center Report',
      description: 'Known exploited vulnerabilities that pose significant risk to organizations.',
    }
  )
}

// JVN Vulnerability PDF export
export const exportJvnToPDF = async (vulnerabilities: any[]): Promise<Buffer> => {
  const fields = [
    { key: 'vulnId', label: 'Vuln ID' },
    { key: 'title', label: 'Title' },
    { key: 'severity', label: 'Severity' },
    { key: 'cvssScore', label: 'CVSS' },
    { key: 'publishedDate', label: 'Published' },
  ]

  return generatePDFReport(
    'JVN Vulnerability Report',
    vulnerabilities.map((v) => ({
      ...v,
      publishedDate: v.publishedDate ? new Date(v.publishedDate).toLocaleDateString() : '',
    })),
    fields,
    {
      subtitle: 'Japan Vulnerability Notes',
      description: 'Vulnerability information from JPCERT/CC and IPA.',
    }
  )
}

// NVD CVE PDF export
export const exportNvdToPDF = async (cves: any[]): Promise<Buffer> => {
  const fields = [
    { key: 'cveId', label: 'CVE ID' },
    { key: 'description', label: 'Description' },
    { key: 'severity', label: 'Severity' },
    { key: 'cvssScore', label: 'CVSS' },
    { key: 'publishedDate', label: 'Published' },
  ]

  return generatePDFReport(
    'NVD CVE Report',
    cves.map((cve) => ({
      ...cve,
      description: cve.description?.substring(0, 100) + '...',
      publishedDate: cve.publishedDate ? new Date(cve.publishedDate).toLocaleDateString() : '',
    })),
    fields,
    {
      subtitle: 'National Vulnerability Database',
      description: 'Common Vulnerabilities and Exposures from NIST.',
    }
  )
}

// ATT&CK Techniques PDF export
export const exportAttackTechniquesToPDF = async (techniques: any[]): Promise<Buffer> => {
  const fields = [
    { key: 'techniqueId', label: 'Technique ID' },
    { key: 'name', label: 'Name' },
    { key: 'tactics', label: 'Tactics' },
    { key: 'platforms', label: 'Platforms' },
  ]

  return generatePDFReport(
    'MITRE ATT&CK Techniques',
    techniques.map((tech) => ({
      techniqueId: tech.techniqueId,
      name: tech.name,
      tactics: Array.isArray(tech.tactics) ? tech.tactics.join(', ') : tech.tactics,
      platforms: Array.isArray(tech.platforms) ? tech.platforms.slice(0, 3).join(', ') : tech.platforms,
    })),
    fields,
    {
      subtitle: 'Enterprise ATT&CK Matrix',
      description: 'Adversarial tactics and techniques based on real-world observations.',
    }
  )
}
