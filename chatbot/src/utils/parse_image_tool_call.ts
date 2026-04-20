export interface ParsedImageToolCall {
    action: string;
    prompt: string;
    params: Record<string, unknown>;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const extractFencedBlock = (text: string): string | null => {
    const trimmed = text.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenceMatch ? fenceMatch[1].trim() : null;
};

const safeJsonParse = (text: string): unknown => {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const parseActionInput = (value: unknown): Record<string, unknown> | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        const parsed = safeJsonParse(value);
        return isRecord(parsed) ? parsed : null;
    }
    return isRecord(value) ? value : null;
};

const extractPrompt = (obj: Record<string, unknown>): string | null => {
    const prompt = obj.prompt;
    if (typeof prompt === 'string' && prompt.trim()) return prompt.trim();
    return null;
};

const isSupportedAction = (action: string): boolean => {
    const normalized = action.toLowerCase().trim();
    return (
        normalized === 'dalle.text2im' ||
        normalized === 'dalle.generate' ||
        normalized === 'openai.images.generate' ||
        normalized === 'images.generate' ||
        normalized === 'image.generate'
    );
};

export const parseImageToolCall = (text: string): ParsedImageToolCall | null => {
    if (!text || !text.trim()) return null;

    const candidate = extractFencedBlock(text) ?? text.trim();
    const parsed = safeJsonParse(candidate);
    if (!isRecord(parsed)) return null;

    const action = parsed.action;
    if (typeof action !== 'string' || !isSupportedAction(action)) return null;

    const actionInput = parseActionInput(parsed.action_input);
    const topLevelPrompt = extractPrompt(parsed);
    const prompt = (actionInput && extractPrompt(actionInput)) || topLevelPrompt;
    if (!prompt) return null;

    const params: Record<string, unknown> = actionInput ? { ...actionInput } : { prompt };
    return { action, prompt, params };
};

