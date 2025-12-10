import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error(
        'Missing OpenAI API Key. Please set OPENAI_API_KEY in your environment variables (.env.local).'
    );
}

export const openai = new OpenAI({
    apiKey,
});
