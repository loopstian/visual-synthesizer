"use client"

import * as React from "react"
import Link from "next/link"
import { Copy, FileCode, FlaskConical, GripVertical, ArrowLeft } from "lucide-react"

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
import { LabEditor, LabEditorHandle, EditorState } from "@/components/lab/LabEditor"
// Recursive Tree Compiler
const compileJsonTree = (nodes: JsonNode[], store: any): any => {
    // If we are processing a list of nodes, they effectively form an object (key-value pairs)
    // UNLESS they are children of an Array node, in which case they form a list of values.
    // But this function signature takes `nodes`.
    // We need to know if we are building an Array or an Object.
    // Let's refactor: this function resolves a list of nodes into... an Object?
    // Wait, the children of an Array Node are nodes.
    // If I map them: `node.children.map(child => resolve(child))`.

    // Let's define a resolver for a SINGLE node first.
    // But the root is a list of nodes.

    // We'll treat the ROOT as an Object.
    return nodes.reduce((acc: any, node) => {
        // If the node is in an object context, it has a key.
        if (node.key) {
            acc[node.key] = resolveNodeValue(node, store)
        }
        return acc
    }, {})
}

const resolveNodeValue = (node: JsonNode, store: any): any => {
    if (node.type === 'string') {
        // Use generatedOutput if available, otherwise compile on demand (or show raw instruction?)
        // The prompt asked to "compileString(node.instruction)".
        // We'll prioritize generatedOutput to respect the "Generate" button,
        // fallback to compiled instruction for "Live Preview" feel.
        return node.generatedOutput || compileString(node.instruction, {
            assets: store.assets,
            components: store.components,
            mainSubject: "Subject Placeholder"
        })
    }
    if (node.type === 'object') {
        // Children form an object
        return node.children.reduce((acc: any, child) => {
            if (child.key) acc[child.key] = resolveNodeValue(child, store)
            return acc
        }, {})
    }
    if (node.type === 'array') {
        // Children form an array (ignore keys)
        return node.children.map(child => resolveNodeValue(child, store))
    }
    return null
}

import { useStudioStore } from "@/stores/useStudioStore"
import { compileString } from "@/utils/promptCompiler"
import { JsonNode, JsonNodeType } from "@/components/lab/types"

// Helper to flatten tree into preview JSON
const flattenJson = (nodes: JsonNode[]): any => {
    const result: any = {}

    nodes.forEach(node => {
        let value: any
        if (node.type === 'object') {
            value = flattenJson(node.children)
        } else if (node.type === 'array') {
            value = node.children.map(child => {
                if (child.type === 'object') return flattenJson(child.children)
                if (child.type === 'array') return [] // Nested arrays init
                return child.generatedOutput || child.instruction // fallback to instruction if no output? or null?
            })
        } else {
            // String
            value = node.generatedOutput || node.instruction // Use generated or raw instruction
        }

        // For array parents, keys don't matter in the same way, but here we process list of nodes.
        // If this list of nodes belongs to an Object, we use keys.
        // If it belongs to an Array, we just push values.
        // But `flattenJson` is called on `node.children`.
        // We need context if we are in an Array or Object?
        // Actually, JsonNode structure implies `children` of an Array node are the items.
        // But `flattenJson` takes `nodes`.
        // Let's refine:
    })
    return result
}

// Improved Recursive Flattening
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

export function LabWorkspace() {
    const store = useStudioStore()
    const [editorContent, setEditorContent] = React.useState<EditorState>({
        mode: 'text',
        blocks: [
            { id: 'default-block-1', variable: '', instruction: '', generatedOutput: null }
        ]
    })
    const [previewJson, setPreviewJson] = React.useState<Record<string, string>>({}) // DEPRECATED implicitly by new build logic?
    // We can compute preview on the fly or store it.
    // Let's compute it during render or useMemo to avoid state sync issues.

    const [assembledOutput, setAssembledOutput] = React.useState<string>("")
    const editorRef = React.useRef<LabEditorHandle>(null)

    // Derived Preview for JSON
    const jsonPreview = React.useMemo(() => {
        if (editorContent.mode === 'json') {
            // Treat root nodes as Object fields
            const rootObj = editorContent.nodes.reduce((acc: any, node) => {
                if (node.key) acc[node.key] = resolveNodeValue(node, store)
                return acc
            }, {})
            return JSON.stringify(rootObj, null, 2)
        }
        return ""
    }, [editorContent, store])

    const handleGenerateBlock = (idOrIndex: string | number) => {
        if (editorContent.mode === 'json') {
            if (typeof idOrIndex !== 'string') return
            const id = idOrIndex

            // Helper to recursively find and update
            const updateNodeAndGenerate = (nodes: JsonNode[]): JsonNode[] => {
                return nodes.map(node => {
                    if (node.id === id) {
                        const result = compileString(node.instruction, {
                            assets: store.assets,
                            components: store.components,
                            mainSubject: "Subject Placeholder"
                        })
                        return { ...node, generatedOutput: result }
                    }
                    if (node.children) {
                        return { ...node, children: updateNodeAndGenerate(node.children) }
                    }
                    return node
                })
            }

            const newNodes = updateNodeAndGenerate(editorContent.nodes)
            setEditorContent({ ...editorContent, nodes: newNodes })

        } else {
            // Text Mode
            if (typeof idOrIndex !== 'number') return
            const index = idOrIndex
            const block = editorContent.blocks[index]
            if (!block) return

            // Mock AI: Compile the instruction string, replacing variables
            const compiled = compileString(block.instruction, {
                assets: store.assets,
                components: store.components,
                mainSubject: "Subject Placeholder"
            })

            const newBlocks = [...editorContent.blocks]
            newBlocks[index] = { ...newBlocks[index], generatedOutput: compiled }
            setEditorContent({ ...editorContent, blocks: newBlocks })
        }
    }

    const handleAssemble = () => {
        if (editorContent.mode === 'text') {
            const output = editorContent.blocks
                .map(b => b.generatedOutput)
                .filter(Boolean)
                .join(" ") // Joined with spaces to mock paragraph stitching
            setAssembledOutput(output)
        }
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
                    <LabInventory onInsert={(token) => editorRef.current?.insertToken(token)} />
                </div>

                {/* Column B: The Workbench */}
                <div className="flex-1 bg-background p-6 flex flex-col gap-4">
                    <LabEditor
                        ref={editorRef}
                        value={editorContent}
                        onChange={setEditorContent}
                        onGenerateBlock={handleGenerateBlock}
                        onAssemble={handleAssemble}
                    />
                </div>

                {/* Column C: The Preview */}
                <div className="w-96 shrink-0 border-l bg-muted/10 p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <FileCode className="h-4 w-4" />
                        Live Output
                    </div>

                    <div className="flex-1 rounded-md border bg-muted/50 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap text-muted-foreground">
                        {editorContent.mode === 'text'
                            ? (assembledOutput || "// Assemble blocks to see final output...")
                            : jsonPreview
                        }
                    </div>

                    <Button variant="outline" className="w-full gap-2">
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                    </Button>
                </div>
            </div>
        </StudioShell>
    )
}
