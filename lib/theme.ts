// Single source of truth for data-visualization colors.
// Every chart, legend and color picker pulls from here so the whole product
// stays visually congruent.

/** Ordered categorical palette for multi-series charts (pie / multi-bar). */
export const CHART_PALETTE = [
    '#6366f1', // indigo  (brand)
    '#8b5cf6', // violet  (accent)
    '#0ea5e9', // sky
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#f43f5e', // rose
    '#10b981', // emerald
    '#ec4899', // pink
] as const

/** Brand primary used as the default for single-series charts / KPIs. */
export const BRAND = '#6366f1'

/** Semantic colors (kept in sync with the CSS tokens in globals.css). */
export const SEMANTIC = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#0ea5e9',
} as const

/**
 * Curated accent-color choices offered in the widget color pickers.
 * Drawn from the chart palette so user customizations stay on-brand.
 */
export const ACCENT_CHOICES: { value: string; label: string }[] = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#0ea5e9', label: 'Sky' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#f43f5e', label: 'Rose' },
]

export function chartColor(index: number): string {
    return CHART_PALETTE[index % CHART_PALETTE.length]
}
