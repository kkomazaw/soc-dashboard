import { BarChart3, TrendingUp, Shield, Database, Activity } from 'lucide-react'

interface AnalyticsListProps {
  onViewChange?: (view: string) => void
}

export const AnalyticsList = ({ onViewChange }: AnalyticsListProps) => {
  const handleAnalyticsClick = (view: string) => {
    if (onViewChange) {
      onViewChange(view)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">分析ダッシュボード</h2>
        <p className="text-gray-600 dark:text-gray-400">
          各種分析ツールを選択して詳細な分析を実行
        </p>
      </div>

      {/* Analytics Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          利用可能な分析ツール
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CISA KEV Analytics */}
          <div
            onClick={() => handleAnalyticsClick('cisa-kev-analytics')}
            className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-4 -ml-2"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">CISA KEV 分析</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  実際に悪用されている脆弱性（Known Exploited Vulnerabilities）の詳細な統計分析、トレンド分析、ベンダー別・製品別の分布を確認できます。
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded">
                    優先度：高
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NVD Analytics */}
          <div
            onClick={() => handleAnalyticsClick('nvd-analytics')}
            className="border-l-4 border-purple-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-4 -ml-2"
          >
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">NVD 分析</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  National Vulnerability Database（NVD）の包括的なCVE情報の統計分析、CVSS スコア分布、時系列トレンド、カテゴリ別分析を実施します。
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs rounded">
                    包括的分析
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vulnerability Trends */}
          <div
            onClick={() => handleAnalyticsClick('vulnerability-trends')}
            className="border-l-4 border-green-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-4 -ml-2"
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">トレンド分析</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  全データソース（CISA KEV、JVN、NVD、Red Hat）を横断した脆弱性トレンド分析、時系列推移、重要度別の傾向を可視化します。
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                    時系列分析
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics */}
          <div
            onClick={() => handleAnalyticsClick('enhanced-analytics')}
            className="border-l-4 border-indigo-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-r p-4 -ml-2"
          >
            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">高度な分析</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MITRE ATT&CK フレームワークとの相関分析、EPSS（Exploit Prediction Scoring System）スコア分析、地理的脅威分布など高度な分析機能を提供します。
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs rounded">
                    高度な機能
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              分析ツールの活用方法
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              各分析ツールをクリックすると、詳細な分析ダッシュボードへ移動します。複数のデータソースを統合した包括的な脅威分析により、セキュリティ態勢を効果的に把握できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
