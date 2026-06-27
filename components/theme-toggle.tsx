'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from 'lucide-react'

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-ring"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            {mounted ? (
                isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />
            ) : (
                <SunIcon className="h-4 w-4 opacity-0" />
            )}
        </button>
    )
}
