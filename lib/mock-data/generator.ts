// Deterministic time-series generator.
//
// Values are derived from a seeded PRNG keyed by the metric id, so the same
// metric always produces the same series across re-renders, SSR/CSR and page
// reloads. This removes the "numbers jump every refresh" tell of template demos
// while still looking organic (trend + weekly seasonality + bounded noise).

import type { MetricData } from '@/types'

export type Seasonality = 'none' | 'weekend-low' | 'weekend-high'

export interface SeriesSpec {
    /** Baseline level (for rate/level metrics) or daily amount (for sums). */
    base: number
    /** Noise amplitude as a fraction of base, e.g. 0.12 = ±12%. */
    variance: number
    /** Cumulative daily drift as a fraction, e.g. 0.012 = +1.2%/day. */
    trend: number
    seasonality?: Seasonality
    /** Decimal places to preserve (rates/ratings). Defaults to integer. */
    decimals?: number
    /** Optional hard floor (e.g. percentages should not go negative). */
    min?: number
    /** Optional hard ceiling (e.g. a rate capped at 100). */
    max?: number
}

function hashString(input: string): number {
    let h = 2166136261
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

function mulberry32(seed: number): () => number {
    let a = seed
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function round(value: number, decimals = 0): number {
    const f = 10 ** decimals
    return Math.round(value * f) / f
}

/**
 * Generate `days` of daily data ending today (noon), deterministic per metricId.
 */
export function generateSeries(
    metricId: string,
    spec: SeriesSpec,
    days = 120
): MetricData[] {
    const rng = mulberry32(hashString(metricId))
    const data: MetricData[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(12, 0, 0, 0)

        const elapsed = days - 1 - i
        const trendFactor = 1 + spec.trend * elapsed

        const day = date.getDay()
        const isWeekend = day === 0 || day === 6
        let seasonFactor = 1
        if (spec.seasonality === 'weekend-low' && isWeekend) seasonFactor = 0.68
        if (spec.seasonality === 'weekend-high' && isWeekend) seasonFactor = 1.32

        const noiseFactor = 1 + (rng() * 2 - 1) * spec.variance

        let value = spec.base * trendFactor * seasonFactor * noiseFactor

        if (spec.min !== undefined) value = Math.max(spec.min, value)
        if (spec.max !== undefined) value = Math.min(spec.max, value)
        if (spec.min === undefined) value = Math.max(0, value)

        data.push({
            id: `data-${metricId}-${i}`,
            metric_id: metricId,
            value: round(value, spec.decimals ?? 0),
            timestamp: date.toISOString(),
        })
    }

    return data
}
