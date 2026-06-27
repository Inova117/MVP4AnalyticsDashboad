// Data Connector Types
// This defines the contract that all data connectors must implement

export interface DataConnector {
    name: string
    type: ConnectorType
    status: ConnectorStatus
    connect(): Promise<void>
    disconnect(): Promise<void>
    fetchMetrics(dateRange: DateRange): Promise<MetricData[]>
    testConnection(): Promise<boolean>
}

export type ConnectorType =
    | 'google-analytics'
    | 'meta-ads'
    | 'google-ads'
    | 'internal-db'
    | 'csv-upload'
    | 'api-webhook'

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export interface DateRange {
    startDate: Date
    endDate: Date
}

export interface MetricData {
    metric_id: string
    value: number
    timestamp: string
}

export interface ConnectorConfig {
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    accountId?: string
    propertyId?: string
    customFields?: Record<string, unknown>
}

export interface ConnectorMetadata {
    lastSync?: Date
    totalRecords?: number
    errorCount?: number
    rateLimitRemaining?: number
}
