// Date Range Selector — presets + a working custom range picker.
'use client'

import { useState } from 'react'
import { useDateRange, type DatePreset } from '@/lib/contexts/date-range-context'
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { format } from 'date-fns'

const PRESETS: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 90 days' },
    { value: 'this_month', label: 'This month' },
]

export function DateRangeSelector() {
    const { startDate, endDate, preset, setPreset, setCustomRange } = useDateRange()
    const [isOpen, setIsOpen] = useState(false)
    const [customMode, setCustomMode] = useState(false)
    const [from, setFrom] = useState(format(startDate, 'yyyy-MM-dd'))
    const [to, setTo] = useState(format(endDate, 'yyyy-MM-dd'))

    const label =
        preset === 'custom'
            ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
            : PRESETS.find((p) => p.value === preset)?.label ?? 'Select range'

    const choosePreset = (p: DatePreset) => {
        setPreset(p)
        setCustomMode(false)
        setIsOpen(false)
    }

    const applyCustom = () => {
        const s = new Date(from)
        const e = new Date(to)
        if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && s <= e) {
            setCustomRange(s, e)
            setIsOpen(false)
            setCustomMode(false)
        }
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen((o) => !o)} className="btn-secondary">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-slide-up">
                        {!customMode ? (
                            <div className="p-1.5">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => choosePreset(p.value)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${preset === p.value ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                                <div className="my-1 border-t border-border" />
                                <button
                                    onClick={() => setCustomMode(true)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${preset === 'custom' ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted'}`}
                                >
                                    Custom range…
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 p-3">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-muted-foreground">From</span>
                                    <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="input py-2" />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-muted-foreground">To</span>
                                    <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="input py-2" />
                                </label>
                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <button onClick={() => setCustomMode(false)} className="btn-ghost px-3 py-2 text-xs">Back</button>
                                    <button onClick={applyCustom} className="btn-primary px-4 py-2 text-xs">Apply</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
