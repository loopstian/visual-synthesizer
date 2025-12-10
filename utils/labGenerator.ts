import { useStudioStore } from "@/stores/useStudioStore";

export type VariableSource = {
    label: string;
    content: string;
};

/**
 * Generates a text segment from structured variable sources and instruction.
 * @param variables Array of variable sources with label and content
 * @param instruction The instruction for how to transform the data
 * @returns The generated text segment
 */
export async function generateSegment(variables: VariableSource[], instruction: string, contextKey?: string): Promise<string> {
    const settings = useStudioStore.getState().settings

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'segment',
                variables,
                instruction,
                contextKey,
                systemOverride: settings.segmentWriterPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`Segment generation failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.prompt || '';
    } catch (error) {
        console.error('Segment generation error:', error);
        throw error;
    }
}

/**
 * Assembles multiple text segments into a cohesive paragraph.
 * @param segments Array of text segments to combine
 * @returns The assembled paragraph
 */
export async function assembleParagraph(segments: string[]): Promise<string> {
    const settings = useStudioStore.getState().settings

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'assembly',
                segments,
                systemOverride: settings.assemblerPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`Assembly failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.prompt || '';
    } catch (error) {
        console.error('Assembly error:', error);
        throw error;
    }
}
