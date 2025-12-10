"use client"

import * as React from "react"
import Link from "next/link"
import { Album, Sparkles, FolderSync, Check, CheckCircle2, Pencil, FlaskConical, Loader2, Copy, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { ComponentDetailsModal } from "@/components/studio/modals/ComponentDetailsModal"
import { KeywordSection } from "@/components/studio/drawer/KeywordSection"

import { useStudioStore, ComponentFolder } from "@/stores/useStudioStore"

export function SynthesizerDrawer() {
    const { assets, viewMode, activeComponentId, components, saveComponentPrompt, setViewMode, setActiveComponent, mainSubject, setMainSubject } = useStudioStore()
    const [subjectText, setSubjectText] = React.useState("")
    const [viewingComponent, setViewingComponent] = React.useState<ComponentFolder | null>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [generationResult, setGenerationResult] = React.useState<string | null>(null)

    // Sync subjectText with active component's saved prompt or mainSubject
    React.useEffect(() => {
        if (viewMode === 'component' && activeComponentId) {
            const activeComponent = components.find(c => c.id === activeComponentId)
            if (activeComponent) {
                setSubjectText(activeComponent.generatedPrompt || "")
            }
        } else if (viewMode === 'main') {
            setSubjectText(mainSubject || "")
        }
    }, [viewMode, activeComponentId, components, mainSubject])

    const readyComponents = React.useMemo(() => {
        return components.filter(c => c.generatedPrompt && c.generatedPrompt.length > 0)
    }, [components])

    // Aggregate keywords from all analyzed assets
    const aggregatedKeywords = React.useMemo(() => {
        const aggregation: Record<string, Set<string>> = {}

        assets
            .filter(asset => {
                if (viewMode === 'component' && activeComponentId) {
                    return asset.componentId === activeComponentId
                }
                if (viewMode === 'main') {
                    return !asset.componentId
                }
                return false
            })
            .forEach(asset => {
                if (asset.analysisData) {
                    Object.entries(asset.analysisData).forEach(([key, values]) => {
                        if (viewMode === 'component') {
                            // In component mode, flatten everything into a single "Extracted Elements" key
                            const flatKey = "Extracted Elements"
                            if (!aggregation[flatKey]) {
                                aggregation[flatKey] = new Set()
                            }
                            values.forEach(v => aggregation[flatKey].add(v))
                        } else {
                            // Skip Subject as it has its own dedicated input field
                            if (key === 'Subject') return

                            if (!aggregation[key]) {
                                aggregation[key] = new Set()
                            }
                            values.forEach(v => aggregation[key].add(v))
                        }
                    })
                }
            })

        // Convert Sets to arrays
        const result: Record<string, string[]> = {}
        Object.entries(aggregation).forEach(([key, values]) => {
            result[key] = Array.from(values)
        })

        return result
    }, [assets, viewMode, activeComponentId])

    const getComponentKeywords = React.useCallback((componentId: string) => {
        const keywords = new Set<string>()
        assets
            .filter(asset => asset.componentId === componentId && asset.analysisData)
            .forEach(asset => {
                // Flatten all values from all keys
                Object.values(asset.analysisData!).forEach(values => {
                    values.forEach(v => keywords.add(v))
                })
            })
        return Array.from(keywords)
    }, [assets])

    const handleAction = async () => {
        if (viewMode === 'component' && activeComponentId) {
            // Component Mode: Direct Save & Return (No AI)
            saveComponentPrompt(activeComponentId, subjectText)
            setActiveComponent(null)
            setViewMode('main')
            setSubjectText("")
        }
    }

    const hasData = Object.keys(aggregatedKeywords).length > 0

    // Validation Logic
    const isSaveDisabled = React.useMemo(() => {
        if (viewMode === 'component') {
            const hasDescription = subjectText.trim().length > 0
            // Check if we have any actual keywords in the values
            const hasKeywords = Object.values(aggregatedKeywords).some(list => list.length > 0)
            return !hasDescription || !hasKeywords
        }
        return false
    }, [viewMode, subjectText, aggregatedKeywords])

    const isMainActionDisabled = React.useMemo(() => {
        if (viewMode === 'main') {
            return !subjectText.trim()
        }
        return false
    }, [viewMode, subjectText])

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-center border-b px-4">
                <span className="font-semibold">Synthesizer</span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                {/* Section 1: Core Inputs */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="main-subject">
                            {viewMode === 'component' ? 'Component Description' : 'Main Subject'}
                        </Label>
                        <Textarea
                            id="main-subject"
                            placeholder={viewMode === 'component'
                                ? "Describe the specific component (e.g., 'A futuristic neon city background')..."
                                : "E.g., A cybernetic samurai..."
                            }
                            className="resize-none"
                            value={subjectText}
                            onChange={(e) => {
                                const newVal = e.target.value
                                setSubjectText(newVal)
                                if (viewMode === 'main') {
                                    setMainSubject(newVal)
                                }
                            }}
                        />
                        {viewMode === 'component' && !subjectText.trim() && (
                            <span className="text-xs text-muted-foreground text-orange-400">
                                * Description required to save
                            </span>
                        )}
                        {viewMode === 'main' && !subjectText.trim() && (
                            <span className="text-xs text-muted-foreground text-blue-400">
                                * Subject required to proceed
                            </span>
                        )}
                    </div>
                </div>

                {/* Optional: Ready Components (Main Mode only) */}
                {viewMode === 'main' && readyComponents.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Ready Components</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="space-y-2">
                            {readyComponents.map((comp) => (
                                <div
                                    key={comp.id}
                                    className="p-3 rounded-md border bg-muted/20 flex items-start gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
                                    onClick={() => setViewingComponent(comp)}
                                >
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">{comp.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5" title={comp.generatedPrompt}>
                                            {comp.generatedPrompt}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                    </div>
                )}

                {/* Section 2: The Stack */}
                {hasData ? (
                    viewMode === 'component' ? (
                        <div className="space-y-2">
                            <Label>Extracted Elements</Label>
                            <div className="flex flex-wrap gap-2">
                                {aggregatedKeywords["Extracted Elements"]?.map((keyword) => (
                                    <Badge key={keyword} variant="secondary">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Accordion type="multiple" defaultValue={Object.keys(aggregatedKeywords)} className="w-full">
                            {Object.entries(aggregatedKeywords).map(([category, keywords]) => (
                                <AccordionItem key={category} value={category.toLowerCase()}>
                                    <AccordionTrigger>{category}</AccordionTrigger>
                                    <AccordionContent>
                                        <KeywordSection keywords={keywords} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )
                ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                        No images analyzed. <br /> Select an image and extract data to populate this stack.
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="shrink-0 z-10 border-t bg-background p-4">
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Daily Credits: 5/5</span>
                    <span className="h-1.5 w-16 rounded-full bg-primary/20">
                        <div className="h-full w-full rounded-full bg-primary" />
                    </span>
                </div>

                {viewMode === 'main' ? (
                    <>
                        <Link href={!isMainActionDisabled ? "/lab" : "#"} className="w-full block">
                            <Button
                                variant="default"
                                className="w-full gap-2 font-semibold"
                                disabled={isMainActionDisabled}
                            >
                                <FlaskConical className="h-4 w-4" />
                                Open in Lab
                            </Button>
                        </Link>
                        {isMainActionDisabled && (
                            <p className="text-xs text-center mt-2 text-muted-foreground">
                                Enter a main subject to proceed to the Lab.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            size="lg"
                            className="w-full gap-2 font-semibold"
                            onClick={handleAction}
                            disabled={isGenerating || isSaveDisabled}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Save & Return
                                </>
                            )}
                        </Button>
                        {isSaveDisabled && (
                            <p className="text-xs text-center mt-2 text-muted-foreground">
                                Add a description and extract keywords to save.
                            </p>
                        )}
                    </>
                )}
            </div>
            {/* Component Details Modal */}
            <ComponentDetailsModal
                isOpen={!!viewingComponent}
                onClose={() => setViewingComponent(null)}
                component={viewingComponent}
                keywords={viewingComponent ? getComponentKeywords(viewingComponent.id) : []}
                onEdit={() => {
                    if (viewingComponent) {
                        setActiveComponent(viewingComponent.id)
                        setViewMode('component')
                        setViewingComponent(null)
                    }
                }}
            />
        </div>
    )
}

