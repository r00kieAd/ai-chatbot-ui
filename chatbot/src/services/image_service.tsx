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

async function generateImage(params: Params): Promise<ImageServiceResponse> {
    const base = import.meta.env.VITE_API_BASE_URL;
    const { token, ...bodyParams } = params;
    const payload = JSON.stringify(bodyParams);

    try {
        const response = await fetch(base + ENDPOINTS.ASK, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json, text/plain, */*',
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

        const text = await response.text();
        const images = normalizeImagesFromResponse(text);
        return { status: true, images, raw: text };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        return { status: false, statusCode: 500, resp: message };
    }
}

export default generateImage;
