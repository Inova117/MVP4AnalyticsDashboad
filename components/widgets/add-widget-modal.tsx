// Add Widget Modal — two-step: pick visualization, then bind data + style.
'use client'

import { useState } from 'react'
import { dataClient } from '@/lib/supabase'
import type { Metric, Dimension, WidgetType } from '@/types'
import {
    XIcon,
    GaugeIcon,
    LineChartIcon,
    AreaChartIcon,
    BarChart3Icon,
    PieChartIcon,
    CircleDashedIcon,
    ArrowLeftIcon,
} from 'lucide-react'
import { ACCENT_CHOICES } from '@/lib/theme'

interface AddWidgetModalProps {
    dashboardId: string
    onClose: () => void
    onSuccess: () => void
}

const WIDGET_TYPES: {
    value: WidgetType
    label: string
    description: string
    Icon: typeof GaugeIcon
    categorical: boolean
}[] = [
        { value: 'kpi', label: 'KPI Card', description: 'A single headline metric with trend', Icon: GaugeIcon, categorical: false },
        { value: 'line', label: 'Line Chart', description: 'Time-series trend over the period', Icon: LineChartIcon, categorical: false },
        { value: 'area', label: 'Area Chart', description: 'Trend with emphasis on volume', Icon: AreaChartIcon, categorical: false },
        { value: 'bar', label: 'Bar Chart', description: 'Period-over-period comparison', Icon: BarChart3Icon, categorical: false },
        { value: 'donut', label: 'Donut Chart', description: 'Categorical breakdown with total', Icon: CircleDashedIcon, categorical: true },
        { value: 'pie', label: 'Pie Chart', description: 'Proportional share by category', Icon: PieChartIcon, categorical: true },
    ]

const DEFAULT_SIZE: Record<WidgetType, { width: number; height: number }> = {
    kpi: { width: 3, height: 2 },
    line: { width: 6, height: 4 },
    area: { width: 6, height: 4 },
    bar: { width: 6, height: 4 },
    pie: { width: 4, height: 4 },
    donut: { width: 4, height: 4 },
}

export function AddWidgetModal({ dashboardId, onClose, onSuccess }: AddWidgetModalProps) {
    const [step, setStep] = useState<'type' | 'config'>('type')
    const [selectedType, setSelectedType] = useState<WidgetType>('kpi')
    const [title, setTitle] = useState('')
    const [metricId, setMetricId] = useState('')
    const [dimensionId, setDimensionId] = useState('')
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [dimensions, setDimensions] = useState<Dimension[]>([])
    const [color, setColor] = useState(ACCENT_CHOICES[0].value)
    const [loading, setLoading] = useState(false)

    const isCategorical = WIDGET_TYPES.find((t) => t.value === selectedType)?.categorical ?? false

    const handleTypeSelect = async (type: WidgetType) => {
        setSelectedType(type)
        setStep('config')
        const categorical = WIDGET_TYPES.find((t) => t.value === type)?.categorical
        if (categorical) {
            const dims = await dataClient.getDimensions()
            setDimensions(dims)
            if (dims.length) {
                setDimensionId(dims[0].id)
                if (!title) setTitle(dims[0].name)
            }
        } else {
            const ms = await dataClient.getMetrics()
            setMetrics(ms)
            if (ms.length) {
                setMetricId(ms[0].id)
                if (!title) setTitle(ms[0].name)
            }
        }
    }

    const canCreate = title.trim() && (isCategorical ? dimensionId : metricId)

    const handleCreate = async () => {
        if (!canCreate) return
        setLoading(true)
        try {
            await dataClient.createWidget({
                dashboard_id: dashboardId,
                type: selectedType,
                title: title.trim(),
                metric_id: isCategorical ? '' : metricId,
                dimension_id: isCategorical ? dimensionId : undefined,
                config: {
                    color: isCategorical ? undefined : color,
                    showLegend: isCategorical ? true : undefined,
                },
                ...DEFAULT_SIZE[selectedType],
            })
            onSuccess()
            onClose()
        } catch (err) {
            console.error('Error creating widget:', err)
        } finally {
            setLoading(false)
        }
    }

    const selectedMeta = WIDGET_TYPES.find((t) => t.value === selectedType)

    return (
        <>
            <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Add Widget</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {step === 'type' ? 'Choose a visualization' : 'Connect data and style it'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                            aria-label="Close"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="custom-scrollbar overflow-y-auto p-6">
                        {step === 'type' ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {WIDGET_TYPES.map(({ value, label, description, Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleTypeSelect(value)}
                                        className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 focus-ring"
                                    >
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-foreground">{label}</span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <button
                                    onClick={() => setStep('type')}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" /> Back
                                </button>

                                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                                    {selectedMeta && (
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <selectedMeta.Icon className="h-5 w-5" />
                                        </span>
                                    )}
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Selected
                                        </div>
                                        <div className="text-sm font-medium text-foreground">{selectedMeta?.label}</div>
                                    </div>
                                </div>

                                <Field label="Widget Title">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Monthly Revenue"
                                        autoFocus
                                        className="input"
                                    />
                                </Field>

                                {isCategorical ? (
                                    <Field label="Dimension">
                                        <select value={dimensionId} onChange={(e) => setDimensionId(e.target.value)} className="input">
                                            {dimensions.map((d) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                ) : (
                                    <Field label="Metric">
                                        <select value={metricId} onChange={(e) => setMetricId(e.target.value)} className="input">
                                            {metrics.map((m) => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                )}

                                {!isCategorical && (
                                    <Field label="Accent Color">
                                        <div className="flex gap-2.5">
                                            {ACCENT_CHOICES.map((c) => (
                                                <button
                                                    key={c.value}
                                                    onClick={() => setColor(c.value)}
                                                    title={c.label}
                                                    aria-label={c.label}
                                                    className={`h-8 w-8 rounded-full transition-all ${color === c.value ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card' : 'opacity-70 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c.value }}
                                                />
                                            ))}
                                        </div>
                                    </Field>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {step === 'config' && (
                        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                            <button onClick={onClose} className="btn-ghost">Cancel</button>
                            <button onClick={handleCreate} disabled={!canCreate || loading} className="btn-primary">
                                {loading ? 'Creating…' : 'Create Widget'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground/80">{label}</span>
            {children}
        </label>
    )
}
