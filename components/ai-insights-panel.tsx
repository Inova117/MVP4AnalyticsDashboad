// AI Insights Panel — slide-over with data-derived insights for the active source.
'use client'

import { useState, useEffect, useCallback } from 'react'
import { XIcon, SparklesIcon, TrendingUpIcon, AlertTriangleIcon, LightbulbIcon, InfoIcon } from 'lucide-react'
import { generateInsights, getHealthScore, type Insight } from '@/lib/ai-insights/analyzer'
import {
    getActiveDataSource,
    DATA_SOURCE_CHANGED_EVENT,
    type DataSourceType,
} from '@/lib/mock-data/data-source-registry'

interface AIInsightsPanelProps {
    isOpen: boolean
    onClose: () => void
}

const ICON: Record<Insight['type'], React.ReactNode> = {
    success: <TrendingUpIcon className="h-5 w-5 text-success" />,
    warning: <AlertTriangleIcon className="h-5 w-5 text-warning" />,
    recommendation: <LightbulbIcon className="h-5 w-5 text-primary" />,
    info: <InfoIcon className="h-5 w-5 text-info" />,
}

export function AIInsightsPanel({ isOpen, onClose }: AIInsightsPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [health, setHealth] = useState<ReturnType<typeof getHealthScore> | null>(null)
    const [analyzing, setAnalyzing] = useState(false)

    const analyze = useCallback((sourceId?: DataSourceType) => {
        setAnalyzing(true)
        const source = sourceId || getActiveDataSource()
        // brief delay simulates model thinking
        setTimeout(() => {
            setInsights(generateInsights(source))
            setHealth(getHealthScore(source))
            setAnalyzing(false)
        }, 650)
    }, [])

    useEffect(() => {
        if (isOpen) analyze()
    }, [isOpen, analyze])

    useEffect(() => {
        const onChange = (e: Event) => {
            const detail = (e as CustomEvent).detail as DataSourceType
            if (isOpen) analyze(detail)
        }
        window.addEventListener(DATA_SOURCE_CHANGED_EVENT, onChange)
        return () => window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, onChange)
    }, [isOpen, analyze])

    if (!isOpen) return null

    const healthColor =
        !health ? 'bg-muted-foreground'
            : health.status === 'excellent' ? 'bg-success'
                : health.status === 'good' ? 'bg-success/80'
                    : health.status === 'needs-attention' ? 'bg-warning'
                        : 'bg-danger'

    return (
        <>
            <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-elevated animate-slide-in-right sm:w-[460px]">
                {/* Header */}
                <div className="border-b border-border bg-gradient-to-br from-primary/10 to-accent/10 px-6 py-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                                <SparklesIcon className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-foreground">AI Insights</h2>
                                <p className="text-xs text-muted-foreground">Powered by Claude</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-ring" aria-label="Close">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {health && !analyzing && (
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Overall Health</span>
                                <span className="text-2xl font-bold text-foreground tabular-nums">{health.score}</span>
                            </div>
                            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div className={`h-2 rounded-full transition-all duration-700 ${healthColor}`} style={{ width: `${health.score}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{health.summary}</p>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <span className="relative inline-flex">
                                <SparklesIcon className="h-10 w-10 animate-pulse text-primary" />
                                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                            </span>
                            <p className="mt-4 text-sm text-muted-foreground">Analyzing your data…</p>
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.id} className="rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/30">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5">{ICON[insight.type]}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                                            {insight.priority === 'high' && (
                                                <span className="shrink-0 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">High</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{insight.description}</p>

                                        {insight.metric && (
                                            <div className="mt-3 flex items-center gap-3 text-xs">
                                                <span className="text-muted-foreground">{insight.metric}:</span>
                                                <span className="font-semibold text-foreground">{insight.value}</span>
                                                {typeof insight.change === 'number' && insight.change !== 0 && (
                                                    <span className={`flex items-center gap-1 font-medium ${insight.change > 0 ? 'text-success' : 'text-danger'}`}>
                                                        <TrendingUpIcon className={`h-3 w-3 ${insight.change < 0 ? 'rotate-180' : ''}`} />
                                                        {Math.abs(insight.change)}%
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {insight.action && (
                                            <div className="mt-3 rounded-lg border border-border/60 bg-card p-3">
                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">Recommended action</p>
                                                <p className="text-xs text-foreground">{insight.action}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <button onClick={() => analyze()} disabled={analyzing} className="btn-primary w-full">
                        <SparklesIcon className="h-4 w-4" />
                        {analyzing ? 'Analyzing…' : 'Refresh Insights'}
                    </button>
                </div>
            </div>
        </>
    )
}
