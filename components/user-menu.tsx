'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dataClient } from '@/lib/supabase'
import type { User } from '@/types'
import { ChevronDownIcon, LayersIcon, SettingsIcon, LogOutIcon, UserIcon } from 'lucide-react'

function initials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export function UserMenu() {
    const [user, setUser] = useState<User | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        dataClient.getCurrentUser().then(setUser)
    }, [])

    if (!user) return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted focus-ring"
                aria-label="Account menu"
            >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {initials(user.full_name)}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-slide-up">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            {user.company_name && (
                                <p className="mt-1 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                    {user.company_name}
                                </p>
                            )}
                        </div>
                        <div className="p-1.5">
                            <MenuItem icon={<UserIcon className="h-4 w-4" />} label="Profile" />
                            <MenuItem icon={<SettingsIcon className="h-4 w-4" />} label="Workspace settings" />
                            <Link
                                href="/backend"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                            >
                                <LayersIcon className="h-4 w-4 text-muted-foreground" />
                                Architecture &amp; API
                            </Link>
                        </div>
                        <div className="border-t border-border p-1.5">
                            <MenuItem icon={<LogOutIcon className="h-4 w-4" />} label="Sign out" />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
            <span className="text-muted-foreground">{icon}</span>
            {label}
        </button>
    )
}
