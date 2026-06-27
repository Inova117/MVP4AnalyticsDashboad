// Shared building blocks for all data widgets: themed tooltip, axis config,
// aggregation helper, and data-loading hooks. Centralizing these keeps every
// chart visually and behaviorally identical.
'use client'

import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { subDays, differenceInCalendarDays, format } from 'date-fns'
import { dataClient } from '@/lib/supabase'
import { useDateRange } from '@/lib/contexts/date-range-context'
import { formatMetricValue, formatAxisTick, type MetricUnit } from '@/lib/format'
import type { Metric, Widget, Dimension } from '@/types'
import type { Aggregation } from '@/types'

export interface SeriesPoint {
    date: string
    value: number
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------
export function aggregate(values: number[], agg: Aggregation): number {
    if (!values.length) return 0
    switch (agg) {
        case 'sum':
            return values.reduce((s, v) => s + v, 0)
        case 'avg':
            return values.reduce((s, v) => s + v, 0) / values.length
        case 'last':
            return values[values.length - 1]
        case 'max':
            return Math.max(...values)
        case 'min':
            return Math.min(...values)
        default:
            return values.reduce((s, v) => s + v, 0)
    }
}

export function displayMetricValue(value: number, metric: Metric | null): string {
    if (!metric) return formatMetricValue(value)
    return `${metric.prefix ?? ''}${formatMetricValue(value, metric.unit, { decimals: metric.decimals })}${metric.suffix ?? ''}`
}

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

/** Loads a widget's metric + its time series for the active date range. */
export function useMetricSeries(widget: Widget) {
    const { startDate, endDate } = useDateRange()
    const [metric, setMetric] = useState<Metric | null>(null)
    const [data, setData] = useState<SeriesPoint[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [m, raw] = await Promise.all([
                dataClient.getMetric(widget.metric_id),
                dataClient.getMetricData(widget.metric_id, startDate, endDate),
            ])
            setMetric(m)
            setData(
                raw.map((d) => ({
                    date: format(new Date(d.timestamp), 'MMM d'),
                    value: d.value,
                }))
            )
        } catch (err) {
            console.error('Error loading metric series:', err)
            setData([])
        } finally {
            setLoading(false)
        }
    }, [widget.metric_id, startDate, endDate])

    useEffect(() => {
        load()
    }, [load])

    return { metric, data, loading }
}

/** Loads a KPI value with period-over-period trend, aggregation-aware. */
export function useKpi(widget: Widget) {
    const { startDate, endDate } = useDateRange()
    const [metric, setMetric] = useState<Metric | null>(null)
    const [value, setValue] = useState<number | null>(null)
    const [trend, setTrend] = useState<number>(0)
    const [spark, setSpark] = useState<SeriesPoint[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const m = await dataClient.getMetric(widget.metric_id)
            const agg: Aggregation = m?.aggregation ?? 'sum'

            const current = await dataClient.getMetricData(widget.metric_id, startDate, endDate)
            const currentValues = current.map((d) => d.value)
            const currentAgg = aggregate(currentValues, agg)

            const span = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1)
            const prevEnd = subDays(startDate, 1)
            const prevStart = subDays(prevEnd, span - 1)
            const previous = await dataClient.getMetricData(widget.metric_id, prevStart, prevEnd)
            const prevAgg = aggregate(previous.map((d) => d.value), agg)

            const change = prevAgg ? ((currentAgg - prevAgg) / prevAgg) * 100 : 0

            setMetric(m)
            setValue(currentAgg)
            setTrend(change)
            setSpark(current.map((d) => ({ date: d.timestamp, value: d.value })))
        } catch (err) {
            console.error('Error loading KPI:', err)
            setValue(0)
        } finally {
            setLoading(false)
        }
    }, [widget.metric_id, startDate, endDate])

    useEffect(() => {
        load()
    }, [load])

    return { metric, value, trend, spark, loading }
}

/** Loads a categorical dimension for pie / donut widgets. */
export function useDimension(dimensionId?: string) {
    const [dimension, setDimension] = useState<Dimension | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        if (!dimensionId) {
            setLoading(false)
            return
        }
        dataClient
            .getDimension(dimensionId)
            .then((d) => {
                if (active) setDimension(d)
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [dimensionId])

    return { dimension, loading }
}

// ---------------------------------------------------------------------------
// Themed tooltip (recharts custom content)
// ---------------------------------------------------------------------------
interface TooltipProps {
    active?: boolean
    payload?: Array<{ value: number; name?: string; payload?: Record<string, unknown> }>
    label?: string
    unit?: MetricUnit
    decimals?: number
    valueLabel?: string
}

export function ChartTooltip({ active, payload, label, unit = 'number', decimals, valueLabel }: TooltipProps) {
    if (!active || !payload || !payload.length) return null
    const point = payload[0]
    return (
        <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-elevated backdrop-blur-sm">
            {label && <p className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</p>}
            <p className="text-sm font-semibold text-foreground tabular-nums">
                {valueLabel ? <span className="font-normal text-muted-foreground">{valueLabel}: </span> : null}
                {formatMetricValue(point.value, unit, { decimals })}
            </p>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Measured container — passes explicit pixel dimensions to recharts.
// More reliable than ResponsiveContainer across theme toggles / remounts,
// which otherwise mis-measure width and squash cartesian charts to the left.
// ---------------------------------------------------------------------------
export function Measured({ children }: { children: (size: { width: number; height: number }) => ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const update = () => {
            const r = el.getBoundingClientRect()
            setSize({ width: Math.round(r.width), height: Math.round(r.height) })
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <div ref={ref} className="h-full w-full">
            {size.width > 0 && size.height > 0 ? children(size) : null}
        </div>
    )
}

export const axisTick = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }

export function tickFormatter(unit: MetricUnit) {
    return (value: number) => formatAxisTick(value, unit)
}

// ---------------------------------------------------------------------------
// Shared loading / empty states
// ---------------------------------------------------------------------------
export function ChartSkeleton() {
    return (
        <div className="flex h-full min-h-[200px] flex-col justify-end gap-2 p-2">
            <div className="flex flex-1 items-end gap-2">
                {[40, 65, 50, 80, 60, 90, 70, 55].map((h, i) => (
                    <div key={i} className="skeleton flex-1" style={{ height: `${h}%` }} />
                ))}
            </div>
            <div className="skeleton h-3 w-1/3" />
        </div>
    )
}

export function ChartEmpty() {
    return (
        <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available for this period
        </div>
    )
}
