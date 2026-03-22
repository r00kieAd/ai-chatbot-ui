import ENDPOINTS from '../configs/endpoints.json'

interface Params {
    username: string;
    prompt: string;
    instruction: string;
    model: string;
    use_rag: boolean;
    token: string;
}

export interface AskSuccessPayload {
    response?: string;
    provider?: string;
    model_used?: string;
    [key: string]: unknown;
}

export type AskResponsePayload = string | AskSuccessPayload;

const isAskSuccessPayload = (value: unknown): value is AskSuccessPayload => typeof value === 'object' && value !== null;

interface AskServiceResponse {
    status: boolean;
    statusCode?: number;
    resp?: AskResponsePayload;
    reader?: ReadableStreamDefaultReader<Uint8Array>;
    headers?: Headers;
}

async function initiateAsk({ username, prompt, instruction, model, use_rag, token }: Params): Promise<AskServiceResponse> {
    const base = import.meta.env.VITE_API_BASE_URL;
    const payload = JSON.stringify({
        username,
        prompt,
        instruction,
        model,
        use_rag
    });

    try {
        const response = await fetch(base + ENDPOINTS.ASK, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: '*/*',
                authorization: `Bearer ${token}`
            },
            body: payload
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                status: false,
                statusCode: response.status,
                resp: errorText || response.statusText
            };
        }

        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

        if (contentType.includes('application/json')) {
            const data = await response.json();
            return {
                status: true,
                resp: isAskSuccessPayload(data) ? data : { response: String(data) }
            };
        }

        const reader = response.body?.getReader();
        if (reader) {
            return {
                status: true,
                reader,
                headers: response.headers
            };
        }

        const text = await response.text();
        return {
            status: true,
            resp: {
                response: text
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        return {
            status: false,
            statusCode: 500,
            resp: message
        };
    }
}

export default initiateAsk;
