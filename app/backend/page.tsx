// Backend Page with Mermaid Support
'use client'

import { ArchitectureOverview } from '@/components/backend/architecture-overview'
import { SecurityFeatures } from '@/components/backend/security-features'
import { DatabaseSchema } from '@/components/backend/database-schema'
import { ApiDocumentation } from '@/components/backend/api-documentation'
import { MermaidScript } from '@/components/mermaid-script'
import { ExecutiveSummary } from '@/components/backend/executive-summary'
import { FounderHandover } from '@/components/backend/founder-handover'
import { DataConnectors } from '@/components/backend/data-connectors'
import Link from 'next/link'

export default function BackendPage() {
    return (
        <>
            <MermaidScript />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <Link
                                        href="/"
                                        className="text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Dashboard
                                    </Link>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    Backend & Security
                                </h1>
                                <p className="mt-2 text-slate-600">
                                    Enterprise-grade infrastructure powering your analytics platform
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-green-700">
                                    Production Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

                    {/* Executive Summary */}
                    <section>
                        <ExecutiveSummary />
                    </section>

                    {/* Founder Handover Documentation */}
                    <section>
                        <FounderHandover />
                    </section>

                    {/* Architecture Overview */}
                    <section>
                        <ArchitectureOverview />
                    </section>

                    {/* Data Source Connectors */}
                    <section>
                        <DataConnectors />
                    </section>

                    {/* Security Features */}
                    <section>
                        <SecurityFeatures />
                    </section>

                    {/* Database Schema */}
                    <section>
                        <DatabaseSchema />
                    </section>

                    {/* API Documentation */}
                    <section>
                        <ApiDocumentation />
                    </section>

                    {/* Footer CTA */}
                    <section className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-12 text-center text-white">
                        <h2 className="mb-4 text-3xl font-bold">Built for production from day one</h2>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100">
                            Type-safe data layer, modular widgets, and a connector architecture ready to swap
                            mock data for live integrations — without touching the UI.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/dashboard"
                                className="rounded-lg bg-white px-8 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
