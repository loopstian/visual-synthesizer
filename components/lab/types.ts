export type JsonNodeType = 'string' | 'object' | 'array';

export interface VariableSource {
    id: string;
    label: string; // e.g., "Colors"
    content: string; // e.g., "Red, Blue, Neon"
}

export interface AvailableVariable {
    token: string; // e.g., "{{colors}}"
    label: string; // e.g., "Colors"
}

export interface JsonNode {
    id: string;
    key: string;
    type: JsonNodeType;
    instruction: string;
    children: JsonNode[];
    generatedOutput?: string | null;
    sources?: VariableSource[];
}

export interface Block {
    id: string
    sources: VariableSource[]
    instruction: string
    generatedOutput: string | null
}

export type EditorState =
    | { mode: 'text', blocks: Block[] }
    | { mode: 'json', nodes: JsonNode[] }
