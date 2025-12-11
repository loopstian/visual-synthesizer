"use client"

import * as React from "react"
import { FlaskConical, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStudioStore } from "@/stores/useStudioStore"

interface LabInventoryProps {
    onInsert: (token: string) => void
}

export function LabInventory({ onInsert }: LabInventoryProps) {
    const { assets, components } = useStudioStore()

    const variables = React.useMemo(() => {
               const core = ['{{main_subject}}']


        // Filter components: Only show if they have a non-empty generated prompt
        const componentVars = components
            .filter(c => c.generatedPrompt && c.generatedPrompt.trim().length > 0)
            .map(c => {
                const nameKey = c.name.toLowerCase().replace(/\s+/g, '_')

                // Check for linked assets with analysis data
                const hasKeywords = assets.some(a =>
                    a.componentId === c.id &&
                    a.analysisData &&
                    Object.values(a.analysisData).some(arr => arr.length > 0)
                )

                return {
                    name: c.name,
                    descriptionToken: `{{component:${nameKey}}}`,
                    keywordsToken: hasKeywords ? `{{component:${nameKey}:keywords}}` : null
                }
            })

        // Aggregate global keywords to check for existence
        const aggregation: Record<string, Set<string>> = {}
        assets.forEach(asset => {
            if (asset.analysisData) {
                Object.entries(asset.analysisData).forEach(([key, values]) => {
                    if (!aggregation[key]) {
                        aggregation[key] = new Set()
                    }
                    values.forEach(v => aggregation[key].add(v))
                })
            }
        })

        // Only include global keys that have active extracted values
        const globals = Object.entries(aggregation)
            .filter(([key, set]) => set.size > 0 && key !== 'Subject')
            .map(([key]) => `{{${key.toLowerCase().replace(/\s+/g, '_')}}}`)

        return { core, components: componentVars, globals }
    }, [assets, components])

    const hasDynamic = variables.components.length > 0 || variables.globals.length > 0

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header removed as it is now in LabWorkspace */}

            <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-6">
                    {/* Core Group */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Core</Label>
                        <div className="flex flex-col gap-2">
                            {variables.core.map(token => (
                                <div
                                    key={token}
                                    className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent cursor-pointer transition-colors group"
                                    onClick={() => onInsert(token)}
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    <code className="text-sm font-mono text-primary">{token}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Components Group */}
                    {variables.components.length > 0 && (
                        <div className="space-y-4">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Components</Label>
                            <div className="flex flex-col gap-4 pl-2 border-l-2 border-muted/50">
                                {variables.components.map((comp) => (
                                    <div key={comp.name} className="flex flex-col gap-2">
                                        <div className="text-xs font-semibold text-foreground/80">{comp.name}</div>
                                        {/* Description Chip */}
                                        <div
                                            className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent cursor-pointer transition-colors group"
                                            onClick={() => onInsert(comp.descriptionToken)}
                                            title="Insert generated description"
                                        >
                                            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase">Description</span>
                                                <code className="text-sm font-mono text-blue-500">{comp.descriptionToken}</code>
                                            </div>
                                        </div>

                                        {/* Keywords Chip (Conditional) */}
                                        {comp.keywordsToken && (
                                            <div
                                                className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent cursor-pointer transition-colors group"
                                                onClick={() => onInsert(comp.keywordsToken!)}
                                                title="Insert raw extracted keywords"
                                            >
                                                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase">Keywords</span>
                                                    <code className="text-sm font-mono text-amber-500">{comp.keywordsToken}</code>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Globals Group */}
                    {variables.globals.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Global Styles</Label>
                            <div className="flex flex-col gap-2">
                                {variables.globals.map(token => (
                                    <div
                                        key={token}
                                        className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent cursor-pointer transition-colors group"
                                        onClick={() => onInsert(token)}
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        <code className="text-sm font-mono text-purple-500">{token}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!hasDynamic && (
                        <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-md bg-muted/20">
                            <FlaskConical className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                            <p className="text-xs text-muted-foreground">
                                No extracted variables found. <br />
                                Go back to the Studio to analyze images or create components.
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
