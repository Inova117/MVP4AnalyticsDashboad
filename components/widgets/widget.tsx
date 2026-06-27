// Widget shell — frame + actions, routes to the specific visualization.
'use client'

import { KpiWidget } from './kpi-widget'
import { LineChartWidget } from './line-chart-widget'
import { AreaChartWidget } from './area-chart-widget'
import { BarChartWidget } from './bar-chart-widget'
import { PieChartWidget } from './pie-chart-widget'
import { WidgetSettingsModal } from './widget-settings-modal'
import type { Widget as WidgetType } from '@/types'
import { GripVerticalIcon, SettingsIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

interface WidgetProps {
    widget: WidgetType
    onDelete: () => void
    onUpdate: () => void
    dragHandleProps?: Record<string, unknown>
}

export function Widget({ widget, onDelete, onUpdate, dragHandleProps }: WidgetProps) {
    const [showSettings, setShowSettings] = useState(false)

    const renderWidget = () => {
        switch (widget.type) {
            case 'kpi':
                return <KpiWidget widget={widget} />
            case 'line':
                return <LineChartWidget widget={widget} />
            case 'area':
                return <AreaChartWidget widget={widget} />
            case 'bar':
                return <BarChartWidget widget={widget} />
            case 'pie':
            case 'donut':
                return <PieChartWidget widget={widget} />
            default:
                return (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Unknown widget type
                    </div>
                )
        }
    }

    return (
        <div
            data-export-card
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-shadow duration-300 hover:shadow-elevated"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
                <div className="flex min-w-0 items-center gap-2">
                    <button
                        {...dragHandleProps}
                        className="cursor-grab text-muted-foreground/40 transition-colors hover:text-primary active:cursor-grabbing focus-ring rounded"
                        title="Drag to reorder"
                        aria-label="Drag to reorder"
                    >
                        <GripVerticalIcon className="h-4 w-4" />
                    </button>
                    <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {widget.title}
                    </h3>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-ring"
                        onClick={() => setShowSettings(true)}
                        title="Widget settings"
                        aria-label="Widget settings"
                    >
                        <SettingsIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus-ring"
                        onClick={() => {
                            if (confirm(`Delete "${widget.title}"?`)) onDelete()
                        }}
                        title="Delete widget"
                        aria-label="Delete widget"
                    >
                        <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative min-h-0 flex-1 px-5 pb-5">{renderWidget()}</div>

            {showSettings && (
                <WidgetSettingsModal
                    widget={widget}
                    onClose={() => setShowSettings(false)}
                    onSuccess={() => {
                        setShowSettings(false)
                        onUpdate()
                    }}
                />
            )}
        </div>
    )
}
