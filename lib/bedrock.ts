
import { BedrockRuntimeClient, ConverseCommand, Message } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
    console.warn("Missing AWS credentials or region in environment variables.");
}

export const bedrockClient = new BedrockRuntimeClient({
    region: region || "us-east-1",
    credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
    },
});

/**
 * Invokes the Amazon Nova Lite model using the Converse API.
 * 
 * @param messages The conversation history to send to the model.
 * @param systemPrompts Optional system prompts to guide the model's behavior.
 * @returns The text content of the model's response.
 */
export async function invokeNovaLite(messages: Message[], systemPrompts: any[] = []) {
    // Using the model ID for Nova Lite. Verify this ID is correct for your region/access.
    // Common format: 'amazon.nova-lite-v1:0' or 'us.amazon.nova-lite-v1:0' depending on inference profile vs direct model.
    // Using 'us.amazon.nova-lite-v1:0' as a safe default for US regions, or 'amazon.nova-lite-v1:0'.
    // Let's use 'us.amazon.nova-lite-v1:0' (cross-region inference profile) if available, or fall back to standard if needed.
    // For now, I'll use the standard 'amazon.nova-lite-v1:0' which is often the base ID.
    // Actually, AWS suggests using inference profiles like 'us.amazon.nova-lite-v1:0' for better resilience.

    const modelId = process.env.BEDROCK_MODEL_ID;

    const command = new ConverseCommand({
        modelId,
        messages,
        system: systemPrompts,
        inferenceConfig: {
            maxTokens: 1000,
            temperature: 0.7,
            topP: 0.9,
        },
    });

    try {
        const response = await bedrockClient.send(command);

        // Extract text content from the response
        if (response.output?.message?.content && response.output.message.content.length > 0) {
            // Find the first text block
            const textBlock = response.output.message.content.find(c => c.text !== undefined);
            return textBlock?.text || "";
        }

        return "";
    } catch (error) {
        console.error("Error invoking Nova Lite:", error);
        throw error;
    }
}
