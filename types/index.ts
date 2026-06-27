// TypeScript types for the Analytics Dashboard
import type { MetricUnit } from '@/lib/format'

export type WidgetType = 'kpi' | 'line' | 'area' | 'bar' | 'pie' | 'donut'
export type Aggregation = 'sum' | 'avg' | 'last' | 'max' | 'min'

export interface Dashboard {
    id: string
    user_id: string
    name: string
    source: string
    layout?: GridLayout[]
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface Widget {
    id: string
    dashboard_id: string
    type: WidgetType
    title: string
    /** Time-series metric this widget visualizes (kpi / line / area / bar). */
    metric_id: string
    /** Categorical dimension for pie / donut / categorical-bar widgets. */
    dimension_id?: string
    config: WidgetConfig
    position_x: number
    position_y: number
    /** Sort index used to persist drag-and-drop ordering. */
    order: number
    width: number
    height: number
    created_at: string
}

export interface WidgetConfig {
    color?: string
    prefix?: string
    suffix?: string
    showLegend?: boolean
    stacked?: boolean
}

export interface GridLayout {
    i: string
    x: number
    y: number
    w: number
    h: number
}

export interface Metric {
    id: string
    user_id: string
    name: string
    source: string
    unit: MetricUnit
    aggregation: Aggregation
    /** Display precision for KPI values / axes. */
    decimals?: number
    /** Optional fixed prefix/suffix appended after unit formatting (e.g. "x"). */
    prefix?: string
    suffix?: string
    /** Optional benchmark / goal for the metric. */
    target?: number
    description?: string
    created_at: string
}

export interface MetricData {
    id: string
    metric_id: string
    value: number
    timestamp: string
}

/** A categorical breakdown (e.g. traffic by source, revenue by category). */
export interface Dimension {
    id: string
    source: string
    name: string
    unit: MetricUnit
    slices: DimensionSlice[]
}

export interface DimensionSlice {
    name: string
    value: number
}

export interface Alert {
    id: string
    user_id: string
    metric_id: string
    name: string
    condition: 'gt' | 'lt' | 'eq' | 'pct_change'
    threshold: number
    is_active: boolean
    notification_email: string
    last_triggered?: string
    created_at: string
}

export interface User {
    id: string
    email: string
    full_name: string
    company_name?: string
    avatar_url?: string
}

// Data Client Interface (implemented by both mock and Supabase)
export interface DataClient {
    // Dashboards
    getDashboards(): Promise<Dashboard[]>
    getDashboard(id: string): Promise<Dashboard | null>
    createDashboard(data: Partial<Dashboard>): Promise<Dashboard>
    updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard>
    deleteDashboard(id: string): Promise<void>

    // Widgets
    getWidgets(dashboardId: string): Promise<Widget[]>
    createWidget(data: Partial<Widget>): Promise<Widget>
    updateWidget(id: string, data: Partial<Widget>): Promise<Widget>
    deleteWidget(id: string): Promise<void>
    reorderWidgets(dashboardId: string, orderedIds: string[]): Promise<void>

    // Metrics
    getMetrics(): Promise<Metric[]>
    getMetric(id: string): Promise<Metric | null>
    createMetric(data: Partial<Metric>): Promise<Metric>

    // Metric Data
    getMetricData(
        metricId: string,
        startDate: Date,
        endDate: Date
    ): Promise<MetricData[]>
    addMetricData(data: Partial<MetricData>): Promise<MetricData>

    // Dimensions (categorical breakdowns)
    getDimensions(): Promise<Dimension[]>
    getDimension(id: string): Promise<Dimension | null>

    // Alerts
    getAlerts(): Promise<Alert[]>
    createAlert(data: Partial<Alert>): Promise<Alert>
    updateAlert(id: string, data: Partial<Alert>): Promise<Alert>
    deleteAlert(id: string): Promise<void>

    // User
    getCurrentUser(): Promise<User | null>
}
