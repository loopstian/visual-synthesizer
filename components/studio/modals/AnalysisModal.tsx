"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Tag, List, Loader2, Play, Ban, Sparkles, Brush } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
// Import the new canvas component
import { ImageMaskCanvas, ImageMaskCanvasHandle } from "./ImageMaskCanvas"

interface AnalysisModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    isAnalyzing: boolean
    onAnalyze: (image: string | Blob) => void // Updated signature to accept Blob
    selectedExtractors: string[]
    onToggleExtractor: (id: string) => void
    viewMode: 'main' | 'component'
}

export function AnalysisModal({
    isOpen,
    onClose,
    imageUrl,
    isAnalyzing,
    onAnalyze,
    selectedExtractors,
    onToggleExtractor,
    viewMode
}: AnalysisModalProps) {
    // Only used for component mode free text
    const [customPrompt, setCustomPrompt] = useState("")
    const [isMaskMode, setIsMaskMode] = useState(false)
    const maskRef = useRef<ImageMaskCanvasHandle>(null)

    const extractors = [
        { id: "subject", label: "Subject", icon: Tag },
        { id: "composition", label: "Composition", icon: List },
        { id: "lighting", label: "Lighting", icon: Sparkles }, // Changed icon for variety
        { id: "color", label: "Color Palette", icon: Ban }, // Placeholder icon
    ]

    const handleRunAnalysis = async () => {
        // Check if we have a mask
        let payload: string | Blob = imageUrl
        if (maskRef.current?.hasMask()) {
            const blob = await maskRef.current.getMaskedImageBlob()
            if (blob) {
                payload = blob
                console.log("Using masked image for analysis", blob)
            }
        } else if (viewMode === 'component' && customPrompt.trim()) {
            // Future: extend to pass custom prompt
        }

        onAnalyze(payload)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isAnalyzing && open === false && onClose()}>
            <DialogContent className="max-w-4xl sm:max-w-5xl h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Analyze Image Assets
                    </DialogTitle>
                    <DialogDescription>
                        Extract stylistic elements to build your visual vocabulary.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden p-6 gap-6 grid grid-cols-1 md:grid-cols-[2fr_1fr]">
                    {/* Left Column: Image Preview + Tools */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex-1 min-h-0 relative flex items-center justify-center bg-black/20 rounded-md overflow-hidden">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <ImageMaskCanvas
                                    ref={maskRef}
                                    imageSrc={imageUrl}
                                    isDrawingEnabled={isMaskMode}
                                />
                            </div>
                        </div>

                        {/* Focus Brush Controls - Below Image */}
                        <div className="h-12 flex-shrink-0 flex items-center justify-center mt-2">
                            <div className="flex items-center gap-3 bg-muted/50 border rounded-full p-1 pl-1 pr-4 shadow-sm">
                                <Button
                                    variant={isMaskMode ? "default" : "ghost"}
                                    size="sm"
                                    className="gap-2 rounded-full h-8"
                                    onClick={() => setIsMaskMode(!isMaskMode)}
                                >
                                    <Brush className="h-3.5 w-3.5" />
                                    {isMaskMode ? "Focus Brush On" : "Focus Brush"}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {isMaskMode ? "Paint over areas to focus analysis" : "Enable to target specific areas"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Configuration */}
                    <div className="flex flex-col gap-6 overflow-y-auto pr-2">

                        {viewMode === 'main' ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Select Extractors</h4>
                                    <p className="text-xs text-muted-foreground">What information do you want to pull?</p>
                                </div>
                                <div className="space-y-2">
                                    {extractors.map((extractor) => {
                                        const isSelected = selectedExtractors.includes(extractor.id)
                                        const Icon = extractor.icon
                                        return (
                                            <div
                                                key={extractor.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                    isSelected
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                                onClick={() => onToggleExtractor(extractor.id)}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                )}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium leading-none">{extractor.label}</div>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            // Component Mode UI
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Curation Instructions</h4>
                                    <p className="text-xs text-muted-foreground">Describe what to look for in this specific asset.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="custom-prompt">Custom Extraction Prompt</Label>
                                    <Textarea
                                        id="custom-prompt"
                                        placeholder="e.g. Focus on the texture of the fabric..."
                                        className="h-32 resize-none"
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t">
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing || (viewMode === 'main' && selectedExtractors.length === 0)}
                            >
                                {isAnalyzing ? <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </> : <>
                                    <Play className="h-4 w-4" />
                                    Run Analysis
                                </>}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
