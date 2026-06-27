// Area Chart Widget — time-series with gradient fill (great for cumulative
// or "level" metrics like MRR / active users).
'use client'

import type { Widget } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
    useMetricSeries,
    ChartTooltip,
    ChartSkeleton,
    ChartEmpty,
    Measured,
    axisTick,
    tickFormatter,
} from './chart-kit'
import { BRAND } from '@/lib/theme'

export function AreaChartWidget({ widget }: { widget: Widget }) {
    const { metric, data, loading } = useMetricSeries(widget)
    const color = widget.config.color || BRAND
    const unit = metric?.unit ?? 'number'

    if (loading) return <ChartSkeleton />
    if (data.length === 0) return <ChartEmpty />

    const gradientId = `area-${widget.id}`

    return (
        <Measured>
            {({ width, height }) => (
                <AreaChart width={width} height={height} data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
                    <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} dy={8} minTickGap={24} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={tickFormatter(unit)} width={56} />
                    <Tooltip
                        content={<ChartTooltip unit={unit} decimals={metric?.decimals} valueLabel={metric?.name} />}
                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            )}
        </Measured>
    )
}
