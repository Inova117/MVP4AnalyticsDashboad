// Main Dashboard Page
'use client'

import { useState, useEffect, useCallback } from 'react'
import { dataClient } from '@/lib/supabase'
import { DateRangeProvider } from '@/lib/contexts/date-range-context'
import { DATA_SOURCE_CHANGED_EVENT } from '@/lib/mock-data/data-source-registry'
import { AppHeader } from '@/components/app-header'
import { WidgetGrid } from '@/components/widgets/widget-grid'
import { DateRangeSelector } from '@/components/date-range-selector'
import { AddWidgetModal } from '@/components/widgets/add-widget-modal'
import { ExportPdfModal } from '@/components/export-pdf-modal'
import { AIInsightsPanel } from '@/components/ai-insights-panel'
import type { Dashboard, Widget } from '@/types'
import { PlusIcon, FileDownIcon, SparklesIcon, LayoutGridIcon } from 'lucide-react'

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [widgets, setWidgets] = useState<Widget[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
    const [showAIInsights, setShowAIInsights] = useState(false)

    const loadDashboard = useCallback(async () => {
        try {
            const dashboards = await dataClient.getDashboards()
            const def = dashboards.find((d) => d.is_default) || dashboards[0]
            if (def) {
                setDashboard(def)
                setWidgets(await dataClient.getWidgets(def.id))
            }
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    // Switching the data source rebuilds the whole dashboard in place.
    useEffect(() => {
        const onSourceChange = () => {
            setLoading(true)
            setWidgets([])
            loadDashboard()
        }
        window.addEventListener(DATA_SOURCE_CHANGED_EVENT, onSourceChange)
        return () => window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, onSourceChange)
    }, [loadDashboard])

    // Keyboard shortcut for AI insights (⌘/Ctrl + I)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault()
                setShowAIInsights((v) => !v)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return (
        <DateRangeProvider>
            <div className="min-h-screen bg-background bg-mesh">
                <AppHeader />

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {dashboard?.name ?? 'Dashboard'}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Real-time performance overview &amp; AI-powered insights
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <DateRangeSelector />
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="btn-secondary"
                                title="Export to PDF"
                            >
                                <FileDownIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button
                                onClick={() => setShowAIInsights((v) => !v)}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus-ring ${showAIInsights
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'bg-primary/10 text-primary hover:bg-primary/15'
                                    }`}
                                title="AI Insights (⌘I)"
                            >
                                <SparklesIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">AI Insights</span>
                            </button>
                            <button onClick={() => setShowAddModal(true)} className="btn-primary">
                                <PlusIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Widget</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <DashboardSkeleton />
                    ) : widgets.length === 0 ? (
                        <EmptyState onAdd={() => setShowAddModal(true)} />
                    ) : (
                        dashboard && (
                            <WidgetGrid dashboardId={dashboard.id} widgets={widgets} onUpdate={loadDashboard} />
                        )
                    )}
                </main>

                {showAddModal && dashboard && (
                    <AddWidgetModal
                        dashboardId={dashboard.id}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={loadDashboard}
                    />
                )}

                {showExportModal && dashboard && (
                    <ExportPdfModal dashboardName={dashboard.name} onClose={() => setShowExportModal(false)} />
                )}

                <AIInsightsPanel isOpen={showAIInsights} onClose={() => setShowAIInsights(false)} />
            </div>
        </DateRangeProvider>
    )
}

function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-12 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={`k-${i}`} className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="h-[160px] rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                        <div className="skeleton h-9 w-2/3" />
                        <div className="skeleton mt-3 h-5 w-1/3" />
                        <div className="skeleton mt-4 h-8 w-full" />
                    </div>
                </div>
            ))}
            {['lg:col-span-8', 'lg:col-span-4', 'lg:col-span-6', 'lg:col-span-6'].map((span, i) => (
                <div key={`c-${i}`} className={`col-span-12 ${span}`}>
                    <div className="h-[320px] rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                        <div className="skeleton h-4 w-1/4" />
                        <div className="skeleton mt-4 h-[240px] w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LayoutGridIcon className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No widgets yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add your first widget to start visualizing this workspace&apos;s data.
            </p>
            <button onClick={onAdd} className="btn-primary mt-5">
                <PlusIcon className="h-4 w-4" />
                Add Widget
            </button>
        </div>
    )
}
