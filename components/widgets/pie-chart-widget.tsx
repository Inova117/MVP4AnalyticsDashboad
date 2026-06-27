// Pie / Donut Widget — real categorical breakdown (traffic by source, revenue
// by category, etc.) driven by a dimension. Donut shows the total in the hole.
'use client'

import type { Widget } from '@/types'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { useDimension, ChartSkeleton, ChartEmpty, Measured } from './chart-kit'
import { CHART_PALETTE } from '@/lib/theme'
import { formatMetricValue, type MetricUnit } from '@/lib/format'

interface SliceDatum {
    name: string
    value: number
    pct: number
    color: string
}

function PieTooltip({
    active,
    payload,
    unit,
}: {
    active?: boolean
    payload?: Array<{ payload: SliceDatum }>
    unit: MetricUnit
}) {
    if (!active || !payload || !payload.length) return null
    const d = payload[0].payload
    return (
        <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-elevated backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-medium text-muted-foreground">{d.name}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">
                {formatMetricValue(d.value, unit)} <span className="font-normal text-muted-foreground">· {d.pct}%</span>
            </p>
        </div>
    )
}

export function PieChartWidget({ widget }: { widget: Widget }) {
    const { dimension, loading } = useDimension(widget.dimension_id)
    const isDonut = widget.type === 'donut'

    if (loading) return <ChartSkeleton />
    if (!dimension || dimension.slices.length === 0) return <ChartEmpty />

    const total = dimension.slices.reduce((s, x) => s + x.value, 0)
    const data: SliceDatum[] = dimension.slices.map((s, i) => ({
        name: s.name,
        value: s.value,
        pct: total ? Math.round((s.value / total) * 100) : 0,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    const showLegend = widget.config.showLegend !== false

    return (
        <div className="flex h-full flex-col">
            <div className="relative min-h-0 flex-1">
                <Measured>
                    {({ width, height }) => (
                        <PieChart width={width} height={height}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={isDonut ? '62%' : 0}
                                outerRadius="88%"
                                paddingAngle={isDonut ? 2 : 0}
                                dataKey="value"
                                stroke="hsl(var(--card))"
                                strokeWidth={2}
                                isAnimationActive={false}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip unit={dimension.unit} />} />
                        </PieChart>
                    )}
                </Measured>

                {isDonut && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-foreground tabular-nums">
                            {formatMetricValue(total, dimension.unit, { compact: true })}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
                    </div>
                )}
            </div>

            {showLegend && (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {data.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="truncate text-muted-foreground">{d.name}</span>
                            <span className="ml-auto font-medium text-foreground tabular-nums">{d.pct}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
