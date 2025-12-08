"use client"

import * as React from "react"
import { Trash, Plus, Play, Pencil, Sparkles } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { JsonNode, JsonNodeType } from "./types"
import { JsonNodeRow } from "./json/JsonNodeRow"

export type Block = {
    id: string
    variable: string
    instruction: string
    generatedOutput: string | null
}

export type EditorState =
    | { mode: 'text', blocks: Block[] }
    | { mode: 'json', nodes: JsonNode[] }

export interface LabEditorHandle {
    insertToken: (token: string) => void
}

interface LabEditorProps {
    value: EditorState
    onChange: (value: EditorState) => void
    onGenerateBlock?: (id: string | number) => void // Text Mode uses index (number), JSON uses ID (string)
    onAssemble?: () => void
}

export const LabEditor = React.forwardRef<LabEditorHandle, LabEditorProps>(
    ({ value, onChange, onGenerateBlock, onAssemble }, ref) => {
        // Text Mode State
        const [activeBlockIndex, setActiveBlockIndex] = React.useState<number | null>(null)
        const [activeInputType, setActiveInputType] = React.useState<'variable' | 'instruction' | null>(null)

        // JSON Mode State
        const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null)

        // Refs
        const variableRefs = React.useRef<Array<HTMLInputElement | null>>([])
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
                if (value.mode === 'text') {
                    if (activeBlockIndex === null) return

                    if (activeInputType === 'variable') {
                        const input = variableRefs.current[activeBlockIndex]
                        if (!input) return
                        const start = input.selectionStart || 0
                        const end = input.selectionEnd || 0
                        const current = value.blocks[activeBlockIndex].variable
                        const newValue = current.substring(0, start) + token + current.substring(end)

                        const newBlocks = [...value.blocks]
                        newBlocks[activeBlockIndex] = { ...newBlocks[activeBlockIndex], variable: newValue }
                        onChange({ ...value, blocks: newBlocks })

                        setTimeout(() => {
                            const newPos = start + token.length
                            input.setSelectionRange(newPos, newPos)
                            input.focus()
                        }, 0)

                    } else if (activeInputType === 'instruction') {
                        const textarea = instructionRefs.current[activeBlockIndex]
                        if (!textarea) return
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const current = value.blocks[activeBlockIndex].instruction
                        const newValue = current.substring(0, start) + token + current.substring(end)

                        const newBlocks = [...value.blocks]
                        newBlocks[activeBlockIndex] = { ...newBlocks[activeBlockIndex], instruction: newValue }
                        onChange({ ...value, blocks: newBlocks })

                        setTimeout(() => {
                            const newPos = start + token.length
                            textarea.selectionStart = newPos
                            textarea.selectionEnd = newPos
                            textarea.focus()
                        }, 0)
                    }
                } else {
                    // JSON Mode logic
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
        }))

        const handleTemplateChange = (template: string) => {
            if (template === "universal") {
                onChange({
                    mode: 'text',
                    blocks: [
                        { id: '1', variable: '{{main_subject}}', instruction: 'Describe the subject in detail.', generatedOutput: null },
                        { id: '2', variable: '{{vibe}}', instruction: 'Apply this style heavily.', generatedOutput: null }
                    ]
                })
            } else if (template === "json") {
                onChange({
                    mode: 'json',
                    nodes: [
                        {
                            id: 'root_subject',
                            key: "subject",
                            type: 'string',
                            instruction: "{{main_subject}}",
                            children: []
                        },
                        {
                            id: 'root_style',
                            key: "style",
                            type: 'array',
                            instruction: "",
                            children: [
                                { id: 'style_1', key: '', type: 'string', instruction: '{{colors}}', children: [] },
                                { id: 'style_2', key: '', type: 'string', instruction: '{{vibe}}', children: [] }
                            ]
                        }
                    ]
                })
            }
        }

        // --- Text Mode Handlers ---
        const handleAddBlock = () => {
            if (value.mode === 'text') {
                onChange({
                    ...value,
                    blocks: [...value.blocks, {
                        id: Math.random().toString(36).substr(2, 9),
                        variable: '',
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

        const handleBlockChange = (index: number, field: 'variable' | 'instruction', text: string) => {
            if (value.mode === 'text') {
                const newBlocks = [...value.blocks]
                newBlocks[index] = { ...newBlocks[index], [field]: text }
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
                        value={value.mode === 'text' ? 'universal' : 'json'}
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
                        {value.blocks.map((block, index) => (
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
                                            <Badge variant="outline" className="text-xs font-mono">
                                                {block.variable || "No Variable"}
                                            </Badge>
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
                                    <>
                                        <div className="space-y-1">
                                            <Input
                                                ref={el => { variableRefs.current[index] = el }}
                                                placeholder="Variable, e.g., {{colors}}"
                                                className="font-mono text-sm"
                                                value={block.variable}
                                                onChange={(e) => handleBlockChange(index, 'variable', e.target.value)}
                                                onFocus={() => {
                                                    setActiveBlockIndex(index)
                                                    setActiveInputType('variable')
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Textarea
                                                ref={el => { instructionRefs.current[index] = el }}
                                                placeholder="Instruction, e.g., Describe these poetically..."
                                                className="font-mono text-sm h-20 resize-y"
                                                value={block.instruction}
                                                onChange={(e) => handleBlockChange(index, 'instruction', e.target.value)}
                                                onFocus={() => {
                                                    setActiveBlockIndex(index)
                                                    setActiveInputType('instruction')
                                                }}
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => onGenerateBlock?.(index)}
                                        >
                                            <Play className="h-3 w-3" />
                                            Generate Segment
                                        </Button>
                                    </>
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
                    </div>
                ) : (
                    // JSON Mode - Recursive Tree
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
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
                            />
                        ))}
                        <Button variant="outline" className="w-full gap-2 border-dashed" onClick={handleAddRootNode}>
                            <Plus className="h-4 w-4" />
                            Add Root Key
                        </Button>
                    </div>
                )}
            </div>
        )
    }
)

LabEditor.displayName = "LabEditor"
