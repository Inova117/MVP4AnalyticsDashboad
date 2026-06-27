'use client'

import { useState, useEffect } from 'react'
import { XIcon, BellIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { dataClient } from '@/lib/supabase'
import type { Metric } from '@/types'

const alertSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    metric_id: z.string().min(1, 'Please select a metric'),
    condition: z.enum(['gt', 'lt', 'eq', 'pct_change']),
    threshold: z.number().min(0, 'Threshold must be positive'),
    notification_email: z.string().email('Invalid email address'),
})

type AlertFormData = z.infer<typeof alertSchema>

interface CreateAlertModalProps {
    onClose: () => void
    onSuccess: () => void
}

export function CreateAlertModal({ onClose, onSuccess }: CreateAlertModalProps) {
    const [loading, setLoading] = useState(false)
    const [metrics, setMetrics] = useState<Metric[]>([])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AlertFormData>({
        resolver: zodResolver(alertSchema),
        defaultValues: { condition: 'lt', threshold: 0, notification_email: 'alex@northwind.io' },
    })

    useEffect(() => {
        dataClient.getMetrics().then(setMetrics)
    }, [])

    const onSubmit = async (data: AlertFormData) => {
        setLoading(true)
        try {
            await dataClient.createAlert({ ...data, is_active: true })
            onSuccess()
            onClose()
        } catch (e) {
            console.error('Failed to create alert:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-elevated animate-slide-up">
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Create Alert</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Get notified when a metric crosses a threshold</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring" aria-label="Close">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground/80">Alert Name</label>
                            <input {...register('name')} placeholder="e.g. Low Revenue Warning" className="input" />
                            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground/80">Monitor Metric</label>
                            <select {...register('metric_id')} className="input" defaultValue="">
                                <option value="">Select a metric…</option>
                                {metrics.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            {errors.metric_id && <p className="mt-1 text-xs text-danger">{errors.metric_id.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground/80">Condition</label>
                                <select {...register('condition')} className="input">
                                    <option value="gt">Greater than</option>
                                    <option value="lt">Less than</option>
                                    <option value="eq">Equal to</option>
                                    <option value="pct_change">% Change</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground/80">Threshold</label>
                                <input type="number" step="any" {...register('threshold', { valueAsNumber: true })} className="input" />
                                {errors.threshold && <p className="mt-1 text-xs text-danger">{errors.threshold.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground/80">Notify Email</label>
                            <input {...register('notification_email')} placeholder="alerts@company.com" className="input" />
                            {errors.notification_email && <p className="mt-1 text-xs text-danger">{errors.notification_email.message}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost">Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <BellIcon className="h-4 w-4" />}
                                {loading ? 'Creating…' : 'Create Alert'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
