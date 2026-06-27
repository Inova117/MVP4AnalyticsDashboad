// Shared application header — consistent chrome across every page.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboardIcon, BellIcon } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'
import { DataSourceSelector } from './data-source-selector'

const NAV = [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboardIcon },
    { href: '/dashboard/alerts', label: 'Alerts', Icon: BellIcon },
]

export function AppHeader() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-30 border-b border-border/70 glass">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: brand + nav */}
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="focus-ring rounded-lg">
                            <BrandLogo />
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            {NAV.map(({ href, label, Icon }) => {
                                const active = pathname === href
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Right: source + demo + theme + user */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground lg:inline-flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            Live demo data
                        </span>
                        <div className="hidden sm:block">
                            <DataSourceSelector />
                        </div>
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile: source selector + nav */}
                <div className="space-y-2 border-t border-border/60 py-2 md:hidden">
                    <div className="sm:hidden">
                        <DataSourceSelector />
                    </div>
                    <nav className="flex items-center gap-1">
                        {NAV.map(({ href, label, Icon }) => {
                        const active = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </header>
    )
}
