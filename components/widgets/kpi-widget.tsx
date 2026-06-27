// KPI Widget — single metric value with aggregation-aware trend + sparkline.
'use client'

import type { Widget } from '@/types'
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react'
import { Area, AreaChart } from 'recharts'
import { useKpi, displayMetricValue, Measured } from './chart-kit'
import { BRAND } from '@/lib/theme'
import { formatTrend } from '@/lib/format'

interface KpiWidgetProps {
    widget: Widget
}

export function KpiWidget({ widget }: KpiWidgetProps) {
    const { metric, value, trend, spark, loading } = useKpi(widget)
    const color = widget.config.color || BRAND

    if (loading) {
        return (
            <div className="flex h-full min-h-[120px] flex-col justify-between gap-3">
                <div className="skeleton h-10 w-2/3" />
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-8 w-full" />
            </div>
        )
    }

    // Lower-is-better metrics (churn, bounce, abandonment, CPC) invert trend color
    const lowerIsBetter = /churn|bounce|abandon|cost|cpc|cpa|response time|unsubscrib/i.test(metric?.name ?? '')
    const positive = lowerIsBetter ? trend < 0 : trend > 0
    const flat = Math.abs(trend) < 0.05

    const trendClasses = flat
        ? 'bg-muted text-muted-foreground'
        : positive
            ? 'bg-success/10 text-success'
            : 'bg-danger/10 text-danger'

    return (
        <div className="flex h-full flex-col justify-between animate-fade-in">
            <div>
                <div
                    className="font-display text-[2.5rem] leading-none font-bold tracking-tight tabular-nums"
                    style={{ color }}
                >
                    {value !== null ? displayMetricValue(value, metric) : '—'}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendClasses}`}>
                        {flat ? (
                            <MinusIcon className="h-3 w-3" />
                        ) : trend > 0 ? (
                            <TrendingUpIcon className="h-3 w-3" />
                        ) : (
                            <TrendingDownIcon className="h-3 w-3" />
                        )}
                        {formatTrend(trend)}
                    </span>
                    <span className="text-xs text-muted-foreground">vs prev. period</span>
                </div>
            </div>

            {/* Sparkline */}
            {spark.length > 1 && (
                <div className="-mx-1 mt-3 h-10 opacity-90">
                    <Measured>
                        {({ width, height }) => (
                            <AreaChart width={width} height={height} data={spark} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={`spark-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={`url(#spark-${widget.id})`}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        )}
                    </Measured>
                </div>
            )}
        </div>
    )
}
