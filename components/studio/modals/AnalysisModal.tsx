"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Tag, List, Loader2, Play, Ban, Sparkles, Brush, Plus, X, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
// Import the new canvas component
import { ImageMaskCanvas, ImageMaskCanvasHandle } from "./ImageMaskCanvas"
import { TaxonomyPicker, TAXONOMY, toId } from "./TaxonomyPicker"

interface AnalysisModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    isAnalyzing: boolean
    onAnalyze: (image: string | Blob) => void // Updated signature to accept Blob
    extractionGroups: Array<{ id: string, tone: string, targets: string[] }>
    setExtractionGroups: React.Dispatch<React.SetStateAction<Array<{ id: string, tone: string, targets: string[] }>>>
    viewMode: 'main' | 'component'
}

export function AnalysisModal({
    isOpen,
    onClose,
    imageUrl,
    isAnalyzing,
    onAnalyze,
    extractionGroups,
    setExtractionGroups,
    viewMode
}: AnalysisModalProps) {
    // Only used for component mode free text
    const [customPrompt, setCustomPrompt] = useState("")
    const [isMaskMode, setIsMaskMode] = useState(false)
    const [isTaxonomyOpen, setIsTaxonomyOpen] = useState(false)
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
    const maskRef = useRef<ImageMaskCanvasHandle>(null)

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

    // Flatten for easy lookup
    const getExtractorLabel = (id: string) => {
        // Find label in TAXONOMY
        for (const [_, items] of Object.entries(TAXONOMY)) {
            const match = items.find(label => toId(label) === id)
            if (match) return match
        }
        return id
    }

    const handleAddTaxonomy = (selectedIds: string[]) => {
        if (!activeGroupId) return

        setExtractionGroups(groups => groups.map(group => {
            if (group.id === activeGroupId) {
                // Merge and deduplicate
                const newTargets = Array.from(new Set([...group.targets, ...selectedIds]))
                return { ...group, targets: newTargets }
            }
            return group
        }))

        setIsTaxonomyOpen(false)
        setActiveGroupId(null)
    }

    const updateGroupTone = (id: string, tone: string) => {
        setExtractionGroups(groups => groups.map(g =>
            g.id === id ? { ...g, tone } : g
        ))
    }

    const removeTargetFromGroup = (groupId: string, targetId: string) => {
        setExtractionGroups(groups => groups.map(g =>
            g.id === groupId ? { ...g, targets: g.targets.filter(t => t !== targetId) } : g
        ))
    }

    const deleteGroup = (id: string) => {
        setExtractionGroups(groups => groups.filter(g => g.id !== id))
    }

    const addNewGroup = () => {
        setExtractionGroups(prev => [
            ...prev,
            { id: crypto.randomUUID(), tone: '', targets: [] }
        ])
    }

    const openTaxonomyForGroup = (groupId: string) => {
        setActiveGroupId(groupId)
        setIsTaxonomyOpen(true)
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
                    <div className="flex flex-col h-full overflow-hidden pr-0 bg-background/50">

                        {viewMode === 'main' ? (
                            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                                <div className="shrink-0 p-1">
                                    <h4 className="text-sm font-medium mb-1">Analysis Strategy</h4>
                                    <p className="text-xs text-muted-foreground">Define different lenses to analyze the image through.</p>
                                </div>

                                {/* Scrollable Zone */}
                                <div className="flex-1 overflow-y-auto p-1 pr-2 mt-2">
                                    <div className="flex flex-col gap-4 min-h-[100px] content-start">
                                        {extractionGroups.map((group, index) => (
                                            <div key={group.id} className="p-4 border rounded-md bg-muted/10 flex flex-col gap-3">
                                                {/* Row 1: Tone & Delete */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <input
                                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                            placeholder="Tone (e.g. 'Poetic', 'Technical'). Leave empty for standard."
                                                            value={group.tone}
                                                            onChange={(e) => updateGroupTone(group.id, e.target.value)}
                                                        />
                                                    </div>
                                                    {extractionGroups.length > 1 && (
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => deleteGroup(group.id)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Row 2: Targets */}
                                                <div className="flex flex-wrap gap-2">
                                                    {group.targets.length === 0 && (
                                                        <span className="text-xs text-muted-foreground italic py-1">No targets selected</span>
                                                    )}
                                                    {group.targets.map(targetId => (
                                                        <Badge
                                                            key={targetId}
                                                            variant="secondary"
                                                            className="h-7 pl-2 pr-1 gap-1 text-xs font-normal"
                                                        >
                                                            {getExtractorLabel(targetId)}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive -mr-1"
                                                                onClick={() => removeTargetFromGroup(group.id, targetId)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* Row 3: Add Action */}
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 border-dashed gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                        onClick={() => openTaxonomyForGroup(group.id)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Add Targets
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <Button variant="ghost" className="w-full border border-dashed text-muted-foreground hover:text-foreground gap-2" onClick={addNewGroup}>
                                            <Plus className="h-4 w-4" />
                                            Add New Tone Strategy
                                        </Button>

                                        <TaxonomyPicker
                                            isOpen={isTaxonomyOpen}
                                            onClose={() => setIsTaxonomyOpen(false)}
                                            onAdd={handleAddTaxonomy}
                                            alreadySelected={activeGroupId
                                                ? extractionGroups.find(g => g.id === activeGroupId)?.targets || []
                                                : []
                                            }
                                        />
                                    </div>
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

                        <div className="mt-4 pt-4 border-t bg-background flex-shrink-0">
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing || (viewMode === 'main' && extractionGroups.every(g => g.targets.length === 0))}
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
