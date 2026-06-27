// Mock Data Client — source-aware, in-memory implementation of DataClient.
//
// Everything is scoped to the currently-active data source: dashboards,
// widgets, metrics, dimensions, time-series and alerts. Switching the source
// swaps the entire workspace. Edits (add/remove/reorder/rename widgets, manage
// alerts) persist in memory for the session so the demo feels stateful.

import type {
    DataClient,
    Dashboard,
    Widget,
    Metric,
    MetricData,
    Dimension,
    Alert,
    User,
} from '@/types'
import {
    SOURCES,
    type DataSourceType,
    type SourceDef,
    type MetricDef,
} from './catalog'
import { getActiveDataSource } from './data-source-registry'
import { generateSeries } from './generator'

const mockUser: User = {
    id: 'demo-user-1',
    email: 'alex@northwind.io',
    full_name: 'Alex Rivera',
    company_name: 'Northwind Analytics',
}

interface SourceState {
    dashboard: Dashboard
    metrics: Metric[]
    widgets: Widget[]
    dimensions: Dimension[]
    alerts: Alert[]
    series: Map<string, MetricData[]>
}

const stateBySource = new Map<DataSourceType, SourceState>()

function metricFromDef(def: MetricDef, source: DataSourceType): Metric {
    return {
        id: def.id,
        user_id: mockUser.id,
        name: def.name,
        source,
        unit: def.unit,
        aggregation: def.aggregation,
        decimals: def.decimals,
        prefix: def.prefix,
        suffix: def.suffix,
        target: def.target,
        description: def.description,
        created_at: '2024-01-10T10:00:00Z',
    }
}

function seedAlerts(source: SourceDef): Alert[] {
    const presets: Record<DataSourceType, Array<Omit<Alert, 'id' | 'user_id' | 'notification_email' | 'created_at'>>> = {
        'google-analytics': [
            { metric_id: 'ga-conversion-rate', name: 'Conversion Rate Drop', condition: 'lt', threshold: 2.5, is_active: true },
            { metric_id: 'ga-sessions', name: 'Traffic Spike', condition: 'gt', threshold: 2200, is_active: true },
            { metric_id: 'ga-bounce-rate', name: 'High Bounce Rate', condition: 'gt', threshold: 55, is_active: false, last_triggered: '2024-05-18T14:30:00Z' },
        ],
        'meta-ads': [
            { metric_id: 'meta-roas', name: 'ROAS Below Target', condition: 'lt', threshold: 4, is_active: true },
            { metric_id: 'meta-spend', name: 'Daily Spend Cap', condition: 'gt', threshold: 1200, is_active: true },
            { metric_id: 'meta-ctr', name: 'CTR Underperforming', condition: 'lt', threshold: 2.5, is_active: false },
        ],
        'internal-saas': [
            { metric_id: 'saas-churn', name: 'Churn Above Threshold', condition: 'gt', threshold: 4, is_active: true },
            { metric_id: 'saas-mrr', name: 'MRR Milestone', condition: 'gt', threshold: 150000, is_active: true },
            { metric_id: 'saas-active-users', name: 'Engagement Dip', condition: 'lt', threshold: 7500, is_active: false },
        ],
        'ecommerce': [
            { metric_id: 'ecom-revenue', name: 'Low Revenue Day', condition: 'lt', threshold: 5000, is_active: true },
            { metric_id: 'ecom-cart-abandon', name: 'Cart Abandonment High', condition: 'gt', threshold: 72, is_active: true },
            { metric_id: 'ecom-aov', name: 'AOV Below Target', condition: 'lt', threshold: 75, is_active: false },
        ],
    }

    return presets[source.id].map((a, i) => ({
        id: `alert-${source.id}-${i}`,
        user_id: mockUser.id,
        notification_email: mockUser.email,
        created_at: '2024-04-12T10:00:00Z',
        ...a,
    }))
}

function buildState(sourceId: DataSourceType): SourceState {
    const source = SOURCES[sourceId]
    const dashboardId = `${sourceId}-dashboard`

    const dashboard: Dashboard = {
        id: dashboardId,
        user_id: mockUser.id,
        name: source.dashboardName,
        source: sourceId,
        is_default: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-05-20T14:30:00Z',
    }

    const metrics = source.metrics.map((m) => metricFromDef(m, sourceId))

    const widgets: Widget[] = source.widgets.map((seed, index) => ({
        id: seed.id,
        dashboard_id: dashboardId,
        type: seed.type,
        title: seed.title,
        metric_id: seed.metricId ?? '',
        dimension_id: seed.dimensionId,
        config: {
            color: seed.color,
            showLegend: seed.showLegend,
        },
        position_x: 0,
        position_y: 0,
        order: index,
        width: seed.width,
        height: seed.height,
        created_at: '2024-01-15T10:00:00Z',
    }))

    const dimensions: Dimension[] = source.dimensions.map((d) => ({
        id: d.id,
        source: sourceId,
        name: d.name,
        unit: d.unit,
        slices: d.slices,
    }))

    return {
        dashboard,
        metrics,
        widgets,
        dimensions,
        alerts: seedAlerts(source),
        series: new Map(),
    }
}

function getState(sourceId?: DataSourceType): SourceState {
    const id = sourceId ?? getActiveDataSource()
    let state = stateBySource.get(id)
    if (!state) {
        state = buildState(id)
        stateBySource.set(id, state)
    }
    return state
}

function getSeries(state: SourceState, metricId: string): MetricData[] {
    let series = state.series.get(metricId)
    if (!series) {
        const def = SOURCES[state.dashboard.source as DataSourceType].metrics.find((m) => m.id === metricId)
        if (!def) return []
        series = generateSeries(metricId, {
            base: def.base,
            variance: def.variance,
            trend: def.trend,
            seasonality: def.seasonality,
            decimals: def.decimals,
            min: def.min,
            max: def.max,
        })
        state.series.set(metricId, series)
    }
    return series
}

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const mockDataClient: DataClient = {
    // Dashboards ------------------------------------------------------------
    async getDashboards(): Promise<Dashboard[]> {
        return [getState().dashboard]
    },

    async getDashboard(id: string): Promise<Dashboard | null> {
        const state = getState()
        return state.dashboard.id === id ? state.dashboard : null
    },

    async createDashboard(data: Partial<Dashboard>): Promise<Dashboard> {
        return { ...getState().dashboard, ...data }
    },

    async updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard> {
        const state = getState()
        state.dashboard = { ...state.dashboard, ...data, updated_at: new Date().toISOString() }
        return state.dashboard
    },

    async deleteDashboard(): Promise<void> {
        /* default dashboards are not deletable in the demo */
    },

    // Widgets ---------------------------------------------------------------
    async getWidgets(dashboardId: string): Promise<Widget[]> {
        const state = getState()
        if (state.dashboard.id !== dashboardId) return []
        return [...state.widgets].sort((a, b) => a.order - b.order)
    },

    async createWidget(data: Partial<Widget>): Promise<Widget> {
        const state = getState()
        const maxOrder = state.widgets.reduce((m, w) => Math.max(m, w.order), -1)
        const newWidget: Widget = {
            id: generateId('widget'),
            dashboard_id: state.dashboard.id,
            type: data.type || 'kpi',
            title: data.title || 'New Widget',
            metric_id: data.metric_id ?? '',
            dimension_id: data.dimension_id,
            config: data.config || {},
            position_x: 0,
            position_y: 0,
            order: maxOrder + 1,
            width: data.width ?? 4,
            height: data.height ?? 3,
            created_at: new Date().toISOString(),
        }
        state.widgets.push(newWidget)
        return newWidget
    },

    async updateWidget(id: string, data: Partial<Widget>): Promise<Widget> {
        const state = getState()
        const index = state.widgets.findIndex((w) => w.id === id)
        if (index === -1) throw new Error('Widget not found')
        state.widgets[index] = { ...state.widgets[index], ...data }
        return state.widgets[index]
    },

    async deleteWidget(id: string): Promise<void> {
        const state = getState()
        state.widgets = state.widgets.filter((w) => w.id !== id)
    },

    async reorderWidgets(dashboardId: string, orderedIds: string[]): Promise<void> {
        const state = getState()
        if (state.dashboard.id !== dashboardId) return
        const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
        state.widgets = state.widgets.map((w) =>
            orderMap.has(w.id) ? { ...w, order: orderMap.get(w.id)! } : w
        )
    },

    // Metrics ---------------------------------------------------------------
    async getMetrics(): Promise<Metric[]> {
        return getState().metrics
    },

    async getMetric(id: string): Promise<Metric | null> {
        return getState().metrics.find((m) => m.id === id) || null
    },

    async createMetric(data: Partial<Metric>): Promise<Metric> {
        const state = getState()
        const newMetric: Metric = {
            id: generateId('metric'),
            user_id: mockUser.id,
            name: data.name || 'New Metric',
            source: state.dashboard.source,
            unit: data.unit || 'number',
            aggregation: data.aggregation || 'sum',
            created_at: new Date().toISOString(),
        }
        state.metrics.push(newMetric)
        return newMetric
    },

    // Metric Data -----------------------------------------------------------
    async getMetricData(metricId: string, startDate: Date, endDate: Date): Promise<MetricData[]> {
        const state = getState()
        const series = getSeries(state, metricId)
        const start = startDate.getTime()
        const end = endDate.getTime()
        return series.filter((d) => {
            const t = new Date(d.timestamp).getTime()
            return t >= start && t <= end
        })
    },

    async addMetricData(data: Partial<MetricData>): Promise<MetricData> {
        return {
            id: generateId('data'),
            metric_id: data.metric_id!,
            value: data.value || 0,
            timestamp: data.timestamp || new Date().toISOString(),
        }
    },

    // Dimensions ------------------------------------------------------------
    async getDimensions(): Promise<Dimension[]> {
        return getState().dimensions
    },

    async getDimension(id: string): Promise<Dimension | null> {
        return getState().dimensions.find((d) => d.id === id) || null
    },

    // Alerts ----------------------------------------------------------------
    async getAlerts(): Promise<Alert[]> {
        return getState().alerts
    },

    async createAlert(data: Partial<Alert>): Promise<Alert> {
        const state = getState()
        const newAlert: Alert = {
            id: generateId('alert'),
            user_id: mockUser.id,
            metric_id: data.metric_id!,
            name: data.name || 'New Alert',
            condition: data.condition || 'gt',
            threshold: data.threshold || 0,
            is_active: data.is_active !== undefined ? data.is_active : true,
            notification_email: data.notification_email || mockUser.email,
            created_at: new Date().toISOString(),
        }
        state.alerts.push(newAlert)
        return newAlert
    },

    async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
        const state = getState()
        const index = state.alerts.findIndex((a) => a.id === id)
        if (index === -1) throw new Error('Alert not found')
        state.alerts[index] = { ...state.alerts[index], ...data }
        return state.alerts[index]
    },

    async deleteAlert(id: string): Promise<void> {
        const state = getState()
        state.alerts = state.alerts.filter((a) => a.id !== id)
    },

    // User ------------------------------------------------------------------
    async getCurrentUser(): Promise<User | null> {
        return mockUser
    },
}
