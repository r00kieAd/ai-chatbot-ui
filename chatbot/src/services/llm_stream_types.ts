export type LLMStreamConnectionState = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error';

export interface LLMStreamRequestPayload {
    username: string;
    prompt: string;
    instruction: string;
    model: string;
    use_rag: boolean;
    use_web: boolean;
}

export interface LLMStreamStartMessage {
    type: 'start_generation';
    request_id: string;
    payload: {
        prompt: string;
        model: string;
        instruction: string;
        use_rag: boolean;
        top_k?: number;
        use_web: boolean;
    };
}

export interface LLMStreamCancelMessage {
    type: 'cancel_generation';
    request_id: string;
    session_id: string;
}

export interface LLMStreamResumeMessage {
    type: 'resume';
    request_id: string;
    session_id: string;
    last_event_id?: string;
    last_sequence?: number;
}

export interface LLMStreamPingMessage {
    type: 'ping';
    sent_at: number;
}

export interface LLMStreamPongMessage {
    type: 'pong';
    request_id?: string;
}

export interface LLMConnectionAckEvent {
    type: 'connection_ack';
    message?: string;
}

export type LLMStreamClientMessage =
    | LLMStreamStartMessage
    | LLMStreamCancelMessage
    | LLMStreamResumeMessage
    | LLMStreamPingMessage
    | LLMStreamPongMessage;

export interface LLMStreamBaseEvent {
    type: string;
    request_id: string;
    session_id?: string;
    event_id?: string;
    sequence?: number;
}

export interface LLMStreamStartEvent extends LLMStreamBaseEvent {
    type: 'stream_start';
    stream_id?: string;
    provider?: string;
    model_used?: string;
}

export interface LLMStreamTokenEvent extends LLMStreamBaseEvent {
    type: 'token';
    token?: string;
    text?: string;
    delta?: string;
}

export interface LLMStreamToolCallEvent extends LLMStreamBaseEvent {
    type: 'tool_call';
    name?: string;
    arguments?: unknown;
    raw?: unknown;
}

export interface LLMStreamToolResultEvent extends LLMStreamBaseEvent {
    type: 'tool_result';
    name?: string;
    result?: unknown;
    raw?: unknown;
}

export interface LLMStreamProgressEvent extends LLMStreamBaseEvent {
    type: 'progress';
    message?: string;
    percent?: number;
    stage?: string;
}

export interface LLMStreamErrorEvent extends LLMStreamBaseEvent {
    type: 'error';
    message?: string;
    code?: string | number;
    retryable?: boolean;
}

export interface LLMStreamEndEvent extends LLMStreamBaseEvent {
    type: 'stream_end';
    response?: string;
    provider?: string;
    model_used?: string;
    images?: unknown;
}

export interface LLMStreamCancelledEvent extends LLMStreamBaseEvent {
    type: 'cancelled';
    reason?: string;
}

export interface LLMStreamPongEvent {
    type: 'pong';
    sent_at?: number;
}

export interface LLMStreamPingEvent {
    type: 'ping';
    request_id?: string;
}

export interface LLMStreamMetadataEvent extends LLMStreamBaseEvent {
    type: 'metadata';
    provider?: string;
    model_used?: string;
}

export interface LLMStreamImagesEvent extends LLMStreamBaseEvent {
    type: 'image' | 'images';
    images?: unknown;
    url?: string;
    urls?: string[];
    data?: unknown;
}

export type LLMStreamServerEvent =
    | LLMStreamStartEvent
    | LLMStreamTokenEvent
    | LLMStreamToolCallEvent
    | LLMStreamToolResultEvent
    | LLMStreamProgressEvent
    | LLMStreamErrorEvent
    | LLMStreamEndEvent
    | LLMStreamCancelledEvent
    | LLMConnectionAckEvent
    | LLMStreamPongEvent
    | LLMStreamPingEvent
    | LLMStreamMetadataEvent
    | LLMStreamImagesEvent
    | (LLMStreamBaseEvent & Record<string, unknown>);

export interface LLMStreamHandlers {
    onOpen?: () => void;
    onConnectionState?: (state: LLMStreamConnectionState) => void;
    onReconnect?: (attempt: number) => void;
    onStart?: (event: LLMStreamStartEvent) => void;
    onToken?: (event: LLMStreamTokenEvent) => void;
    onToolCall?: (event: LLMStreamToolCallEvent) => void;
    onToolResult?: (event: LLMStreamToolResultEvent) => void;
    onProgress?: (event: LLMStreamProgressEvent) => void;
    onError?: (event: LLMStreamErrorEvent) => void;
    onEnd?: (event: LLMStreamEndEvent) => void;
    onCancelled?: (event: LLMStreamCancelledEvent) => void;
    onMetadata?: (event: LLMStreamMetadataEvent) => void;
    onImages?: (event: LLMStreamImagesEvent) => void;
}

export interface LLMStreamSubscription {
    requestId: string;
    sessionId: string;
    cancel: () => void;
    cleanup: () => void;
}
