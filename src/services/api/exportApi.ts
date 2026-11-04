const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const exportCisaKev = async (format: 'csv' | 'pdf') => {
  const response = await fetch(`${API_BASE_URL}/api/export/cisa-kev/${format}`)

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = `cisa-kev-${new Date().toISOString().split('T')[0]}.${format}`
  downloadFile(blob, filename)
}

export const exportJvn = async (format: 'csv' | 'pdf') => {
  const response = await fetch(`${API_BASE_URL}/api/export/jvn/${format}`)

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = `jvn-vulnerabilities-${new Date().toISOString().split('T')[0]}.${format}`
  downloadFile(blob, filename)
}

export const exportNvd = async (format: 'csv' | 'pdf') => {
  const response = await fetch(`${API_BASE_URL}/api/export/nvd/${format}`)

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = `nvd-cves-${new Date().toISOString().split('T')[0]}.${format}`
  downloadFile(blob, filename)
}

export const exportAttack = async (format: 'csv' | 'pdf') => {
  const response = await fetch(`${API_BASE_URL}/api/export/attack/${format}`)

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = `attack-techniques-${new Date().toISOString().split('T')[0]}.${format}`
  downloadFile(blob, filename)
}

export const exportNews = async () => {
  const response = await fetch(`${API_BASE_URL}/api/export/news/csv`)

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = `news-feed-${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(blob, filename)
}
