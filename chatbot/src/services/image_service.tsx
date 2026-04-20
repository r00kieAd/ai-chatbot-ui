import ENDPOINTS from '../configs/endpoints.json';

export interface GeneratedImage {
    url: string;
    alt?: string;
}

interface Params {
    username: string;
    token: string;
    prompt: string;
    instruction: string;
    model: string;
    use_rag: boolean;
    action?: string;
    action_input?: Record<string, unknown>;
    [key: string]: unknown;
}

interface ImageServiceResponse {
    status: boolean;
    statusCode?: number;
    images?: GeneratedImage[];
    resp?: string;
    raw?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const asStringArray = (value: unknown): string[] | null => {
    if (!Array.isArray(value)) return null;
    const filtered = value.filter(v => typeof v === 'string') as string[];
    return filtered.length ? filtered : [];
};

const normalizeUrl = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null);

const normalizeImagesFromResponse = (data: unknown): GeneratedImage[] => {
    if (typeof data === 'string') {
        const trimmed = data.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                return normalizeImagesFromResponse(JSON.parse(trimmed));
            } catch {
                // fall through
            }
        }
        if (trimmed.startsWith('data:image/') || /^https?:\/\//i.test(trimmed)) {
            return [{ url: trimmed }];
        }
        return [];
    }

    if (Array.isArray(data)) {
        return data.map(item => normalizeImagesFromResponse(item)).flat();
    }

    if (!isRecord(data)) return [];

    const directUrl = normalizeUrl(data.url);
    if (directUrl) return [{ url: directUrl }];

    const urls = asStringArray(data.urls) ?? asStringArray(data.images);
    if (urls) return urls.filter(Boolean).map(url => ({ url }));

    // OpenAI-ish: { data: [{ url }, { b64_json }] }
    const openAiData = data.data;
    if (Array.isArray(openAiData)) {
        const images: GeneratedImage[] = [];
        for (const item of openAiData) {
            if (!isRecord(item)) continue;
            const itemUrl = normalizeUrl(item.url);
            if (itemUrl) {
                images.push({ url: itemUrl });
                continue;
            }
            const b64 = normalizeUrl(item.b64_json);
            if (b64) {
                images.push({ url: `data:image/png;base64,${b64}` });
            }
        }
        return images;
    }

    const b64 = normalizeUrl(data.b64_json);
    if (b64) return [{ url: `data:image/png;base64,${b64}` }];

    return [];
};

const readSseImages = async (response: Response): Promise<GeneratedImage[]> => {
    const reader = response.body?.getReader();
    if (!reader) return [];
    const decoder = new TextDecoder();
    let eventBuffer = '';
    const images: GeneratedImage[] = [];

    const processBlock = (block: string) => {
        if (!block.trim()) return;
        const lines = block.split(/\r?\n/);
        let currentEvent = 'message';
        const dataLines: string[] = [];
        for (const rawLine of lines) {
            if (!rawLine) continue;
            if (rawLine.startsWith('event:')) {
                currentEvent = rawLine.slice(6).trim();
                continue;
            }
            if (rawLine.startsWith('data:')) {
                let payload = rawLine.slice(5);
                if (payload.startsWith(' ') && payload.length > 1) payload = payload.slice(1);
                dataLines.push(payload);
            }
        }

        if (currentEvent !== 'image' && currentEvent !== 'images') return;
        const combinedData = dataLines.join('\n');
        if (!combinedData) return;

        try {
            const payload = JSON.parse(combinedData);
            images.push(...normalizeImagesFromResponse(payload));
        } catch {
            images.push(...normalizeImagesFromResponse(combinedData));
        }
    };

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            eventBuffer += decoder.decode(value, { stream: true });
            const segments = eventBuffer.split(/\r?\n\r?\n/);
            eventBuffer = segments.pop() ?? '';
            segments.forEach(processBlock);
        }
        const finalChunk = decoder.decode();
        if (finalChunk) {
            eventBuffer += finalChunk;
        }
        if (eventBuffer) {
            processBlock(eventBuffer);
        }
    } finally {
        reader.releaseLock();
    }

    return images;
};

async function generateImage(params: Params): Promise<ImageServiceResponse> {
    const base = import.meta.env.VITE_API_BASE_URL;
    const { token, ...bodyParams } = params;
    const payload = JSON.stringify(bodyParams);

    try {
        const response = await fetch(base + ENDPOINTS.ASK, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json, text/event-stream, */*',
                authorization: `Bearer ${token}`
            },
            body: payload
        });

        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

        if (!response.ok) {
            const errorText = await response.text();
            return { status: false, statusCode: response.status, resp: errorText || response.statusText };
        }

        if (contentType.includes('application/json')) {
            const data = await response.json();
            const images = normalizeImagesFromResponse(data);
            return { status: true, images, raw: data };
        }

        if (contentType.includes('text/event-stream')) {
            const images = await readSseImages(response);
            return { status: true, images, raw: { stream: true, imageCount: images.length } };
        }

        const text = await response.text();
        const images = normalizeImagesFromResponse(text);
        return { status: true, images, raw: text };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        return { status: false, statusCode: 500, resp: message };
    }
}

export default generateImage;
