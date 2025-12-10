import { useStudioStore, SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/stores/useStudioStore";

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
                systemOverride: settings.segmentWriterPrompt || DEFAULT_SYSTEM_SETTINGS.segmentWriterPrompt
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
                systemOverride: settings.assemblerPrompt || DEFAULT_SYSTEM_SETTINGS.assemblerPrompt
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

/**
 * Assembles multiple text segments into a structured Markdown document.
 * @param segments Array of text segments to combine
 * @param settings System settings containing the markdown assembler prompt
 * @returns The assembled markdown
 */
export async function assembleMarkdown(segments: string[], settings: SystemSettings): Promise<string> {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'assembly',
                outputFormat: 'markdown',
                segments,
                systemOverride: settings.markdownAssemblerPrompt || DEFAULT_SYSTEM_SETTINGS.markdownAssemblerPrompt
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
