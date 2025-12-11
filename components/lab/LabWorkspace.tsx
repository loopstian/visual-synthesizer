"use client"

import * as React from "react"
import Link from "next/link"
import { Copy, FileCode, FlaskConical, GripVertical, ArrowLeft, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StudioShell } from "@/components/layout/StudioShell"
import { LabInventory } from "@/components/lab/LabInventory"
import { LabEditor, LabEditorHandle } from "@/components/lab/LabEditor"
import { EditorState, AvailableVariable, VariableSource, JsonNode, Block } from "@/components/lab/types"
import { useStudioStore } from "@/stores/useStudioStore"
import { compileString } from "@/utils/promptCompiler"
import { generateSegment, assembleParagraph, assembleMarkdown } from "@/utils/labGenerator"


// --- Helpers ---

const resolveNodeValue = (node: JsonNode, store: any): any => {
    if (node.type === 'string') {
        return node.generatedOutput || compileString(node.instruction, {
            assets: store.assets,
            components: store.components,
            mainSubject: "Subject Placeholder"
        })
    }
    if (node.type === 'object') {
        return node.children.reduce((acc: any, child) => {
            if (child.key) acc[child.key] = resolveNodeValue(child, store)
            return acc
        }, {})
    }
    if (node.type === 'array') {
        return node.children.map(child => resolveNodeValue(child, store))
    }
    return null
}

const buildPreview = (nodes: JsonNode[], isArray: boolean = false): any => {
    if (isArray) {
        return nodes.map(node => {
            if (node.type === 'string') return node.generatedOutput || node.instruction
            if (node.type === 'object') return buildPreview(node.children, false)
            if (node.type === 'array') return buildPreview(node.children, true)
            return null
        })
    } else {
        const obj: any = {}
        nodes.forEach(node => {
            if (node.type === 'string') obj[node.key] = node.generatedOutput || node.instruction
            if (node.type === 'object') obj[node.key] = buildPreview(node.children, false)
            if (node.type === 'array') obj[node.key] = buildPreview(node.children, true)
        })
        return obj
    }
}

// --- Main Component ---

export function LabWorkspace() {
    const store = useStudioStore()
    const {
        labMode, setLabMode,
        labTextBlocks, setLabTextBlocks,
        labMarkdownBlocks, setLabMarkdownBlocks,
        labJsonNodes, setLabJsonNodes
    } = useStudioStore()

    // Construct the unified editor state for the component
    const editorContent: EditorState = React.useMemo(() => {
        if (labMode === 'text') {
            return { mode: 'text', blocks: labTextBlocks }
        } else if (labMode === 'markdown') {
            return { mode: 'text', blocks: labMarkdownBlocks }
        } else {
            return { mode: 'json', nodes: labJsonNodes }
        }
    }, [labMode, labTextBlocks, labMarkdownBlocks, labJsonNodes])

    const handleLoadTemplate = (template: 'universal' | 'markdown' | 'json') => {
        if (template === 'universal') {
            setLabMode('text')
        } else if (template === 'markdown') {
            setLabMode('markdown')
        } else if (template === 'json') {
            setLabMode('json')
        }
    }

    const handleEditorChange = (newValue: EditorState) => {
        if (newValue.mode === 'text') {
            if (labMode === 'text') {
                setLabTextBlocks(newValue.blocks)
            } else if (labMode === 'markdown') {
                setLabMarkdownBlocks(newValue.blocks)
            }
        } else {
            setLabJsonNodes(newValue.nodes)
        }
    }

    const [assembledOutput, setAssembledOutput] = React.useState<string>("")
    const lastLoadedMode = React.useRef<string | null>(null)

    // Load persisted output when mode changes
    React.useEffect(() => {
        if (labMode === 'text' || labMode === 'markdown') {
            // Load Output
            const key = labMode === 'markdown' ? 'lab_output_markdown' : 'lab_output_text'
            const saved = localStorage.getItem(key)
            if (saved !== null) {
                setAssembledOutput(saved)
            } else {
                setAssembledOutput("")
            }
        } else {
            setAssembledOutput("")
        }
        lastLoadedMode.current = labMode
    }, [labMode])

    // Persist output when it changes
    React.useEffect(() => {
        if ((labMode === 'text' || labMode === 'markdown') && lastLoadedMode.current === labMode) {
            const key = labMode === 'markdown' ? 'lab_output_markdown' : 'lab_output_text'
            localStorage.setItem(key, assembledOutput)
        }
    }, [assembledOutput, labMode])



    const [generatingNodeId, setGeneratingNodeId] = React.useState<string | null>(null)
    const [generatingBlockId, setGeneratingBlockId] = React.useState<string | null>(null)
    const [isAssembling, setIsAssembling] = React.useState(false)
    const editorRef = React.useRef<LabEditorHandle>(null)

    // Derived Preview for JSON
    const jsonPreview = React.useMemo(() => {
        if (labMode === 'json') {
            // Treat root nodes as Object fields
            const rootObj = labJsonNodes.reduce((acc: any, node) => {
                if (node.key) acc[node.key] = resolveNodeValue(node, store)
                return acc
            }, {})
            return JSON.stringify(rootObj, null, 2)
        }
        return ""
    }, [labMode, labJsonNodes, store])

    // Compute available variables for the dropdown
    const availableVariables = React.useMemo<AvailableVariable[]>(() => {
        const { assets, components } = store
        const variables: AvailableVariable[] = []

        // Global keyword categories
        const globalAssets = assets.filter((a: any) => !a.componentId && a.analysisData)
        const categories = new Set<string>()
        globalAssets.forEach((asset: any) => {
            if (asset.analysisData) {
                Object.keys(asset.analysisData).forEach(key => categories.add(key))
            }
        })
        categories.forEach(cat => {
            const label = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')
            variables.push({ token: `{{${cat}}}`, label })
        })

        // Component descriptions
        components.forEach((comp: any) => {
            const nameKey = comp.name.toLowerCase().replace(/\s+/g, '_')
            variables.push({
                token: `{{component:${nameKey}}}`,
                label: `${comp.name} (Description)`
            })
            // Component keywords
            variables.push({
                token: `{{component:${nameKey}:keywords}}`,
                label: `${comp.name} (Keywords)`
            })
        })

        // Main subject
        variables.push({ token: '{{main_subject}}', label: 'Main Subject' })

        return variables
    }, [store])

    /**
     * Resolves a variable token to its actual data string.
     * Used for inserting real data instead of template variables.
     */
    const resolveTokenData = React.useCallback((token: string): string => {
        const state = useStudioStore.getState()
        const { assets, components } = state

        // Clean the token (remove {{ }} if present)
        const cleanToken = token.replace(/^\{\{|\}\}$/g, '').trim()

        // 1. Main Subject
        if (cleanToken === 'main_subject') {
            return state.mainSubject || ""
        }

        // 2. Component references
        if (cleanToken.startsWith('component:')) {
            const isKeywords = cleanToken.endsWith(':keywords')
            let componentNameKey = cleanToken.replace('component:', '')
            if (isKeywords) {
                componentNameKey = componentNameKey.replace(':keywords', '')
            }
            componentNameKey = componentNameKey.toLowerCase()

            const component = components.find(c =>
                c.name.toLowerCase().replace(/\s+/g, '_') === componentNameKey
            )

            if (!component) return token // Fallback

            if (isKeywords) {
                // Aggregate keywords from component's linked assets
                const componentAssets = assets.filter(a => a.componentId === component.id && a.analysisData)
                const keywords = new Set<string>()
                componentAssets.forEach(asset => {
                    Object.values(asset.analysisData!).forEach(values => {
                        values.forEach(v => keywords.add(v))
                    })
                })
                return keywords.size > 0 ? Array.from(keywords).join(', ') : token
            } else {
                // Return component description
                return component.generatedPrompt || token
            }
        }

        // 3. Global Keywords
        const globalAssets = assets.filter(a => !a.componentId && a.analysisData)
        const categoryKeywords = new Set<string>()

        globalAssets.forEach(asset => {
            if (asset.analysisData) {
                Object.entries(asset.analysisData).forEach(([key, values]) => {
                    if (key.toLowerCase() === cleanToken.toLowerCase()) {
                        values.forEach(v => categoryKeywords.add(v))
                    }
                })
            }
        })

        if (categoryKeywords.size > 0) {
            return Array.from(categoryKeywords).join(', ')
        }

        // Fallback
        return token
    }, [])

    // Handler for adding a variable from dropdown
    const handleAddVariable = React.useCallback((blockIndex: number, token: string) => {
        if (labMode !== 'text' && labMode !== 'markdown') return

        // Parse token to get label
        const cleanToken = token.replace(/^\{\{|\}\}$/g, '').trim()
        const label = cleanToken.charAt(0).toUpperCase() + cleanToken.slice(1).replace(/_/g, ' ')
        const content = resolveTokenData(token)

        const newSource: VariableSource = {
            id: Math.random().toString(36).substr(2, 9),
            label,
            content
        }

        const blocks = labMode === 'text' ? labTextBlocks : labMarkdownBlocks
        const newBlocks = [...blocks]
        const block = newBlocks[blockIndex]
        
        if (!block) return

        newBlocks[blockIndex] = {
            ...block,
            sources: [...block.sources, newSource]
        }

        if (labMode === 'text') {
            setLabTextBlocks(newBlocks)
        } else {
            setLabMarkdownBlocks(newBlocks)
        }
    }, [labMode, labTextBlocks, labMarkdownBlocks, resolveTokenData, setLabTextBlocks, setLabMarkdownBlocks])

    const handleGenerateBlock = async (idOrIndex: string | number) => {
        const isJsonMode = labMode === 'json'

        if (isJsonMode) {
            setGeneratingNodeId(idOrIndex.toString())
        } else {
            // Text Mode - idOrIndex is index (number)
            const blocks = labMode === 'text' ? labTextBlocks : labMarkdownBlocks
            if (typeof idOrIndex === 'number' && blocks[idOrIndex]) {
                setGeneratingBlockId(blocks[idOrIndex].id)
            }
        }

        try {
            if (labMode === 'json') {
                if (typeof idOrIndex !== 'string') return
                const id = idOrIndex

                // Helper to recursively find and update
                const updateNodeAndGenerate = async (nodes: JsonNode[]): Promise<JsonNode[]> => {
                    const results = await Promise.all(nodes.map(async (node) => {
                        if (node.id === id) {
                            // Construct variables from sources
                            const variables = (node.sources || []).map(s => ({
                                label: s.label,
                                content: s.content
                            }))

                            // Call API to generate segment. 
                            // Pass node.key as contextKey to improve context awareness
                            const result = await generateSegment(variables, node.instruction, node.key)
                            return { ...node, generatedOutput: result }
                        }
                        if (node.children) {
                            const updatedChildren = await updateNodeAndGenerate(node.children)
                            return { ...node, children: updatedChildren }
                        }
                        return node
                    }))
                    return results
                }

                const newNodes = await updateNodeAndGenerate(labJsonNodes)
                setLabJsonNodes(newNodes)

            } else {
                // Text Mode
                if (typeof idOrIndex !== 'number') return
                const index = idOrIndex
                const blocks = labMode === 'text' ? labTextBlocks : labMarkdownBlocks
                const block = blocks[index]
                if (!block) return

                // Pass structured sources to API
                const variables = block.sources.map(s => ({ label: s.label, content: s.content }))

                // Call API to generate segment
                const result = await generateSegment(variables, block.instruction)

                const newBlocks = [...blocks]
                newBlocks[index] = { ...newBlocks[index], generatedOutput: result }
                
                if (labMode === 'text') {
                    setLabTextBlocks(newBlocks)
                } else {
                    setLabMarkdownBlocks(newBlocks)
                }
            }
        } catch (error) {
            console.error('Generation error:', error)
            alert('Failed to generate segment. Check console for details.')
        } finally {
            setGeneratingNodeId(null)
            setGeneratingBlockId(null)
        }
    }

    const handleAssemble = async () => {
        if (labMode === 'text' || labMode === 'markdown') {
            setIsAssembling(true)
            try {
                const blocks = labMode === 'text' ? labTextBlocks : labMarkdownBlocks
                const segments = blocks
                    .map(b => b.generatedOutput)
                    .filter(Boolean) as string[]

                if (segments.length === 0) {
                    alert('Please generate some segments first')
                    return
                }

                // Call API to assemble paragraph or markdown
                let result = ""
                if (labMode === 'markdown') {
                    result = await assembleMarkdown(segments, store.settings)
                } else {
                    result = await assembleParagraph(segments)
                }
                setAssembledOutput(result)
            } catch (error) {
                console.error('Assembly error:', error)
                alert('Failed to assemble. Check console for details.')
            } finally {
                setIsAssembling(false)
            }
        }
    }

    const [isCopied, setIsCopied] = React.useState(false)

    // Unified Reactive Preview
    const previewContent = React.useMemo(() => {
        if (labMode === 'text') {
            return assembledOutput
        } else if (labMode === 'markdown') {
            return assembledOutput
        } else {
            // JSON Mode: Treat root nodes as Object fields
            const rootObj = buildPreview(labJsonNodes, false)
            return JSON.stringify(rootObj, null, 2)
        }
    }, [labMode, labTextBlocks, labMarkdownBlocks, labJsonNodes, assembledOutput])

    const handleCopy = () => {
        if (!previewContent) return
        navigator.clipboard.writeText(previewContent)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <StudioShell>
            <div className="h-screen w-full flex overflow-hidden">
                {/* Column A: Variable Inventory */}
                <div className="w-72 shrink-0 border-r bg-muted/10 p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 font-semibold">
                            <FlaskConical className="h-4 w-4" />
                            Variable Inventory
                        </div>
                    </div>
                    <LabInventory onInsert={(token) => {
                        // In text mode, add as a new variable source with resolved data
                        // In JSON mode, insert the token into the active field
                        if (labMode === 'text' || labMode === 'markdown') {
                            // Parse token to get label (e.g., "Colors" from "{{colors}}")
                            const cleanToken = token.replace(/^\{\{|\}\}$/g, '').trim()
                            const label = cleanToken.charAt(0).toUpperCase() + cleanToken.slice(1).replace(/_/g, ' ')
                            const content = resolveTokenData(token)

                            // Try to add to active block, if no block is active, create a new one first
                            const result = editorRef.current?.addVariableToActiveBlock(label, content)

                            // If no block was active, handle fallback
                            if (result === false) {
                                // Create a new block with this variable source
                                const newBlock: Block = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    sources: [{
                                        id: Math.random().toString(36).substr(2, 9),
                                        label,
                                        content
                                    }],
                                    instruction: '',
                                    generatedOutput: null
                                }
                                if (labMode === 'text') {
                                    setLabTextBlocks([...labTextBlocks, newBlock])
                                } else {
                                    setLabMarkdownBlocks([...labMarkdownBlocks, newBlock])
                                }
                            }
                        } else {
                            editorRef.current?.insertToken(token)
                        }
                    }} />
                </div>

                {/* Column B: The Workbench */}
                <div className="flex-1 bg-background p-6 flex flex-col gap-4">
                    <LabEditor
                        ref={editorRef}
                        value={editorContent}
                        onChange={handleEditorChange}
                        onGenerateBlock={handleGenerateBlock}
                        onAssemble={handleAssemble}
                        availableVariables={availableVariables}
                        onAddVariable={handleAddVariable}
                        onResolveToken={resolveTokenData}
                        mode={labMode}
                        onModeChange={setLabMode}
                        onLoadTemplate={handleLoadTemplate}
                        generatingNodeId={generatingNodeId}
                        generatingBlockId={generatingBlockId}
                    />
                </div>

                {/* Column C: The Preview */}
                <div className="w-96 shrink-0 border-l bg-muted/10 p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <FileCode className="h-4 w-4" />
                        Live Output
                    </div>

                    <div className="flex-1 rounded-md border bg-muted/50 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap text-muted-foreground">
                        {isAssembling ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="animate-pulse">Generating final result...</span>
                            </div>
                        ) : (
                            previewContent || "// Generate content to see preview..."
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2 transition-all duration-200"
                        onClick={handleCopy}
                        disabled={!previewContent}
                    >
                        {isCopied ? (
                            <>
                                <Check className="h-4 w-4 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </StudioShell>
    )
}
