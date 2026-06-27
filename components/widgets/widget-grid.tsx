// Widget Grid — drag & drop with persisted ordering.
'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableWidget } from './sortable-widget'
import { dataClient } from '@/lib/supabase'
import type { Widget } from '@/types'

interface WidgetGridProps {
    dashboardId: string
    widgets: Widget[]
    onUpdate: () => void
}

export function WidgetGrid({ dashboardId, widgets, onUpdate }: WidgetGridProps) {
    const [items, setItems] = useState(widgets)

    useEffect(() => {
        setItems(widgets)
    }, [widgets])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const next = arrayMove(items, oldIndex, newIndex)
        setItems(next) // optimistic

        try {
            await dataClient.reorderWidgets(dashboardId, next.map((w) => w.id))
        } catch (err) {
            console.error('Error reordering widgets:', err)
            setItems(items) // revert
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((w) => w.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-12 gap-4">
                    {items.map((widget) => (
                        <SortableWidget
                            key={widget.id}
                            widget={widget}
                            onUpdate={onUpdate}
                            onDelete={async () => {
                                await dataClient.deleteWidget(widget.id)
                                onUpdate()
                            }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
