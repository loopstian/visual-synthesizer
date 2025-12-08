export type JsonNodeType = 'string' | 'object' | 'array';

export interface JsonNode {
    id: string;
    key: string;
    type: JsonNodeType;
    instruction: string;
    children: JsonNode[];
    generatedOutput?: string | null;
}
