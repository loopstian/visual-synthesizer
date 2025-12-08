"use client"

import * as React from "react"
import { Trash, Plus, Play, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { JsonNode, JsonNodeType } from "../types"

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
    fieldRef
}: JsonNodeRowProps) {
    const [isExpanded, setIsExpanded] = React.useState(true)

    const handleKeyChange = (key: string) => {
        onUpdate({ ...node, key })
    }

    const handleTypeChange = (type: JsonNodeType) => {
        // When switching to object/array, preserve instruction? Maybe not necessary.
        // If switching back to string, maybe preserve children? No, let's keep it simple.
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
                        <div className="relative group">
                            <Textarea
                                ref={(el) => fieldRef?.(node.id, el)}
                                className={cn(
                                    "font-mono text-sm min-h-[80px] text-xs resize-y",
                                    activeFieldId === node.id && "ring-2 ring-ring"
                                )}
                                placeholder="Value Instruction..."
                                value={node.instruction}
                                onChange={(e) => handleInstructionChange(e.target.value)}
                                onFocus={() => setActiveFieldId(node.id)}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onGenerate?.(node.id)}
                                    title="Generate"
                                >
                                    <Play className="h-3 w-3" />
                                </Button>
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
