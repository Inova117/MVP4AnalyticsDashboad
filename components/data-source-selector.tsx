// Data Source Selector — switches the entire active workspace in-place.
'use client'

import { useState, useEffect } from 'react'
import {
    CheckIcon,
    ChevronDownIcon,
    LineChartIcon,
    MegaphoneIcon,
    DatabaseIcon,
    ShoppingCartIcon,
} from 'lucide-react'
import {
    getAllDataSources,
    getActiveDataSource,
    setActiveDataSource,
    type DataSourceType,
} from '@/lib/mock-data/data-source-registry'

const ICONS = {
    'line-chart': LineChartIcon,
    'megaphone': MegaphoneIcon,
    'database': DatabaseIcon,
    'shopping-cart': ShoppingCartIcon,
} as const

export function DataSourceSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const [active, setActive] = useState<DataSourceType>('google-analytics')

    const sources = getAllDataSources()
    const current = sources.find((s) => s.id === active)

    useEffect(() => {
        setActive(getActiveDataSource())
    }, [])

    const handleSelect = (id: DataSourceType) => {
        if (id !== active) {
            setActive(id)
            setActiveDataSource(id) // broadcasts → dashboard reloads in place
        }
        setIsOpen(false)
    }

    const CurrentIcon = current ? ICONS[current.iconKey] : LineChartIcon

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="flex w-full min-w-[15rem] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/60 focus-ring"
            >
                <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: current?.tint }}
                >
                    <CurrentIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{current?.name}</span>
                    <span className="block text-[11px] text-muted-foreground">Data source</span>
                </span>
                <ChevronDownIcon className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-slide-up">
                        <div className="border-b border-border px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                Switch workspace
                            </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-1.5 custom-scrollbar">
                            {sources.map((source) => {
                                const Icon = ICONS[source.iconKey]
                                const isActive = source.id === active
                                return (
                                    <button
                                        key={source.id}
                                        onClick={() => handleSelect(source.id)}
                                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${isActive ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                    >
                                        <span
                                            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                                            style={{ backgroundColor: source.tint }}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">{source.name}</span>
                                                {isActive && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">{source.description}</span>
                                            <span className="mt-1.5 inline-flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                                <span className="text-[11px] capitalize text-muted-foreground">{source.status}</span>
                                            </span>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
