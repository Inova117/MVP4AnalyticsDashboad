// Date Range Context — global state for date filtering across all widgets.
'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { subDays, startOfMonth, startOfDay, endOfDay } from 'date-fns'

export type DatePreset =
    | 'today'
    | 'yesterday'
    | 'last_7_days'
    | 'last_30_days'
    | 'last_90_days'
    | 'this_month'
    | 'custom'

interface DateRangeContextType {
    startDate: Date
    endDate: Date
    preset: DatePreset
    setPreset: (preset: DatePreset) => void
    setCustomRange: (start: Date, end: Date) => void
}

const DateRangeContext = createContext<DateRangeContextType | null>(null)

function rangeForPreset(preset: DatePreset): { start: Date; end: Date } | null {
    const end = endOfDay(new Date())
    switch (preset) {
        case 'today':
            return { start: startOfDay(new Date()), end }
        case 'yesterday':
            return { start: startOfDay(subDays(new Date(), 1)), end: endOfDay(subDays(new Date(), 1)) }
        case 'last_7_days':
            return { start: startOfDay(subDays(end, 6)), end }
        case 'last_30_days':
            return { start: startOfDay(subDays(end, 29)), end }
        case 'last_90_days':
            return { start: startOfDay(subDays(end, 89)), end }
        case 'this_month':
            return { start: startOfMonth(end), end }
        case 'custom':
            return null
    }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
    const initial = rangeForPreset('last_30_days')!
    const [startDate, setStartDate] = useState(initial.start)
    const [endDate, setEndDate] = useState(initial.end)
    const [preset, setPresetState] = useState<DatePreset>('last_30_days')

    const setPreset = useCallback((next: DatePreset) => {
        const range = rangeForPreset(next)
        setPresetState(next)
        if (range) {
            setStartDate(range.start)
            setEndDate(range.end)
        }
    }, [])

    const setCustomRange = useCallback((start: Date, end: Date) => {
        setPresetState('custom')
        setStartDate(startOfDay(start))
        setEndDate(endOfDay(end))
    }, [])

    return (
        <DateRangeContext.Provider value={{ startDate, endDate, preset, setPreset, setCustomRange }}>
            {children}
        </DateRangeContext.Provider>
    )
}

export function useDateRange() {
    const context = useContext(DateRangeContext)
    if (!context) {
        throw new Error('useDateRange must be used within DateRangeProvider')
    }
    return context
}
