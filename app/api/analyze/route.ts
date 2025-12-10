
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
    try {
        const { image, targets, prompt, strategies, systemOverride } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Ensure image has proper data URL format for OpenAI
        let imageDataUrl = image;
        if (!image.startsWith('data:image')) {
            imageDataUrl = `data:image/png;base64,${image}`;
        }

        // Construct System Prompt
        // If Override is present, use it. Otherwise use default.
        // CRITICAL: Always append JSON safety instruction.
        let baseSystemPrompt = systemOverride || "You are an expert visual analyst for AI art generation. Output a valid JSON object.";

        // Ensure the prompt explicitly demands JSON to match response_format
        if (!baseSystemPrompt.toLowerCase().includes('json')) {
            baseSystemPrompt += " Output a valid JSON object.";
        }

        let systemPrompt = baseSystemPrompt;

        // Construct User Prompt (Content)
        let userPromptText = "Analyze this image.";

        if (Array.isArray(strategies) && strategies.length > 0) {
            // Multi-Tone Strategy Mode
            if (!systemOverride) {
                systemPrompt = "You are an expert visual analyst. You will receive multiple analysis groups. For each group, analyze the image using the specified TONE/STYLE. Return a single flat JSON object where the keys are the requested targets.";
            }

            userPromptText = "Analyze the provided image (or masked region) and extract attributes into a JSON object.\n\n";
            strategies.forEach((strat: any) => {
                userPromptText += `TARGETS: [${strat.targets.join(', ')}]\n`;
                userPromptText += `TONE/STYLE: ${strat.tone || "Objective/Descriptive"}\n`;
                userPromptText += `INSTRUCTION: Extract keywords for these targets using this specific tone.\n\n`;
            });
            userPromptText += "OUTPUT REQUIREMENT: Return a single JSON object. Keys must be the Target names (e.g. 'Lighting'). If a Target appears in multiple strategies, combine all generated keywords into a single array for that key. Deduplicate if necessary.";

        } else if (Array.isArray(targets) && targets.length > 0) {
            systemPrompt += ` Analyze the image and extract the following attributes: ${targets.join(', ')}. Return a JSON object with these keys and array values containing the extracted descriptors.`;
        } else if (typeof prompt === 'string' && prompt.trim().length > 0) {
            systemPrompt += ` Analyze the image based on this request: '${prompt}'. Return a JSON object with a single key 'Keywords' containing an array of descriptive tags.`;
        } else {
            systemPrompt += " Analyze the image and extract key visual attributes suitable for image generation prompts. Return a JSON object with keys like 'Subject', 'Style', 'Lighting', 'Colors', 'Composition' and array values.";
        }

        // OpenAI GPT-4o Call
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: userPromptText
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageDataUrl
                            }
                        }
                    ]
                }
            ]
        });

        // Process Response
        const responseContent = response.choices[0]?.message?.content || '{}';

        let parsedData;
        try {
            parsedData = JSON.parse(responseContent);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Output:", responseContent);
            return NextResponse.json({
                error: 'Failed to parse model response as JSON',
                raw: responseContent
            }, { status: 500 });
        }

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error('OpenAI Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
