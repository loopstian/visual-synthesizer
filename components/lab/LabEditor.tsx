"use client"

import * as React from "react"
import { Trash, Plus, Play, Pencil, Sparkles, X, Loader2 } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { JsonNode, JsonNodeType, VariableSource, AvailableVariable, EditorState, Block } from "./types"
import { JsonNodeRow } from "./json/JsonNodeRow"

export interface LabEditorHandle {
    insertToken: (token: string) => void // Keep for JSON mode
    addVariableToActiveBlock: (label: string, content: string) => boolean // New for text mode, returns true if added
}

interface LabEditorProps {
    value: EditorState
    onChange: (value: EditorState) => void
    onGenerateBlock?: (id: string | number) => void // Text Mode uses index (number), JSON uses ID (string)
    onAssemble?: () => void
    availableVariables?: AvailableVariable[]
    onAddVariable?: (blockIndex: number, token: string) => void
    onResolveToken?: (token: string) => string
    mode?: 'text' | 'json'
    onModeChange?: (mode: 'text' | 'json') => void
    generatingNodeId?: string | null
    generatingBlockId?: string | null
}

export const LabEditor = React.forwardRef<LabEditorHandle, LabEditorProps>(
    ({ value, onChange, onGenerateBlock, onAssemble, availableVariables = [], onAddVariable, onResolveToken, mode, onModeChange, generatingNodeId, generatingBlockId }, ref) => {
        // Text Mode State
        const [activeBlockIndex, setActiveBlockIndex] = React.useState<number | null>(null)
        const [activeInputType, setActiveInputType] = React.useState<'variable' | 'instruction' | null>(null)

        // JSON Mode State
        const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null)

        // Refs
        const variableRefs = React.useRef<Array<HTMLTextAreaElement | null>>([])
        const instructionRefs = React.useRef<Array<HTMLTextAreaElement | null>>([])
        const fieldMapRefs = React.useRef<Map<string, HTMLTextAreaElement | null>>(new Map())

        // Ensure refs map is clean on render
        fieldMapRefs.current.clear()

        // Helper to register refs from recursive children
        const registerFieldRef = (id: string, el: HTMLTextAreaElement | null) => {
            if (el) {
                fieldMapRefs.current.set(id, el)
            } else {
                fieldMapRefs.current.delete(id)
            }
        }

        // Helper to find node by ID (DFS)
        const findNodeById = (nodes: JsonNode[], id: string): JsonNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node
                if (node.children) {
                    const found = findNodeById(node.children, id)
                    if (found) return found
                }
            }
            return null
        }

        // Helper to update node by ID (DFS) - returns new nodes array
        const updateNodeById = (nodes: JsonNode[], id: string, updater: (n: JsonNode) => JsonNode): JsonNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return updater(node)
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateNodeById(node.children, id, updater) }
                }
                return node
            })
        }

        React.useImperativeHandle(ref, () => ({
            insertToken: (token: string) => {
                // For JSON Mode only - Text Mode now uses addVariableToActiveBlock
                if (value.mode === 'json') {
                    if (!activeFieldId) return

                    const fieldRef = fieldMapRefs.current.get(activeFieldId)
                    if (!fieldRef) return

                    const node = findNodeById(value.nodes, activeFieldId)
                    if (!node) return

                    const start = fieldRef.selectionStart
                    const end = fieldRef.selectionEnd
                    const currentInstruction = node.instruction
                    const newInstruction =
                        currentInstruction.substring(0, start) + token + currentInstruction.substring(end)

                    const newNodes = updateNodeById(value.nodes, activeFieldId, (n) => ({
                        ...n,
                        instruction: newInstruction
                    }))

                    onChange({ ...value, nodes: newNodes })

                    setTimeout(() => {
                        const newCursorPos = start + token.length
                        fieldRef.selectionStart = newCursorPos
                        fieldRef.selectionEnd = newCursorPos
                        fieldRef.focus()
                    }, 0)
                }
            },
            addVariableToActiveBlock: (label: string, content: string): boolean => {
                if (value.mode !== 'text') return false
                if (activeBlockIndex === null) return false

                const newSource: VariableSource = {
                    id: Math.random().toString(36).substr(2, 9),
                    label,
                    content
                }

                const newBlocks = [...value.blocks]
                const block = newBlocks[activeBlockIndex]
                newBlocks[activeBlockIndex] = {
                    ...block,
                    sources: [...block.sources, newSource]
                }
                onChange({ ...value, blocks: newBlocks })
                return true
            }
        }))

        const handleTemplateChange = (template: string) => {
            if (template === "universal") {
                onModeChange?.('text')
            } else if (template === "json") {
                onModeChange?.('json')
            }
        }

        // --- Text Mode Handlers ---
        const handleAddBlock = () => {
            if (value.mode === 'text') {
                onChange({
                    ...value,
                    blocks: [...value.blocks, {
                        id: Math.random().toString(36).substr(2, 9),
                        sources: [],
                        instruction: '',
                        generatedOutput: null
                    }]
                })
            }
        }

        const handleDeleteBlock = (index: number) => {
            if (value.mode === 'text') {
                const newBlocks = value.blocks.filter((_, i) => i !== index)
                onChange({ ...value, blocks: newBlocks })
                if (activeBlockIndex === index) setActiveBlockIndex(null)
            }
        }

        const handleSourceChange = (blockIndex: number, sourceId: string, field: 'label' | 'content', text: string) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                const block = newBlocks[blockIndex]
                const newSources = block.sources.map(s =>
                    s.id === sourceId ? { ...s, [field]: text } : s
                )
                newBlocks[blockIndex] = { ...block, sources: newSources }
                onChange({ ...value, blocks: newBlocks })
            }
        }

        const handleAddSource = (blockIndex: number) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                const block = newBlocks[blockIndex]
                const newSource: VariableSource = {
                    id: Math.random().toString(36).substr(2, 9),
                    label: '',
                    content: ''
                }
                newBlocks[blockIndex] = { ...block, sources: [...block.sources, newSource] }
                onChange({ ...value, blocks: newBlocks })
            }
        }

        const handleDeleteSource = (blockIndex: number, sourceId: string) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                const block = newBlocks[blockIndex]
                const newSources = block.sources.filter(s => s.id !== sourceId)
                newBlocks[blockIndex] = { ...block, sources: newSources }
                onChange({ ...value, blocks: newBlocks })
            }
        }

        const handleInstructionChange = (blockIndex: number, text: string) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                newBlocks[blockIndex] = { ...newBlocks[blockIndex], instruction: text }
                onChange({ ...value, blocks: newBlocks })
            }
        }

        const handleEditBlock = (index: number) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                newBlocks[index] = { ...newBlocks[index], generatedOutput: null }
                onChange({ ...value, blocks: newBlocks })
            }
        }

        // --- JSON Mode Handlers ---
        const handleAddRootNode = () => {
            if (value.mode === 'json') {
                const newNode: JsonNode = {
                    id: Math.random().toString(36).substr(2, 9),
                    key: 'new_key',
                    type: 'string',
                    instruction: '',
                    children: []
                }
                onChange({ ...value, nodes: [...value.nodes, newNode] })
            }
        }

        return (
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-semibold">Prompt Construction</h2>
                    <Select
                        value={(mode || value.mode) === 'text' ? 'universal' : 'json'}
                        onValueChange={handleTemplateChange}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Load Template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="universal">Universal Text</SelectItem>
                            <SelectItem value="json">Structured JSON</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {value.mode === 'text' ? (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {value.blocks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 border-2 border-dashed rounded-lg p-8">
                                <p>No text blocks yet.</p>
                                <Button variant="outline" onClick={handleAddBlock}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Text Block
                                </Button>
                            </div>
                        ) : (
                            <>
                                {value.blocks.map((block, index) => (
                                    // ... Existing Block Rendering ...
                                    <div key={block.id} className="p-4 border rounded-md bg-card space-y-3 relative group">
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDeleteBlock(index)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {block.generatedOutput ? (
                                            // View Mode
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap gap-1">
                                                        {block.sources.map(s => (
                                                            <Badge key={s.id} variant="outline" className="text-xs font-mono">
                                                                {s.label || "Unlabeled"}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 gap-1 text-muted-foreground mr-8"
                                                        onClick={() => handleEditBlock(index)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded italic text-sm border-l-2 border-primary/50 text-foreground">
                                                    {block.generatedOutput}
                                                </div>
                                            </div>
                                        ) : (
                                            // Edit Mode
                                            <div
                                                className="space-y-3"
                                                onClick={() => setActiveBlockIndex(index)}
                                            >
                                                {/* Sources List */}
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground font-medium">Variable Sources</label>
                                                    {block.sources.map(source => (
                                                        <div key={source.id} className="flex gap-2 items-start">
                                                            <Input
                                                                placeholder="Label (e.g., Colors)"
                                                                className="font-mono text-sm w-1/3"
                                                                value={source.label}
                                                                onChange={(e) => handleSourceChange(index, source.id, 'label', e.target.value)}
                                                            />
                                                            <Textarea
                                                                placeholder="Keywords..."
                                                                className="font-mono text-sm w-2/3 min-h-[40px] resize-y bg-muted/50"
                                                                value={source.content}
                                                                onChange={(e) => handleSourceChange(index, source.id, 'content', e.target.value)}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteSource(index, source.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full gap-2 border-dashed"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add Source
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-56">
                                                            {availableVariables.length > 0 ? (
                                                                availableVariables.map((v) => (
                                                                    <DropdownMenuItem
                                                                        key={v.token}
                                                                        onClick={() => onAddVariable?.(index, v.token)}
                                                                    >
                                                                        {v.label}
                                                                    </DropdownMenuItem>
                                                                ))
                                                            ) : (
                                                                <DropdownMenuItem disabled>
                                                                    No variables available
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Instruction */}
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground font-medium">Instruction / How to Transform</label>
                                                    <Textarea
                                                        ref={el => { instructionRefs.current[index] = el }}
                                                        placeholder="E.g., Describe these colors poetically..."
                                                        className="font-mono text-sm h-20 resize-y"
                                                        value={block.instruction}
                                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                                    />
                                                </div>

                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className={cn("w-full gap-2", (!block.sources.length || !block.instruction.trim() || generatingBlockId) && "opacity-50")}
                                                    onClick={() => onGenerateBlock?.(index)}
                                                    disabled={block.sources.length === 0 || !block.instruction.trim() || !!generatingBlockId}
                                                    title={(!block.sources.length || !block.instruction.trim()) ? "Add at least one Source and an Instruction to generate." : "Generate"}
                                                >
                                                    {generatingBlockId === block.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Play className="h-3 w-3" />
                                                    )}
                                                    Generate Segment
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="flex items-center gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 gap-2 border-dashed" onClick={handleAddBlock}>
                                        <Plus className="h-4 w-4" />
                                        Add Text Block
                                    </Button>
                                    <Button
                                        className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={onAssemble}
                                        disabled={value.blocks.some(b => !b.generatedOutput)}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Assemble Final Paragraph
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // JSON Mode - Recursive Tree
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {value.nodes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 border-2 border-dashed rounded-lg p-8">
                                <p>Start your JSON Tree.</p>
                                <Button variant="outline" onClick={handleAddRootNode}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Root Key
                                </Button>
                            </div>
                        ) : (
                            <>
                                {value.nodes.map((node, index) => (
                                    <JsonNodeRow
                                        key={node.id}
                                        node={node}
                                        activeFieldId={activeFieldId}
                                        setActiveFieldId={setActiveFieldId}
                                        fieldRef={registerFieldRef}
                                        onUpdate={(updated) => {
                                            const newNodes = [...value.nodes]
                                            newNodes[index] = updated
                                            onChange({ ...value, nodes: newNodes })
                                        }}
                                        onDelete={() => {
                                            const newNodes = value.nodes.filter((_, i) => i !== index)
                                            onChange({ ...value, nodes: newNodes })
                                        }}
                                        onGenerate={(id) => onGenerateBlock?.(id)}
                                        availableVariables={availableVariables}
                                        onResolveToken={onResolveToken}
                                        generatingNodeId={generatingNodeId}
                                    />
                                ))}
                                <Button variant="outline" className="w-full gap-2 border-dashed" onClick={handleAddRootNode}>
                                    <Plus className="h-4 w-4" />
                                    Add Root Key
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        )
    }
)

LabEditor.displayName = "LabEditor"
