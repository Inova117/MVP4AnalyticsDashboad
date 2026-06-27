// Centralized value formatting — keeps every widget, KPI, axis and tooltip
// rendering numbers identically across the app.

export type MetricUnit =
    | 'currency'
    | 'percent'
    | 'number'
    | 'duration'
    | 'rating'

interface FormatOptions {
    /** Force compact notation (e.g. 1.2M) regardless of magnitude. */
    compact?: boolean
    /** Override decimal places. */
    decimals?: number
}

const compactFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
})

/** 1490000 -> "1.5M", 124500 -> "124.5K" */
export function formatCompact(value: number): string {
    return compactFormatter.format(value)
}

/** 8945 -> "8,945" */
export function formatNumber(value: number, decimals = 0): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

/** Seconds -> "3m 12s" (or "45s", "1h 04m"). */
export function formatDuration(seconds: number): string {
    const s = Math.max(0, Math.round(seconds))
    if (s < 60) return `${s}s`
    const m = Math.floor(s / 60)
    const rem = s % 60
    if (m < 60) return `${m}m ${rem.toString().padStart(2, '0')}s`
    const h = Math.floor(m / 60)
    return `${h}h ${(m % 60).toString().padStart(2, '0')}m`
}

/**
 * Format a metric value according to its unit. The single entry point used by
 * KPI cards, chart axes and tooltips.
 */
export function formatMetricValue(
    value: number,
    unit: MetricUnit = 'number',
    options: FormatOptions = {}
): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—'

    const { compact, decimals } = options

    switch (unit) {
        case 'currency': {
            const useCompact = compact ?? Math.abs(value) >= 100_000
            if (useCompact) return `$${formatCompact(value)}`
            return value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: decimals ?? 0,
                maximumFractionDigits: decimals ?? 0,
            })
        }
        case 'percent':
            return `${formatNumber(value, decimals ?? (Math.abs(value) < 10 ? 1 : 0))}%`
        case 'duration':
            return formatDuration(value)
        case 'rating':
            return formatNumber(value, decimals ?? 1)
        case 'number':
        default: {
            const useCompact = compact ?? Math.abs(value) >= 100_000
            if (useCompact) return formatCompact(value)
            return formatNumber(value, decimals ?? 0)
        }
    }
}

/** Compact axis tick formatter (always compact above 1k). */
export function formatAxisTick(value: number, unit: MetricUnit = 'number'): string {
    if (unit === 'percent') return `${formatNumber(value, 0)}%`
    if (unit === 'duration') return formatDuration(value)
    const compact = Math.abs(value) >= 1000
    if (unit === 'currency') return compact ? `$${formatCompact(value)}` : `$${formatNumber(value)}`
    return compact ? formatCompact(value) : formatNumber(value)
}

/** Signed percentage for trend pills: 8.4 -> "+8.4%". */
export function formatTrend(pct: number): string {
    const sign = pct > 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}%`
}
