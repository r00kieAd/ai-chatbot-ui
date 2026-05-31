import ENDPOINTS from '../configs/endpoints.json';
import type {
    LLMStreamConnectionState,
    LLMStreamCancelledEvent,
    LLMStreamEndEvent,
    LLMStreamErrorEvent,
    LLMStreamHandlers,
    LLMStreamImagesEvent,
    LLMStreamMetadataEvent,
    LLMStreamProgressEvent,
    LLMStreamRequestPayload,
    LLMStreamServerEvent,
    LLMStreamStartEvent,
    LLMStreamSubscription,
    LLMStreamTokenEvent,
    LLMStreamToolCallEvent,
    LLMStreamToolResultEvent
} from './llm_stream_types';
import { ReconnectingLLMWebSocket } from './websocket_client';

interface StartLLMStreamParams extends LLMStreamRequestPayload {
    token: string;
    username: string;
    requestId?: string;
    handlers: LLMStreamHandlers;
}

let client: ReconnectingLLMWebSocket | null = null;
let currentToken: string | undefined;
let currentUsername: string | undefined;
let connectionStateHandler: ((state: LLMStreamConnectionState) => void) | undefined;
let reconnectHandler: ((attempt: number) => void) | undefined;
let webSocketUnavailable = false;
const restStreams = new Map<string, { abortController: AbortController; streamId?: string; completed: boolean }>();

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isLocalHost = (host: string) => ['localhost', '127.0.0.1', '0.0.0.0'].includes(host);
const getCurrentOrigin = () => (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

const normalizeBaseUrl = (value: string) => {
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
    if (/^wss?:\/\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

const getConfiguredBaseUrl = () => {
    const configuredBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_WS_BASE_URL || getCurrentOrigin()) as string;
    const normalized = new URL(normalizeBaseUrl(configuredBase));

    if (typeof window !== 'undefined') {
        const pageHost = window.location.hostname;
        if (!isLocalHost(pageHost) && isLocalHost(normalized.hostname)) {
            normalized.hostname = pageHost;
        }
    }

    return normalized;
};

const appendEndpointIfNeeded = (url: URL, endpoint: string) => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const currentPath = url.pathname.replace(/\/$/, '');
    if (currentPath === normalizedEndpoint || currentPath.endsWith(normalizedEndpoint)) {
        return;
    }
    url.pathname = `${currentPath}${normalizedEndpoint}`;
};

const getWebSocketUrl = () => {
    const endpoint = ENDPOINTS.WS_CHAT || '/ws/chat';
    const url = getConfiguredBaseUrl();

    if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
        url.protocol = isLocalHost(url.hostname) ? 'ws:' : 'wss:';
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        url.protocol = 'wss:';
    }
    if (isLocalHost(url.hostname) && url.protocol === 'wss:') {
        url.protocol = 'ws:';
    }
    appendEndpointIfNeeded(url, endpoint);
    url.search = '';
    return url.toString();
};

const getApiUrl = (endpoint: string) => {
    const url = getConfiguredBaseUrl();
    if (url.protocol === 'ws:') {
        url.protocol = 'http:';
    } else if (url.protocol === 'wss:') {
        url.protocol = 'https:';
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && !isLocalHost(url.hostname)) {
        url.protocol = 'https:';
    }
    appendEndpointIfNeeded(url, endpoint);
    url.search = '';
    return url.toString();
};

const cryptoRandomId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const ensureClient = (token: string, username: string, handlers: LLMStreamHandlers) => {
    connectionStateHandler = handlers.onConnectionState;
    reconnectHandler = handlers.onReconnect;

    if (client && currentToken === token && currentUsername === username) {
        return client;
    }

    client?.close();
    webSocketUnavailable = false;
    currentToken = token;
    currentUsername = username;
    client = new ReconnectingLLMWebSocket({
        url: getWebSocketUrl(),
        token,
        username,
        onStateChange: state => connectionStateHandler?.(state),
        onReconnect: attempt => reconnectHandler?.(attempt),
        onUnavailable: () => {
            webSocketUnavailable = true;
            connectionStateHandler?.('closed');
        }
    });
    return client;
};

const dispatchEvent = (event: LLMStreamServerEvent, handlers: LLMStreamHandlers) => {
    switch (event.type) {
        case 'stream_start':
            handlers.onStart?.(event as LLMStreamStartEvent);
            break;
        case 'token':
            handlers.onToken?.(event as LLMStreamTokenEvent);
            break;
        case 'tool_call':
            handlers.onToolCall?.(event as LLMStreamToolCallEvent);
            break;
        case 'tool_result':
            handlers.onToolResult?.(event as LLMStreamToolResultEvent);
            break;
        case 'progress':
            handlers.onProgress?.(event as LLMStreamProgressEvent);
            break;
        case 'error':
            handlers.onError?.(event as LLMStreamErrorEvent);
            break;
        case 'stream_end':
            handlers.onEnd?.(event as LLMStreamEndEvent);
            break;
        case 'completion':
            handlers.onEnd?.(event as LLMStreamEndEvent);
            break;
        case 'cancelled':
            handlers.onCancelled?.(event as LLMStreamCancelledEvent);
            break;
        case 'metadata':
            handlers.onMetadata?.(event as LLMStreamMetadataEvent);
            break;
        case 'image':
        case 'images':
            handlers.onImages?.(event as LLMStreamImagesEvent);
            break;
        default:
            if (import.meta.env.DEV) {
                console.debug('Unhandled LLM stream event', event);
            }
            break;
    }
};

const parseJsonData = (data: string): Record<string, unknown> | undefined => {
    try {
        const parsed = JSON.parse(data) as unknown;
        return isRecord(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
};

const dispatchRestSseEvent = (
    eventName: string,
    data: string,
    requestId: string,
    handlers: LLMStreamHandlers,
    streamState: { streamId?: string }
) => {
    const normalizedEvent = eventName || 'message';

    if (normalizedEvent === 'stream_id') {
        streamState.streamId = data;
        handlers.onStart?.({
            type: 'stream_start',
            request_id: requestId,
            session_id: data,
            stream_id: data
        });
        return;
    }

    if (normalizedEvent === 'metadata') {
        const metadata = parseJsonData(data) ?? {};
        handlers.onMetadata?.({
            ...metadata,
            type: 'metadata',
            request_id: requestId,
            session_id: streamState.streamId,
            provider: typeof metadata.provider === 'string' ? metadata.provider : undefined,
            model_used: typeof metadata.model_used === 'string' ? metadata.model_used : typeof metadata.model === 'string' ? metadata.model : undefined
        });
        return;
    }

    if (normalizedEvent === 'completion') {
        handlers.onEnd?.({
            type: 'stream_end',
            request_id: requestId,
            session_id: streamState.streamId,
            response: data === 'stream completed' ? undefined : data
        });
        return;
    }

    if (normalizedEvent === 'stopped') {
        handlers.onCancelled?.({
            type: 'cancelled',
            request_id: requestId,
            session_id: streamState.streamId,
            reason: data || 'stream halted by stop'
        });
        return;
    }

    if (normalizedEvent === 'error') {
        const errorData = parseJsonData(data);
        const errorMessage =
            (errorData && typeof errorData.message === 'string' ? errorData.message : undefined) ||
            (errorData && typeof errorData.error === 'string' ? errorData.error : undefined) ||
            data ||
            'REST fallback stream failed';
        handlers.onError?.({
            type: 'error',
            request_id: requestId,
            session_id: streamState.streamId,
            message: errorMessage
        });
        return;
    }

    if (data) {
        handlers.onToken?.({
            type: 'token',
            request_id: requestId,
            session_id: streamState.streamId,
            token: data
        });
    }
};

const parseSseBlock = (block: string) => {
    let eventName = '';
    const dataLines: string[] = [];

    block.split(/\r?\n/).forEach(line => {
        if (!line || line.startsWith(':')) return;
        const separatorIndex = line.indexOf(':');
        const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
        const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
        const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

        if (field === 'event') {
            eventName = value;
        } else if (field === 'data') {
            dataLines.push(value);
        }
    });

    return { eventName, data: dataLines.join('\n') };
};

const stopRestStream = async (streamId: string, token: string) => {
    await fetch(getApiUrl(ENDPOINTS.STOP || '/stop'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stream_id: streamId })
    });
};

const startRestSseStream = ({
    token,
    username,
    requestId,
    handlers,
    ...payload
}: StartLLMStreamParams & { requestId: string }): LLMStreamSubscription => {
    const abortController = new AbortController();
    const streamState: { streamId?: string } = {};
    const restState = { abortController, completed: false, streamId: undefined as string | undefined };
    restStreams.set(requestId, restState);

    void (async () => {
        try {
            const response = await fetch(getApiUrl(ENDPOINTS.ASK || '/ask'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    prompt: payload.prompt,
                    model: payload.model,
                    instruction: payload.instruction,
                    use_rag: payload.use_rag,
                    top_k: 3,
                    use_web: payload.use_web
                }),
                signal: abortController.signal
            });

            if (!response.ok) {
                throw new Error(`REST fallback failed: ${response.status}`);
            }
            if (!response.body) {
                throw new Error('REST fallback failed: response body is empty');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                buffer = buffer.replace(/\r\n/g, '\n');

                let boundaryIndex = buffer.indexOf('\n\n');
                while (boundaryIndex !== -1) {
                    const rawBlock = buffer.slice(0, boundaryIndex).replace(/\r\n/g, '\n');
                    buffer = buffer.slice(boundaryIndex + 2);
                    const { eventName, data } = parseSseBlock(rawBlock);
                    dispatchRestSseEvent(eventName, data, requestId, handlers, streamState);
                    restState.streamId = streamState.streamId;
                    boundaryIndex = buffer.indexOf('\n\n');
                }
            }

            const remaining = buffer.trim();
            if (remaining) {
                const { eventName, data } = parseSseBlock(remaining);
                dispatchRestSseEvent(eventName, data, requestId, handlers, streamState);
                restState.streamId = streamState.streamId;
            }

            restState.completed = true;
        } catch (error) {
            if (abortController.signal.aborted) return;
            const message = error instanceof Error ? error.message : 'REST fallback stream failed';
            handlers.onError?.({
                type: 'error',
                request_id: requestId,
                session_id: streamState.streamId,
                message
            });
        } finally {
            restState.completed = true;
        }
    })();

    return {
        requestId,
        sessionId: streamState.streamId ?? requestId,
        cancel: () => {
            const streamId = restState.streamId || streamState.streamId;
            if (streamId) {
                void stopRestStream(streamId, token).catch(error => {
                    if (import.meta.env.DEV) console.warn('REST fallback stop failed', error);
                });
            }
            abortController.abort();
        },
        cleanup: () => {
            if (!restState.completed) {
                abortController.abort();
            }
            restStreams.delete(requestId);
        }
    };
};

export function connectLLMStreamClient(token: string, username: string, handlers: LLMStreamHandlers = {}) {
    const wsClient = ensureClient(token, username, handlers);
    wsClient.connect();
}

export function startLLMStream({
    token,
    username,
    requestId = cryptoRandomId(),
    handlers,
    ...payload
}: StartLLMStreamParams): LLMStreamSubscription {
    if (webSocketUnavailable) {
        return startRestSseStream({ token, username, requestId, handlers, ...payload });
    }

    const wsClient = ensureClient(token, username, handlers);

    const subscriptionState = {
        requestId,
        sessionId: cryptoRandomId(),
        onEvent: (event: LLMStreamServerEvent) => dispatchEvent(event, handlers)
    };

    wsClient.subscribe(subscriptionState);

    wsClient.send({
        type: 'start_generation',
        request_id: requestId,
        payload: {
            prompt: payload.prompt,
            model: payload.model,
            instruction: payload.instruction,
            use_rag: payload.use_rag,
            top_k: 3,
            use_web: payload.use_web
        }
    });

    return {
        requestId,
        sessionId: subscriptionState.sessionId,
        cancel: () => {
            wsClient.send({
                type: 'cancel_generation',
                request_id: requestId,
                session_id: subscriptionState.sessionId
            });
        },
        cleanup: () => {
            wsClient.unsubscribe(requestId);
        }
    };
}

export function disconnectLLMStreamClient() {
    restStreams.forEach(stream => stream.abortController.abort());
    restStreams.clear();
    client?.close();
    client = null;
    currentToken = undefined;
    currentUsername = undefined;
    webSocketUnavailable = false;
}
