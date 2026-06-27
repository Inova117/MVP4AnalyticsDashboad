// Alerts Page
'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusIcon } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AlertList, type AlertMeta } from '@/components/alerts/alert-list'
import { CreateAlertModal } from '@/components/alerts/create-alert-modal'
import { dataClient } from '@/lib/supabase'
import { DATA_SOURCE_CHANGED_EVENT } from '@/lib/mock-data/data-source-registry'
import { formatMetricValue } from '@/lib/format'
import { subDays } from 'date-fns'
import type { Alert, Metric } from '@/types'

function evaluate(condition: Alert['condition'], value: number, threshold: number): boolean {
    switch (condition) {
        case 'gt':
            return value > threshold
        case 'lt':
            return value < threshold
        case 'eq':
            return Math.abs(value - threshold) < 0.001
        case 'pct_change':
            return Math.abs(value) >= threshold
        default:
            return false
    }
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [meta, setMeta] = useState<Record<string, AlertMeta>>({})
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const loadAlerts = useCallback(async () => {
        try {
            const [data, metrics] = await Promise.all([dataClient.getAlerts(), dataClient.getMetrics()])
            const metricMap = new Map<string, Metric>(metrics.map((m) => [m.id, m]))

            const end = new Date()
            const start = subDays(end, 7)
            const metaEntries: Record<string, AlertMeta> = {}

            await Promise.all(
                data.map(async (alert) => {
                    const metric = metricMap.get(alert.metric_id)
                    if (!metric) {
                        metaEntries[alert.id] = { metricName: 'Unknown metric', valueLabel: '—', thresholdLabel: String(alert.threshold), triggered: false }
                        return
                    }
                    const series = await dataClient.getMetricData(alert.metric_id, start, end)
                    const latest = series.length ? series[series.length - 1].value : 0
                    metaEntries[alert.id] = {
                        metricName: metric.name,
                        valueLabel: `${metric.prefix ?? ''}${formatMetricValue(latest, metric.unit, { decimals: metric.decimals })}${metric.suffix ?? ''}`,
                        thresholdLabel: `${metric.prefix ?? ''}${formatMetricValue(alert.threshold, metric.unit, { decimals: metric.decimals })}${metric.suffix ?? ''}`,
                        triggered: alert.is_active && evaluate(alert.condition, latest, alert.threshold),
                    }
                })
            )

            setAlerts(data)
            setMeta(metaEntries)
        } catch (error) {
            console.error('Failed to load alerts:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAlerts()
    }, [loadAlerts])

    useEffect(() => {
        const onSourceChange = () => {
            setLoading(true)
            loadAlerts()
        }
        window.addEventListener(DATA_SOURCE_CHANGED_EVENT, onSourceChange)
        return () => window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, onSourceChange)
    }, [loadAlerts])

    const activeCount = alerts.filter((a) => a.is_active).length
    const triggeredCount = Object.values(meta).filter((m) => m.triggered).length

    return (
        <div className="min-h-screen bg-background bg-mesh">
            <AppHeader />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Alerts</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {loading
                                ? 'Loading alert rules…'
                                : `${activeCount} active · ${triggeredCount} currently triggered`}
                        </p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary self-start sm:self-auto">
                        <PlusIcon className="h-4 w-4" />
                        New Alert
                    </button>
                </div>

                {loading ? (
                    <div className="grid gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-[88px] rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                                <div className="skeleton h-5 w-1/3" />
                                <div className="skeleton mt-3 h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <AlertList alerts={alerts} meta={meta} onUpdate={loadAlerts} />
                )}
            </main>

            {showCreateModal && (
                <CreateAlertModal onClose={() => setShowCreateModal(false)} onSuccess={loadAlerts} />
            )}
        </div>
    )
}
