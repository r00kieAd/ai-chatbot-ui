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

const isLocalHost = (host: string) => ['localhost', '127.0.0.1', '0.0.0.0'].includes(host);
const DEFAULT_WS_BASE_URL = 'http://127.0.0.1:8000';

const normalizeBaseUrl = (value: string) => {
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
    if (/^wss?:\/\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
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
    const configuredBase = (import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_WS_BASE_URL) as string;
    const endpoint = ENDPOINTS.WS_ASK || '/ws/chat';

    const url = new URL(normalizeBaseUrl(configuredBase));
    if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
        url.protocol = isLocalHost(url.hostname) ? 'ws:' : 'wss:';
    }
    if (isLocalHost(url.hostname) && url.protocol === 'wss:') {
        url.protocol = 'ws:';
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
    currentToken = token;
    currentUsername = username;
    client = new ReconnectingLLMWebSocket({
        url: getWebSocketUrl(),
        token,
        username,
        onStateChange: state => connectionStateHandler?.(state),
        onReconnect: attempt => reconnectHandler?.(attempt)
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

export function startLLMStream({
    token,
    username,
    requestId = cryptoRandomId(),
    handlers,
    ...payload
}: StartLLMStreamParams): LLMStreamSubscription {
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
                type: 'cancel',
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
    client?.close();
    client = null;
    currentToken = undefined;
    currentUsername = undefined;
}
