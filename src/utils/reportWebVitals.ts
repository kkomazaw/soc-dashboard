import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

const reportMetric = (metric: Metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric)
  }

  // Send to analytics endpoint in production
  if (import.meta.env.PROD) {
    // You can send metrics to your analytics service here
    // Example: sendToAnalytics(metric)

    // For now, we'll just store in sessionStorage for monitoring
    const metrics = JSON.parse(sessionStorage.getItem('webVitals') || '[]')
    metrics.push({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
    })
    sessionStorage.setItem('webVitals', JSON.stringify(metrics))
  }
}

export const initWebVitals = () => {
  // Cumulative Layout Shift - measures visual stability
  onCLS(reportMetric)

  // First Contentful Paint - measures loading performance
  onFCP(reportMetric)

  // Interaction to Next Paint - measures interactivity (replaces FID)
  onINP(reportMetric)

  // Largest Contentful Paint - measures loading performance
  onLCP(reportMetric)

  // Time to First Byte - measures server response time
  onTTFB(reportMetric)
}

// Get stored metrics for display
export const getWebVitals = () => {
  try {
    return JSON.parse(sessionStorage.getItem('webVitals') || '[]')
  } catch {
    return []
  }
}

// Clear stored metrics
export const clearWebVitals = () => {
  sessionStorage.removeItem('webVitals')
}
