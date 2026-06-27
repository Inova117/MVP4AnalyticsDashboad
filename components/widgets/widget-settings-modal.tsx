// Widget Settings Modal — rename + restyle an existing widget.
'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { dataClient } from '@/lib/supabase'
import type { Widget } from '@/types'
import { XIcon } from 'lucide-react'
import { ACCENT_CHOICES } from '@/lib/theme'

interface WidgetSettingsModalProps {
    widget: Widget
    onClose: () => void
    onSuccess: () => void
}

export function WidgetSettingsModal({ widget, onClose, onSuccess }: WidgetSettingsModalProps) {
    const [title, setTitle] = useState(widget.title)
    const [color, setColor] = useState(widget.config.color || ACCENT_CHOICES[0].value)
    const [showLegend, setShowLegend] = useState(widget.config.showLegend !== false)
    const [loading, setLoading] = useState(false)

    const isCategorical = widget.type === 'pie' || widget.type === 'donut'

    const handleSave = async () => {
        setLoading(true)
        try {
            await dataClient.updateWidget(widget.id, {
                title: title.trim() || widget.title,
                config: {
                    ...widget.config,
                    color: isCategorical ? widget.config.color : color,
                    showLegend: isCategorical ? showLegend : widget.config.showLegend,
                },
            })
            onSuccess()
        } catch (err) {
            console.error('Error updating widget:', err)
        } finally {
            setLoading(false)
        }
    }

    if (typeof window === 'undefined') return null

    return createPortal(
        <>
            <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-elevated animate-slide-up">
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <h2 className="text-lg font-bold text-foreground">Widget Settings</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                            aria-label="Close"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-5 p-6">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-foreground/80">Widget Title</span>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
                        </label>

                        {!isCategorical && (
                            <div>
                                <span className="mb-2 block text-sm font-medium text-foreground/80">Accent Color</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {ACCENT_CHOICES.map((c) => (
                                        <button
                                            key={c.value}
                                            onClick={() => setColor(c.value)}
                                            title={c.label}
                                            aria-label={c.label}
                                            className={`h-9 w-9 rounded-full transition-all ${color === c.value ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card' : 'opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {isCategorical && (
                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                                <span className="text-sm font-medium text-foreground/80">Show legend</span>
                                <input
                                    type="checkbox"
                                    checked={showLegend}
                                    onChange={(e) => setShowLegend(e.target.checked)}
                                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                                />
                            </label>
                        )}

                        <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium capitalize text-foreground">{widget.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Grid size</span>
                                <span className="font-medium text-foreground tabular-nums">{widget.width} × {widget.height}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                        <button onClick={onClose} className="btn-ghost">Cancel</button>
                        <button onClick={handleSave} disabled={!title.trim() || loading} className="btn-primary">
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}
