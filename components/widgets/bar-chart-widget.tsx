// Bar Chart Widget — time-series, auto-bucketed into weeks when the range is
// long so bars stay readable instead of becoming 30 thin slivers.
'use client'

import { useMemo } from 'react'
import type { Widget } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
    useMetricSeries,
    ChartTooltip,
    ChartSkeleton,
    ChartEmpty,
    Measured,
    axisTick,
    tickFormatter,
    type SeriesPoint,
} from './chart-kit'
import { CHART_PALETTE } from '@/lib/theme'

// Bucket into 7-day groups anchored to the END so the most recent week is
// always complete (any partial week lands on the older left edge).
function bucketWeekly(data: SeriesPoint[]): SeriesPoint[] {
    if (data.length <= 16) return data
    const buckets: SeriesPoint[] = []
    for (let end = data.length; end > 0; end -= 7) {
        const start = Math.max(0, end - 7)
        const chunk = data.slice(start, end)
        buckets.unshift({
            date: chunk[0].date,
            value: chunk.reduce((s, d) => s + d.value, 0),
        })
    }
    return buckets
}

export function BarChartWidget({ widget }: { widget: Widget }) {
    const { metric, data, loading } = useMetricSeries(widget)
    const color = widget.config.color || CHART_PALETTE[1]
    const unit = metric?.unit ?? 'number'

    const bars = useMemo(() => bucketWeekly(data), [data])

    if (loading) return <ChartSkeleton />
    if (data.length === 0) return <ChartEmpty />

    return (
        <Measured>
            {({ width, height }) => (
                <BarChart width={width} height={height} data={bars} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
                    <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} dy={8} minTickGap={12} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={tickFormatter(unit)} width={56} />
                    <Tooltip
                        content={<ChartTooltip unit={unit} decimals={metric?.decimals} valueLabel={metric?.name} />}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    />
                    <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false} />
                </BarChart>
            )}
        </Measured>
    )
}
