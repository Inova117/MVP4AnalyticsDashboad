// Mock Data Exports for MVP #4
export { mockDataClient } from './client'
export {
    SOURCES,
    SOURCE_LIST,
    DEFAULT_SOURCE,
    getSourceDef,
    type DataSourceType,
    type SourceDef,
} from './catalog'
export {
    getActiveDataSource,
    setActiveDataSource,
    getAllDataSources,
    getDataSource,
    DATA_SOURCE_CHANGED_EVENT,
} from './data-source-registry'
