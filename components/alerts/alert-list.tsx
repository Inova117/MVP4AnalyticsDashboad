'use client'

import { useState } from 'react'
import { BellIcon, BellOffIcon, Trash2Icon, AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react'
import type { Alert } from '@/types'
import { dataClient } from '@/lib/supabase'

export interface AlertMeta {
    metricName: string
    valueLabel: string
    thresholdLabel: string
    triggered: boolean
}

interface AlertListProps {
    alerts: Alert[]
    meta: Record<string, AlertMeta>
    onUpdate: () => void
}

const CONDITION_LABEL: Record<Alert['condition'], string> = {
    gt: 'above',
    lt: 'below',
    eq: 'equals',
    pct_change: 'changes by',
}

export function AlertList({ alerts, meta, onUpdate }: AlertListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleToggle = async (alert: Alert) => {
        setLoadingId(alert.id)
        try {
            await dataClient.updateAlert(alert.id, { is_active: !alert.is_active })
            onUpdate()
        } catch (e) {
            console.error('Failed to toggle alert:', e)
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (alertId: string) => {
        if (!confirm('Delete this alert?')) return
        setLoadingId(alertId)
        try {
            await dataClient.deleteAlert(alertId)
            onUpdate()
        } catch (e) {
            console.error('Failed to delete alert:', e)
        } finally {
            setLoadingId(null)
        }
    }

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BellOffIcon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">No alerts configured</h3>
                <p className="mt-1 text-sm text-muted-foreground">Create an alert to get notified when metrics cross a threshold.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-3">
            {alerts.map((alert) => {
                const m = meta[alert.id]
                const paused = !alert.is_active
                const triggered = m?.triggered

                const status = paused
                    ? { label: 'Paused', cls: 'bg-muted text-muted-foreground', Icon: BellOffIcon }
                    : triggered
                        ? { label: 'Triggered', cls: 'bg-danger/10 text-danger', Icon: AlertTriangleIcon }
                        : { label: 'OK', cls: 'bg-success/10 text-success', Icon: CheckCircle2Icon }

                return (
                    <div
                        key={alert.id}
                        className={`group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:shadow-elevated ${triggered && !paused ? 'border-danger/40' : 'border-border/70'} ${paused ? 'opacity-70' : ''}`}
                    >
                        {triggered && !paused && <div className="absolute inset-y-0 left-0 w-1 bg-danger" />}

                        <div className="flex items-center justify-between gap-4 p-5">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.cls}`}>
                                    <status.Icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-foreground">{alert.name}</h3>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{m?.metricName}</span>{' '}
                                        {CONDITION_LABEL[alert.condition]}{' '}
                                        <span className="font-medium text-foreground">{m?.thresholdLabel}</span>
                                        {m?.valueLabel && (
                                            <>
                                                {' · now '}
                                                <span className={`font-semibold ${triggered && !paused ? 'text-danger' : 'text-foreground'}`}>
                                                    {m.valueLabel}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                <button
                                    onClick={() => handleToggle(alert)}
                                    disabled={loadingId === alert.id}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                                    title={alert.is_active ? 'Pause' : 'Resume'}
                                >
                                    {alert.is_active ? <BellIcon className="h-5 w-5" /> : <BellOffIcon className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(alert.id)}
                                    disabled={loadingId === alert.id}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus-ring"
                                    title="Delete"
                                >
                                    <Trash2Icon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
