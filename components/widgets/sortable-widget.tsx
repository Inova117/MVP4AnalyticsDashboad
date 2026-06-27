// Sortable Widget Wrapper — handles grid placement (responsive) + drag state.
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Widget } from './widget'
import type { Widget as WidgetType } from '@/types'

interface SortableWidgetProps {
    widget: WidgetType
    onDelete: () => void
    onUpdate: () => void
}

// Literal class maps so Tailwind can detect them at build time.
const colSpan: Record<number, string> = {
    1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
    5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
    9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
}

export function SortableWidget({ widget, onDelete, onUpdate }: SortableWidgetProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: widget.id,
    })

    const span = colSpan[Math.min(Math.max(widget.width, 1), 12)] || 'md:col-span-12'
    // Row height scales with the widget's configured height.
    const minHeight = Math.max(widget.height, 2) * 80

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 30 : undefined,
        minHeight,
    }

    return (
        <div ref={setNodeRef} style={style} className={`col-span-12 ${span}`} {...attributes}>
            <Widget widget={widget} onDelete={onDelete} onUpdate={onUpdate} dragHandleProps={listeners} />
        </div>
    )
}
