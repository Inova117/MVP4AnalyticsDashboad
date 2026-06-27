// Source catalog — the heart of the product.
//
// Each data source is a self-contained workspace: its own metrics (with units &
// aggregation), categorical dimensions, and a curated default dashboard. The
// active source drives EVERYTHING the user sees, so switching sources changes
// the entire dashboard — not just a side panel.

import type { Aggregation, WidgetType } from '@/types'
import type { MetricUnit } from '@/lib/format'
import type { Seasonality } from './generator'
import { CHART_PALETTE } from '@/lib/theme'

export type DataSourceType =
    | 'google-analytics'
    | 'meta-ads'
    | 'internal-saas'
    | 'ecommerce'

export interface MetricDef {
    id: string
    name: string
    unit: MetricUnit
    aggregation: Aggregation
    base: number
    variance: number
    trend: number
    seasonality?: Seasonality
    decimals?: number
    suffix?: string
    prefix?: string
    min?: number
    max?: number
    description?: string
    target?: number
}

export interface DimensionDef {
    id: string
    name: string
    unit: MetricUnit
    slices: { name: string; value: number }[]
}

export interface WidgetSeed {
    id: string
    type: WidgetType
    title: string
    metricId?: string
    dimensionId?: string
    width: number
    height: number
    color?: string
    showLegend?: boolean
}

export interface SourceDef {
    id: DataSourceType
    name: string
    iconKey: 'line-chart' | 'megaphone' | 'database' | 'shopping-cart'
    tint: string
    description: string
    category: 'marketing' | 'business' | 'ecommerce'
    status: 'connected' | 'demo'
    dashboardName: string
    metrics: MetricDef[]
    dimensions: DimensionDef[]
    widgets: WidgetSeed[]
}

const [C0, C1, C2, C3, C4, C5] = CHART_PALETTE

// ============================================================================
// 1. Google Analytics 4
// ============================================================================
const googleAnalytics: SourceDef = {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    iconKey: 'line-chart',
    tint: '#0ea5e9',
    description: 'Web traffic, user behavior & conversions',
    category: 'marketing',
    status: 'connected',
    dashboardName: 'Web Analytics',
    metrics: [
        { id: 'ga-sessions', name: 'Sessions', unit: 'number', aggregation: 'sum', base: 1650, variance: 0.15, trend: 0.006, seasonality: 'weekend-low' },
        { id: 'ga-active-users', name: 'Active Users', unit: 'number', aggregation: 'avg', base: 1320, variance: 0.14, trend: 0.005, seasonality: 'weekend-low' },
        { id: 'ga-new-users', name: 'New Users', unit: 'number', aggregation: 'sum', base: 740, variance: 0.18, trend: 0.006, seasonality: 'weekend-low' },
        { id: 'ga-pageviews', name: 'Page Views', unit: 'number', aggregation: 'sum', base: 4800, variance: 0.2, trend: 0.006, seasonality: 'weekend-low' },
        { id: 'ga-conversion-rate', name: 'Conversion Rate', unit: 'percent', aggregation: 'avg', base: 3.4, variance: 0.15, trend: 0.003, decimals: 1, target: 2.5 },
        { id: 'ga-bounce-rate', name: 'Bounce Rate', unit: 'percent', aggregation: 'avg', base: 46, variance: 0.08, trend: -0.0008, decimals: 1, max: 100 },
        { id: 'ga-avg-session', name: 'Avg. Session Duration', unit: 'duration', aggregation: 'avg', base: 198, variance: 0.12, trend: 0.002 },
    ],
    dimensions: [
        {
            id: 'ga-traffic-source', name: 'Traffic by Source', unit: 'number', slices: [
                { name: 'Organic Search', value: 12450 },
                { name: 'Direct', value: 7820 },
                { name: 'Social', value: 5340 },
                { name: 'Referral', value: 3120 },
                { name: 'Email', value: 890 },
            ],
        },
        {
            id: 'ga-device', name: 'Users by Device', unit: 'number', slices: [
                { name: 'Desktop', value: 16789 },
                { name: 'Mobile', value: 10234 },
                { name: 'Tablet', value: 2592 },
            ],
        },
    ],
    widgets: [
        { id: 'w-ga-1', type: 'kpi', title: 'Sessions', metricId: 'ga-sessions', width: 3, height: 2, color: C0 },
        { id: 'w-ga-2', type: 'kpi', title: 'Active Users', metricId: 'ga-active-users', width: 3, height: 2, color: C1 },
        { id: 'w-ga-3', type: 'kpi', title: 'Conversion Rate', metricId: 'ga-conversion-rate', width: 3, height: 2, color: C3 },
        { id: 'w-ga-4', type: 'kpi', title: 'Avg. Session', metricId: 'ga-avg-session', width: 3, height: 2, color: C4 },
        { id: 'w-ga-5', type: 'line', title: 'Sessions Trend', metricId: 'ga-sessions', width: 8, height: 4, color: C0 },
        { id: 'w-ga-6', type: 'donut', title: 'Traffic by Source', dimensionId: 'ga-traffic-source', width: 4, height: 4, showLegend: true },
        { id: 'w-ga-7', type: 'area', title: 'Active Users', metricId: 'ga-active-users', width: 6, height: 4, color: C1 },
        { id: 'w-ga-8', type: 'bar', title: 'Page Views', metricId: 'ga-pageviews', width: 6, height: 4, color: C3 },
    ],
}

// ============================================================================
// 2. Meta Ads (Facebook / Instagram)
// ============================================================================
const metaAds: SourceDef = {
    id: 'meta-ads',
    name: 'Meta Ads',
    iconKey: 'megaphone',
    tint: '#6366f1',
    description: 'Facebook & Instagram advertising performance',
    category: 'marketing',
    status: 'connected',
    dashboardName: 'Paid Social Performance',
    metrics: [
        { id: 'meta-spend', name: 'Ad Spend', unit: 'currency', aggregation: 'sum', base: 920, variance: 0.12, trend: 0.004 },
        { id: 'meta-revenue', name: 'Attributed Revenue', unit: 'currency', aggregation: 'sum', base: 4420, variance: 0.16, trend: 0.005 },
        { id: 'meta-roas', name: 'ROAS', unit: 'rating', aggregation: 'avg', base: 4.8, variance: 0.1, trend: 0.002, decimals: 1, suffix: 'x', target: 4 },
        { id: 'meta-impressions', name: 'Impressions', unit: 'number', aggregation: 'sum', base: 145000, variance: 0.2, trend: 0.006 },
        { id: 'meta-clicks', name: 'Clicks', unit: 'number', aggregation: 'sum', base: 4850, variance: 0.15, trend: 0.006 },
        { id: 'meta-ctr', name: 'CTR', unit: 'percent', aggregation: 'avg', base: 3.35, variance: 0.12, trend: 0.001, decimals: 2 },
        { id: 'meta-cpc', name: 'Cost per Click', unit: 'currency', aggregation: 'avg', base: 1.85, variance: 0.1, trend: 0.0015, decimals: 2 },
        { id: 'meta-conversions', name: 'Conversions', unit: 'number', aggregation: 'sum', base: 168, variance: 0.18, trend: 0.006 },
    ],
    dimensions: [
        {
            id: 'meta-spend-campaign', name: 'Spend by Campaign', unit: 'currency', slices: [
                { name: 'Retargeting — Cart', value: 8200 },
                { name: 'Prospecting — Lookalike', value: 6400 },
                { name: 'Catalog Sales', value: 5300 },
                { name: 'Brand Awareness', value: 4100 },
                { name: 'Lead Generation', value: 3000 },
            ],
        },
        {
            id: 'meta-conv-age', name: 'Conversions by Age', unit: 'number', slices: [
                { name: '18–24', value: 320 },
                { name: '25–34', value: 870 },
                { name: '35–44', value: 590 },
                { name: '45–54', value: 320 },
                { name: '55+', value: 180 },
            ],
        },
    ],
    widgets: [
        { id: 'w-meta-1', type: 'kpi', title: 'Ad Spend', metricId: 'meta-spend', width: 3, height: 2, color: C0 },
        { id: 'w-meta-2', type: 'kpi', title: 'ROAS', metricId: 'meta-roas', width: 3, height: 2, color: C1 },
        { id: 'w-meta-3', type: 'kpi', title: 'Clicks', metricId: 'meta-clicks', width: 3, height: 2, color: C2 },
        { id: 'w-meta-4', type: 'kpi', title: 'CTR', metricId: 'meta-ctr', width: 3, height: 2, color: C4 },
        { id: 'w-meta-5', type: 'line', title: 'Ad Spend Trend', metricId: 'meta-spend', width: 8, height: 4, color: C0 },
        { id: 'w-meta-6', type: 'donut', title: 'Spend by Campaign', dimensionId: 'meta-spend-campaign', width: 4, height: 4, showLegend: true },
        { id: 'w-meta-7', type: 'bar', title: 'Clicks', metricId: 'meta-clicks', width: 6, height: 4, color: C1 },
        { id: 'w-meta-8', type: 'donut', title: 'Conversions by Age', dimensionId: 'meta-conv-age', width: 6, height: 4, showLegend: true },
    ],
}

// ============================================================================
// 3. Internal SaaS Database
// ============================================================================
const internalSaas: SourceDef = {
    id: 'internal-saas',
    name: 'Internal Database',
    iconKey: 'database',
    tint: '#8b5cf6',
    description: 'SaaS metrics, subscriptions & engagement',
    category: 'business',
    status: 'connected',
    dashboardName: 'SaaS Metrics',
    metrics: [
        { id: 'saas-mrr', name: 'MRR', unit: 'currency', aggregation: 'last', base: 124500, variance: 0.02, trend: 0.0018 },
        { id: 'saas-arr', name: 'ARR', unit: 'currency', aggregation: 'last', base: 1494000, variance: 0.015, trend: 0.0018 },
        { id: 'saas-active-users', name: 'Active Users', unit: 'number', aggregation: 'avg', base: 8450, variance: 0.1, trend: 0.003, seasonality: 'weekend-low' },
        { id: 'saas-new-customers', name: 'New Customers', unit: 'number', aggregation: 'sum', base: 42, variance: 0.25, trend: 0.004 },
        { id: 'saas-churn', name: 'Churn Rate', unit: 'percent', aggregation: 'avg', base: 3.1, variance: 0.12, trend: -0.001, decimals: 1, min: 0, target: 2 },
        { id: 'saas-nps', name: 'NPS', unit: 'number', aggregation: 'last', base: 56, variance: 0.05, trend: 0.001, target: 50 },
        { id: 'saas-trials', name: 'Trial Signups', unit: 'number', aggregation: 'sum', base: 68, variance: 0.2, trend: 0.005, seasonality: 'weekend-low' },
        { id: 'saas-expansion', name: 'Expansion Revenue', unit: 'currency', aggregation: 'sum', base: 1850, variance: 0.2, trend: 0.005 },
    ],
    dimensions: [
        {
            id: 'saas-mrr-plan', name: 'MRR by Plan', unit: 'currency', slices: [
                { name: 'Professional', value: 56200 },
                { name: 'Business', value: 38400 },
                { name: 'Enterprise', value: 31200 },
                { name: 'Starter', value: 18500 },
            ],
        },
        {
            id: 'saas-segment', name: 'Customers by Segment', unit: 'number', slices: [
                { name: 'SMB', value: 2140 },
                { name: 'Mid-Market', value: 1180 },
                { name: 'Enterprise', value: 525 },
            ],
        },
    ],
    widgets: [
        { id: 'w-saas-1', type: 'kpi', title: 'MRR', metricId: 'saas-mrr', width: 3, height: 2, color: C1 },
        { id: 'w-saas-2', type: 'kpi', title: 'Active Users', metricId: 'saas-active-users', width: 3, height: 2, color: C0 },
        { id: 'w-saas-3', type: 'kpi', title: 'Churn Rate', metricId: 'saas-churn', width: 3, height: 2, color: C5 },
        { id: 'w-saas-4', type: 'kpi', title: 'NPS', metricId: 'saas-nps', width: 3, height: 2, color: C3 },
        { id: 'w-saas-5', type: 'area', title: 'MRR Growth', metricId: 'saas-mrr', width: 8, height: 4, color: C1 },
        { id: 'w-saas-6', type: 'donut', title: 'MRR by Plan', dimensionId: 'saas-mrr-plan', width: 4, height: 4, showLegend: true },
        { id: 'w-saas-7', type: 'bar', title: 'New Customers', metricId: 'saas-new-customers', width: 6, height: 4, color: C3 },
        { id: 'w-saas-8', type: 'donut', title: 'Customers by Segment', dimensionId: 'saas-segment', width: 6, height: 4, showLegend: true },
    ],
}

// ============================================================================
// 4. E-commerce Platform
// ============================================================================
const ecommerce: SourceDef = {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    iconKey: 'shopping-cart',
    tint: '#10b981',
    description: 'Online store sales, products & customers',
    category: 'ecommerce',
    status: 'connected',
    dashboardName: 'Store Performance',
    metrics: [
        { id: 'ecom-revenue', name: 'Revenue', unit: 'currency', aggregation: 'sum', base: 6500, variance: 0.18, trend: 0.006, seasonality: 'weekend-high' },
        { id: 'ecom-orders', name: 'Orders', unit: 'number', aggregation: 'sum', base: 287, variance: 0.2, trend: 0.006, seasonality: 'weekend-high' },
        { id: 'ecom-aov', name: 'Avg. Order Value', unit: 'currency', aggregation: 'avg', base: 87.4, variance: 0.08, trend: 0.002, decimals: 2 },
        { id: 'ecom-conversion', name: 'Conversion Rate', unit: 'percent', aggregation: 'avg', base: 3.5, variance: 0.15, trend: 0.003, decimals: 1 },
        { id: 'ecom-cart-abandon', name: 'Cart Abandonment', unit: 'percent', aggregation: 'avg', base: 68, variance: 0.06, trend: -0.0006, decimals: 0, max: 100 },
        { id: 'ecom-items-sold', name: 'Items Sold', unit: 'number', aggregation: 'sum', base: 548, variance: 0.2, trend: 0.006, seasonality: 'weekend-high' },
        { id: 'ecom-new-customers', name: 'New Customers', unit: 'number', aggregation: 'sum', base: 96, variance: 0.22, trend: 0.005, seasonality: 'weekend-high' },
    ],
    dimensions: [
        {
            id: 'ecom-revenue-category', name: 'Revenue by Category', unit: 'currency', slices: [
                { name: 'Electronics', value: 42000 },
                { name: 'Apparel', value: 31000 },
                { name: 'Home & Garden', value: 24500 },
                { name: 'Beauty', value: 18200 },
                { name: 'Sports', value: 14300 },
            ],
        },
        {
            id: 'ecom-channel', name: 'Sales by Channel', unit: 'currency', slices: [
                { name: 'Online Store', value: 71000 },
                { name: 'Amazon', value: 29000 },
                { name: 'Instagram Shop', value: 14500 },
                { name: 'Wholesale', value: 8200 },
            ],
        },
    ],
    widgets: [
        { id: 'w-ecom-1', type: 'kpi', title: 'Revenue', metricId: 'ecom-revenue', width: 3, height: 2, color: C0 },
        { id: 'w-ecom-2', type: 'kpi', title: 'Orders', metricId: 'ecom-orders', width: 3, height: 2, color: C1 },
        { id: 'w-ecom-3', type: 'kpi', title: 'Avg. Order Value', metricId: 'ecom-aov', width: 3, height: 2, color: C3 },
        { id: 'w-ecom-4', type: 'kpi', title: 'Conversion Rate', metricId: 'ecom-conversion', width: 3, height: 2, color: C4 },
        { id: 'w-ecom-5', type: 'line', title: 'Revenue Trend', metricId: 'ecom-revenue', width: 8, height: 4, color: C0 },
        { id: 'w-ecom-6', type: 'donut', title: 'Revenue by Category', dimensionId: 'ecom-revenue-category', width: 4, height: 4, showLegend: true },
        { id: 'w-ecom-7', type: 'bar', title: 'Orders', metricId: 'ecom-orders', width: 6, height: 4, color: C1 },
        { id: 'w-ecom-8', type: 'donut', title: 'Sales by Channel', dimensionId: 'ecom-channel', width: 6, height: 4, showLegend: true },
    ],
}

export const SOURCES: Record<DataSourceType, SourceDef> = {
    'google-analytics': googleAnalytics,
    'meta-ads': metaAds,
    'internal-saas': internalSaas,
    'ecommerce': ecommerce,
}

export const SOURCE_LIST: SourceDef[] = Object.values(SOURCES)

export const DEFAULT_SOURCE: DataSourceType = 'google-analytics'

export function getSourceDef(id: DataSourceType): SourceDef {
    return SOURCES[id] ?? SOURCES[DEFAULT_SOURCE]
}
