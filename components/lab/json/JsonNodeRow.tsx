"use client"

import * as React from "react"
import { Trash, Plus, Play, ChevronRight, ChevronDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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

import { JsonNode, JsonNodeType, VariableSource, AvailableVariable } from "../types"

interface JsonNodeRowProps {
    node: JsonNode
    depth?: number
    isParentArray?: boolean
    activeFieldId: string | null
    onUpdate: (node: JsonNode) => void
    onDelete: () => void
    onGenerate?: (id: string) => void
    setActiveFieldId: (id: string | null) => void
    fieldRef?: (id: string, el: HTMLTextAreaElement | null) => void
    availableVariables?: AvailableVariable[]
    onResolveToken?: (token: string) => string
    generatingNodeId?: string | null
}

export function JsonNodeRow({
    node,
    depth = 0,
    isParentArray = false,
    activeFieldId,
    onUpdate,
    onDelete,
    onGenerate,
    setActiveFieldId,
    availableVariables = [],
    onResolveToken,
    fieldRef,
    generatingNodeId
}: JsonNodeRowProps) {
    const [isExpanded, setIsExpanded] = React.useState(true)
    const isNodeGenerating = generatingNodeId === node.id

    const handleKeyChange = (key: string) => {
        onUpdate({ ...node, key })
    }

    const handleTypeChange = (type: JsonNodeType) => {
        onUpdate({ ...node, type, children: type !== 'string' ? node.children : [] })
    }

    const handleInstructionChange = (instruction: string) => {
        onUpdate({ ...node, instruction })
    }

    const handleAddChild = () => {
        const newChild: JsonNode = {
            id: Math.random().toString(36).substr(2, 9),
            key: node.type === 'array' ? '' : `key_${node.children.length + 1}`,
            type: 'string',
            instruction: '',
            children: []
        }
        onUpdate({ ...node, children: [...node.children, newChild] })
    }

    const handleUpdateChild = (index: number, updatedChild: JsonNode) => {
        const newChildren = [...node.children]
        newChildren[index] = updatedChild
        onUpdate({ ...node, children: newChildren })
    }

    const handleDeleteChild = (index: number) => {
        const newChildren = node.children.filter((_, i) => i !== index)
        onUpdate({ ...node, children: newChildren })
    }

    // Source Handlers
    const handleSourceChange = (sourceId: string, field: 'label' | 'content', text: string) => {
        const currentSources = node.sources || []
        const newSources = currentSources.map(s =>
            s.id === sourceId ? { ...s, [field]: text } : s
        )
        onUpdate({ ...node, sources: newSources })
    }

    const handleAddSource = (token?: string, label?: string) => {
        const currentSources = node.sources || []

        // Resolve content if token is provided
        let content = ''
        if (token && onResolveToken) {
            content = onResolveToken(token)
        }

        const newSource: VariableSource = {
            id: Math.random().toString(36).substr(2, 9),
            label: label || '',
            content
        }
        onUpdate({ ...node, sources: [...currentSources, newSource] })
    }

    const handleDeleteSource = (sourceId: string) => {
        const currentSources = node.sources || []
        const newSources = currentSources.filter(s => s.id !== sourceId)
        onUpdate({ ...node, sources: newSources })
    }

    return (
        <div className={cn("flex flex-col gap-2", depth > 0 && "ml-4")}>
            {/* Header Row */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/50 hover:border-border transition-colors">
                {(node.type === 'object' || node.type === 'array') && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                )}

                {!isParentArray && (
                    <Input
                        className="h-8 w-40 font-mono text-xs"
                        placeholder="Key"
                        value={node.key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                    />
                )}

                <Select value={node.type} onValueChange={(val) => handleTypeChange(val as JsonNodeType)}>
                    <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                >
                    <Trash className="h-3 w-3" />
                </Button>
            </div>

            {/* Body */}
            {isExpanded && (
                <div className={cn("flex flex-col gap-2", (node.type === 'object' || node.type === 'array') && "pl-4 border-l-2 border-muted")}>
                    {node.type === 'string' && (
                        <div className="p-3 border rounded-md bg-muted/20 mt-2 space-y-3 relative group">
                            {/* Sources List */}
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground font-medium">Variable Sources (Context)</label>
                                {(node.sources || []).map(source => (
                                    <div key={source.id} className="flex gap-2 items-start">
                                        <Input
                                            placeholder="Label"
                                            className="font-mono text-sm w-1/3 h-8 text-xs"
                                            value={source.label}
                                            onChange={(e) => handleSourceChange(source.id, 'label', e.target.value)}
                                        />
                                        <Textarea
                                            placeholder="Keywords..."
                                            className="font-mono text-sm w-2/3 min-h-[36px] h-9 resize-y text-xs bg-background/50"
                                            value={source.content}
                                            onChange={(e) => handleSourceChange(source.id, 'content', e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteSource(source.id)}
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
                                            className="w-full gap-2 border-dashed h-7 text-xs"
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
                                                    onClick={() => handleAddSource(v.token, v.label)}
                                                >
                                                    {v.label}
                                                </DropdownMenuItem>
                                            ))
                                        ) : (
                                            <DropdownMenuItem disabled>
                                                No variables available
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleAddSource()}>
                                            Custom Source
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Instruction */}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground font-medium">Instruction for this Key</label>
                                <div className="flex gap-2 items-end">
                                    <Textarea
                                        ref={(el) => fieldRef?.(node.id, el)}
                                        className={cn(
                                            "font-mono text-xs min-h-[60px] resize-y bg-background",
                                            activeFieldId === node.id && "ring-2 ring-ring"
                                        )}
                                        placeholder="Describe how to synthesize the sources..."
                                        value={node.instruction}
                                        onChange={(e) => handleInstructionChange(e.target.value)}
                                        onFocus={() => setActiveFieldId(node.id)}
                                    />
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn("h-8 w-8 shrink-0 mb-1", (!node.sources?.length || !node.instruction.trim() || generatingNodeId) && "opacity-50")}
                                        onClick={() => onGenerate?.(node.id)}
                                        disabled={!node.sources?.length || !node.instruction.trim() || !!generatingNodeId}
                                        title={(!node.sources?.length || !node.instruction.trim()) ? "Add at least one Source and an Instruction to generate." : "Generate Value"}
                                    >
                                        {isNodeGenerating ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Play className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(node.type === 'object' || node.type === 'array') && (
                        <div className="space-y-2">
                            {node.children.map((child, index) => (
                                <JsonNodeRow
                                    key={child.id}
                                    node={child}
                                    depth={depth + 1}
                                    isParentArray={node.type === 'array'}
                                    activeFieldId={activeFieldId}
                                    onUpdate={(updated) => handleUpdateChild(index, updated)}
                                    onDelete={() => handleDeleteChild(index)}
                                    onGenerate={onGenerate}
                                    setActiveFieldId={setActiveFieldId}
                                    fieldRef={fieldRef}
                                    availableVariables={availableVariables}
                                    onResolveToken={onResolveToken}
                                    generatingNodeId={generatingNodeId}
                                />
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed h-8 text-xs"
                                onClick={handleAddChild}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                {node.type === 'object' ? 'Add Key' : 'Add Item'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
