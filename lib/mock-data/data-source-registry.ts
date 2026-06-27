// Active data-source state + registry.
// The selected source is persisted in localStorage and broadcast via a custom
// event so the whole app reacts in-place (no full page reload).

import {
    SOURCE_LIST,
    getSourceDef,
    DEFAULT_SOURCE,
    type DataSourceType,
    type SourceDef,
} from './catalog'

export type { DataSourceType, SourceDef }

const STORAGE_KEY = 'activeDataSource'
export const DATA_SOURCE_CHANGED_EVENT = 'dataSourceChanged'

export function getAllDataSources(): SourceDef[] {
    return SOURCE_LIST
}

export function getDataSource(sourceId: DataSourceType): SourceDef {
    return getSourceDef(sourceId)
}

export function getActiveDataSource(): DataSourceType {
    if (typeof window === 'undefined') return DEFAULT_SOURCE
    const stored = localStorage.getItem(STORAGE_KEY) as DataSourceType | null
    return stored && stored in { 'google-analytics': 1, 'meta-ads': 1, 'internal-saas': 1, 'ecommerce': 1 }
        ? stored
        : DEFAULT_SOURCE
}

export function setActiveDataSource(sourceId: DataSourceType) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, sourceId)
    window.dispatchEvent(new CustomEvent(DATA_SOURCE_CHANGED_EVENT, { detail: sourceId }))
}
