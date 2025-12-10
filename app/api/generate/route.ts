
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { task = 'master_prompt', systemOverride } = body;

        let systemPrompt = '';
        let userPrompt = '';

        // Handle different task types
        if (task === 'segment') {
            // Lab: Generate a single text segment from structured variable sources
            const { variables, instruction, contextKey } = body;

            if (!variables || !Array.isArray(variables) || variables.length === 0 || !instruction) {
                return NextResponse.json(
                    { error: 'variables array and instruction are required for segment task' },
                    { status: 400 }
                );
            }

            systemPrompt = systemOverride || "You are a creative assistant. You will receive multiple data sources with labels. Use the instruction to combine them into a descriptive phrase. Pay attention to the labels to understand the context of the keywords. Return ONLY the text.";

            if (contextKey) {
                systemPrompt += ` CONTEXT: You are generating content for the JSON Key: '${contextKey}'. Adjust your tone and output style to fit this key (e.g., if key is 'negative', focus on exclusion).`;
            }

            // Build user prompt with labeled sources
            const sourcesText = variables.map((v: { label: string; content: string }) =>
                `[Source: ${v.label}]\nData: ${v.content}`
            ).join('\n\n');

            userPrompt = `${sourcesText}\n\n---\nInstruction: ${instruction}\nOutput:`;

        } else if (task === 'assembly') {
            // Lab: Combine multiple segments into a cohesive paragraph
            const { segments, outputFormat } = body;

            if (!segments || !Array.isArray(segments) || segments.length === 0) {
                return NextResponse.json(
                    { error: 'segments array is required for assembly task' },
                    { status: 400 }
                );
            }

            if (outputFormat === 'markdown') {
                 systemPrompt = systemOverride || "You are a technical documentation expert. Organize these text blocks into a clean Markdown document. Use H2/H3 Headers for main concepts, Bullet Points for details, and Bold text for keywords. Do not just write a paragraph.";
            } else {
                 systemPrompt = systemOverride || "You are an expert prompt engineer. Combine these disjointed text blocks into a single, fluid, cohesive paragraph for an image generator. Preserve the details, fix the grammar/flow.";
            }

            // Construct User Prompt based on System Prompt intent
            if (systemPrompt.includes('Markdown')) {
                 userPrompt = `Here are the document sections:\n${segments.join('\n\n')}\n\nFormat this into a clean Markdown document.`;
            } else {
                 userPrompt = `Blocks:\n${segments.join('\n')}\n\nCombine this into one paragraph.`;
            }

        } else if (task === 'master_prompt') {
            // Studio: Generate master prompt from subject, keywords, and components
            const { subject, globalKeywords, components } = body;

            if (!subject || subject.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Subject is required for master_prompt task' },
                    { status: 400 }
                );
            }

            systemPrompt = systemOverride || "You are an expert prompt engineer for Midjourney and Stable Diffusion. Your goal is to write a cohesive, descriptive prompt based on disjointed ingredients.";

            userPrompt = `Subject: ${subject}\n`;

            if (globalKeywords && Object.keys(globalKeywords).length > 0) {
                userPrompt += `Style/Vibe: ${JSON.stringify(globalKeywords)}\n`;
            }

            if (components && components.length > 0) {
                userPrompt += `Specific Components: ${JSON.stringify(components)}\n`;
            }

            userPrompt += "\nInstruction: Combine these into a single high-fidelity text prompt. Do not list keywords. Write a paragraph.";

        } else {
            return NextResponse.json(
                { error: `Unknown task type: ${task}` },
                { status: 400 }
            );
        }

        // OpenAI GPT-4o Call
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        });

        // Extract generated content
        const generatedContent = response.choices[0]?.message?.content || '';

        return NextResponse.json({
            prompt: generatedContent,
            task
        });

    } catch (error: any) {
        console.error('OpenAI Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
