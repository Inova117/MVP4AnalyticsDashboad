import { ActivityIcon } from 'lucide-react'

export function BrandLogo({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow">
                <ActivityIcon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            {!compact && (
                <span className="flex flex-col leading-none">
                    <span className="font-display text-lg font-bold tracking-tight text-foreground">Pulse</span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Analytics
                    </span>
                </span>
            )}
        </div>
    )
}
