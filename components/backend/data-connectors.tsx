// Data Connectors Showcase Component
'use client'

import { useState } from 'react'
import { CheckCircleIcon, ClockIcon, CloudIcon } from 'lucide-react'

export function DataConnectors() {
    const [selectedConnector, setSelectedConnector] = useState<string | null>(null)

    const connectors = [
        {
            id: 'google-analytics',
            name: 'Google Analytics 4',
            icon: '📊',
            status: 'ready',
            description: 'Web analytics and user behavior tracking',
            metrics: ['Active Users', 'Sessions', 'Page Views', 'Bounce Rate'],
            integration: 'OAuth 2.0 + Google Analytics Data API v1'
        },
        {
            id: 'meta-ads',
            name: 'Meta Business (FB/IG Ads)',
            icon: '📱',
            status: 'ready',
            description: 'Social media advertising performance',
            metrics: ['Ad Spend', 'Impressions', 'Clicks', 'Conversions'],
            integration: 'OAuth 2.0 + Meta Marketing API'
        },
        {
            id: 'google-ads',
            name: 'Google Ads',
            icon: '🎯',
            status: 'planned',
            description: 'Search and display advertising campaigns',
            metrics: ['Campaign Spend', 'CTR', 'Quality Score', 'ROAS'],
            integration: 'OAuth 2.0 + Google Ads API'
        },
        {
            id: 'internal-db',
            name: 'Internal Database',
            icon: '💾',
            status: 'ready',
            description: 'Custom metrics from your own database',
            metrics: ['Sales', 'Revenue', 'Custom KPIs', 'Business Events'],
            integration: 'Supabase PostgreSQL + Row Level Security'
        },
        {
            id: 'csv-upload',
            name: 'CSV/Excel Upload',
            icon: '📄',
            status: 'planned',
            description: 'Import data from spreadsheets',
            metrics: ['Batch Imports', 'Historical Data', 'Manual Updates'],
            integration: 'File Upload + CSV Parser'
        },
        {
            id: 'api-webhook',
            name: 'REST API / Webhooks',
            icon: '🔗',
            status: 'planned',
            description: 'Real-time data ingestion via API',
            metrics: ['Events', 'Transactions', 'Custom Data', 'External Systems'],
            integration: 'REST API + Event Streaming'
        },
    ]

    const statusBadge = (status: string) => {
        switch (status) {
            case 'ready':
                return (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        <CheckCircleIcon className="w-3 h-3" />
                        Available
                    </span>
                )
            case 'planned':
                return (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        <ClockIcon className="w-3 h-3" />
                        Coming Soon
                    </span>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <CloudIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-900">Data Source Connectors</h2>
            </div>

            <p className="text-slate-600">
                Extensible architecture supporting multiple data sources. Connect to external analytics platforms
                or use your own database. Each connector implements a standard interface for seamless integration.
            </p>

            {/* Connector Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectors.map((connector) => (
                    <button
                        key={connector.id}
                        onClick={() => setSelectedConnector(selectedConnector === connector.id ? null : connector.id)}
                        className={`text-left p-5 rounded-xl border-2 transition-all ${selectedConnector === connector.id
                                ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                                : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{connector.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">{connector.name}</h3>
                                </div>
                            </div>
                            {statusBadge(connector.status)}
                        </div>

                        <p className="text-xs text-slate-600 mb-3">{connector.description}</p>

                        {selectedConnector === connector.id && (
                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-fade-in">
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-2">Available Metrics:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {connector.metrics.map((metric, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                                {metric}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-1">Integration:</p>
                                    <p className="text-xs text-slate-600 font-mono bg-slate-100 p-2 rounded">
                                        {connector.integration}
                                    </p>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Architecture Diagram */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Connector Architecture</h3>
                <div className="mermaid">
                    {`graph LR
    A[Dashboard UI] --> B[Data Factory]
    B --> C[Google Analytics]
    B --> D[Meta Ads]
    B --> E[Internal DB]
    B --> F[CSV Upload]
    B --> G[API/Webhook]
    
    C --> H[(Unified Metrics)]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Visualization Layer]
    
    style B fill:#6366f1,color:#fff
    style H fill:#10b981,color:#fff
    style I fill:#f59e0b,color:#fff`}
                </div>
            </div>

            {/* Code Example */}
            <div className="mt-6 p-6 bg-slate-900 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Example Implementation</h3>
                <pre className="text-sm text-green-400 overflow-x-auto">
                    {`// Connect to Google Analytics
import { createConnector } from '@/lib/connectors'

const ga4 = createConnector('google-analytics', {
    accessToken: 'ya29.a0AfH6...',
    propertyId: 'properties/123456789'
})

await ga4.connect()

// Fetch metrics
const metrics = await ga4.fetchMetrics({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
})

// Metrics are automatically normalized
console.log(metrics) // [{metric_id, value, timestamp}]`}
                </pre>
            </div>
        </div>
    )
}
