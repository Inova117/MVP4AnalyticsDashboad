'use client'

import { useState } from 'react'
import { XIcon, FileDownIcon, Loader2Icon } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

interface ExportPdfModalProps {
    dashboardName: string
    onClose: () => void
}

export function ExportPdfModal({ dashboardName, onClose }: ExportPdfModalProps) {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState('')
    const [includeBranding, setIncludeBranding] = useState(true)
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

    const handleExport = async () => {
        setLoading(true)
        setProgress('Preparing dashboard...')

        try {
            // 1. Get all widget elements
            const widgetElements = document.querySelectorAll('[data-export-card]')
            if (!widgetElements.length) {
                throw new Error('No widgets found to export')
            }

            // 2. Initialize PDF
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4',
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 15
            const contentWidth = pageWidth - (margin * 2)

            let currentY = margin

            // 3. Add Header
            if (includeBranding) {
                pdf.setFontSize(24)
                pdf.setTextColor(30, 41, 59) // Slate-800
                pdf.text(dashboardName, margin, currentY + 10)

                pdf.setFontSize(10)
                pdf.setTextColor(100, 116, 139) // Slate-500
                pdf.text(`Generated on ${format(new Date(), 'PPpp')}`, margin, currentY + 18)

                currentY += 30
            }

            // 4. Capture and Add Widgets
            // Grid layout configuration
            const cols = orientation === 'landscape' ? 3 : 2
            const spacing = 5
            const widgetWidth = (contentWidth - ((cols - 1) * spacing)) / cols
            let currentX = margin
            let rowMaxHeight = 0

            for (let i = 0; i < widgetElements.length; i++) {
                setProgress(`Processing widget ${i + 1} of ${widgetElements.length}...`)
                const element = widgetElements[i] as HTMLElement

                // Capture high-res image
                const canvas = await html2canvas(element, {
                    scale: 2, // Retina quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff', // PDF pages are white
                })

                const imgData = canvas.toDataURL('image/png')

                // Calculate dimensions preserving aspect ratio
                const imgProps = pdf.getImageProperties(imgData)
                const pdfImgHeight = (imgProps.height * widgetWidth) / imgProps.width

                // Check for page break
                if (currentY + pdfImgHeight > pageHeight - margin) {
                    pdf.addPage()
                    currentY = margin
                    // Reset row vars
                    currentX = margin
                    rowMaxHeight = 0
                }

                // Add image
                pdf.addImage(imgData, 'PNG', currentX, currentY, widgetWidth, pdfImgHeight)

                // Update grid position
                if (pdfImgHeight > rowMaxHeight) {
                    rowMaxHeight = pdfImgHeight
                }

                currentX += widgetWidth + spacing

                // New row if needed
                if ((i + 1) % cols === 0) {
                    currentX = margin
                    currentY += rowMaxHeight + spacing
                    rowMaxHeight = 0
                }
            }

            setProgress('Finalizing PDF...')
            pdf.save(`${dashboardName.toLowerCase().replace(/\s+/g, '-')}-report.pdf`)

            // Success delay
            await new Promise(r => setTimeout(r, 500))
            onClose()
        } catch (error) {
            console.error('Export failed:', error)
            setProgress('Export failed. Please try again.')
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
                            <h2 className="text-lg font-bold text-foreground">Export Dashboard</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Generate a PDF report</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                            disabled={loading}
                            aria-label="Close"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Orientation Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Page Orientation</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setOrientation('portrait')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${orientation === 'portrait'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600'
                                            : 'border-border hover:border-border/80 bg-background/50 text-muted-foreground'
                                        }`}
                                >
                                    <div className="w-8 h-10 border-2 border-current rounded-sm" />
                                    <span className="text-sm font-medium">Portrait</span>
                                </button>
                                <button
                                    onClick={() => setOrientation('landscape')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${orientation === 'landscape'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600'
                                            : 'border-border hover:border-border/80 bg-background/50 text-muted-foreground'
                                        }`}
                                >
                                    <div className="w-10 h-8 border-2 border-current rounded-sm" />
                                    <span className="text-sm font-medium">Landscape</span>
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/30 cursor-pointer hover:bg-background/50 transition">
                                <input
                                    type="checkbox"
                                    checked={includeBranding}
                                    onChange={(e) => setIncludeBranding(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">Include Branding</div>
                                    <div className="text-xs text-muted-foreground">Add dashboard title and timestamp</div>
                                </div>
                            </label>
                        </div>

                        {/* Status Message */}
                        {loading && (
                            <div className="flex items-center gap-3 text-sm text-primary-600 bg-primary-50 dark:bg-primary-950/30 p-3 rounded-xl animate-pulse">
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                {progress}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                        <button onClick={onClose} className="btn-ghost" disabled={loading}>
                            Cancel
                        </button>
                        <button onClick={handleExport} disabled={loading} className="btn-primary">
                            {loading ? (
                                'Exporting…'
                            ) : (
                                <>
                                    <FileDownIcon className="h-4 w-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
