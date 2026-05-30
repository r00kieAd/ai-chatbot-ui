import type {
    LLMStreamClientMessage,
    LLMStreamConnectionState,
    LLMStreamResumeMessage,
    LLMStreamServerEvent
} from './llm_stream_types';

interface SubscriptionState {
    requestId: string;
    sessionId: string;
    lastEventId?: string;
    lastSequence?: number;
    onEvent: (event: LLMStreamServerEvent) => void;
}

interface ReconnectingWebSocketOptions {
    url: string;
    token: string;
    username: string;
    heartbeatMs?: number;
    staleMs?: number;
    maxReconnectDelayMs?: number;
    onStateChange?: (state: LLMStreamConnectionState) => void;
    onReconnect?: (attempt: number) => void;
}

const DEFAULT_HEARTBEAT_MS = 25000;
const DEFAULT_STALE_MS = 65000;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 30000;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export class ReconnectingLLMWebSocket {
    private readonly url: string;
    private readonly token: string;
    private readonly username: string;
    private readonly heartbeatMs: number;
    private readonly staleMs: number;
    private readonly maxReconnectDelayMs: number;
    private readonly onStateChange?: (state: LLMStreamConnectionState) => void;
    private readonly onReconnect?: (attempt: number) => void;
    private socket: WebSocket | null = null;
    private state: LLMStreamConnectionState = 'idle';
    private heartbeatTimer: number | undefined;
    private staleTimer: number | undefined;
    private reconnectTimer: number | undefined;
    private ackTimer: number | undefined;
    private idleCloseTimer: number | undefined;
    private reconnectAttempt = 0;
    private manualClose = false;
    private acknowledged = false;
    private resumeAfterAck = false;
    private outboundQueue: LLMStreamClientMessage[] = [];
    private subscriptions = new Map<string, SubscriptionState>();
    private lastSeenAt = Date.now();

    constructor(options: ReconnectingWebSocketOptions) {
        this.url = options.url;
        this.token = options.token;
        this.username = options.username;
        this.heartbeatMs = options.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
        this.staleMs = options.staleMs ?? DEFAULT_STALE_MS;
        this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? DEFAULT_MAX_RECONNECT_DELAY_MS;
        this.onStateChange = options.onStateChange;
        this.onReconnect = options.onReconnect;
    }

    get connectionState() {
        return this.state;
    }

    connect() {
        if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.manualClose = false;
        this.acknowledged = false;
        this.setState(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
        const wsUrl = new URL(this.url);
        wsUrl.searchParams.set("username", this.username);
        wsUrl.searchParams.set("token", this.token);

        this.socket = new WebSocket(wsUrl.toString());
        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onerror = this.handleError;
        this.socket.onclose = this.handleClose;
    }

    send(message: LLMStreamClientMessage) {
        if (message.type === 'ping' && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return;
        }

        this.outboundQueue.push(message);
        if (this.socket?.readyState === WebSocket.OPEN && this.acknowledged) {
            this.flushQueue();
            return;
        }
        this.connect();
    }

    subscribe(subscription: SubscriptionState) {
        if (this.idleCloseTimer !== undefined) {
            window.clearTimeout(this.idleCloseTimer);
            this.idleCloseTimer = undefined;
        }
        this.subscriptions.set(subscription.requestId, subscription);
        this.connect();
    }

    unsubscribe(requestId: string) {
        this.subscriptions.delete(requestId);
        this.outboundQueue = this.outboundQueue.filter(message => !('request_id' in message) || message.request_id !== requestId);
        if (this.subscriptions.size === 0) {
            this.scheduleIdleClose();
        }
    }

    close() {
        this.manualClose = true;
        this.clearTimers();
        this.outboundQueue = [];
        this.acknowledged = false;
        this.resumeAfterAck = false;
        this.socket?.close(1000, 'client_closed');
        this.socket = null;
        this.setState('closed');
    }

    private handleOpen = () => {
        this.lastSeenAt = Date.now();
        this.setState('open');
        this.startAckFallback();
    };

    private handleMessage = (message: MessageEvent<string>) => {
        this.lastSeenAt = Date.now();
        const event = this.parseEvent(message.data);
        if (!event) return;
        if (event.type === 'connection_ack') {
            this.handleConnectionAck();
            return;
        }
        if (event.type === 'pong') return;

        const requestId = isRecord(event) && typeof event.request_id === 'string' ? event.request_id : undefined;
        if (!requestId) return;

        const subscription = this.subscriptions.get(requestId);
        if (!subscription) return;

        if (isRecord(event) && typeof event.event_id === 'string') {
            subscription.lastEventId = event.event_id;
        }
        if (isRecord(event) && typeof event.sequence === 'number') {
            subscription.lastSequence = event.sequence;
        }
        if (isRecord(event) && typeof event.session_id === 'string') {
            subscription.sessionId = event.session_id;
        } else if (isRecord(event) && typeof event.stream_id === 'string') {
            subscription.sessionId = event.stream_id;
        }
        subscription.onEvent(event);
    };

    private handleError = () => {
        this.setState('error');
    };

    private handleClose = () => {
        this.clearTimers();
        this.socket = null;
        this.acknowledged = false;
        if (this.manualClose || this.subscriptions.size === 0) {
            this.setState('closed');
            return;
        }
        this.resumeAfterAck = true;
        this.scheduleReconnect();
    };

    private parseEvent(data: string): LLMStreamServerEvent | null {
        try {
            const parsed = JSON.parse(data) as unknown;
            if (!isRecord(parsed) || typeof parsed.type !== 'string') return null;
            return parsed as LLMStreamServerEvent;
        } catch (error) {
            console.warn('WebSocket stream event parse error', error);
            return null;
        }
    }

    private sendNow(message: LLMStreamClientMessage) {
        if (this.socket?.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify(message));
    }

    private flushQueue() {
        if (!this.acknowledged) return;
        const queued = [...this.outboundQueue];
        this.outboundQueue = [];
        queued.forEach(message => this.sendNow(message));
    }

    private resumeActiveStreams() {
        this.subscriptions.forEach(subscription => {
            const resumeMessage: LLMStreamResumeMessage = {
                type: 'resume',
                request_id: subscription.requestId,
                session_id: subscription.sessionId,
                last_event_id: subscription.lastEventId,
                last_sequence: subscription.lastSequence
            };
            this.sendNow(resumeMessage);
        });
    }

    private handleConnectionAck() {
        this.acknowledged = true;
        this.reconnectAttempt = 0;
        if (this.ackTimer !== undefined) {
            window.clearTimeout(this.ackTimer);
            this.ackTimer = undefined;
        }
        if (this.resumeAfterAck) {
            this.resumeAfterAck = false;
            this.resumeActiveStreams();
        }
        this.flushQueue();
        this.startHeartbeat();
    }

    private startAckFallback() {
        if (this.ackTimer !== undefined) window.clearTimeout(this.ackTimer);
        this.ackTimer = window.setTimeout(() => {
            if (this.acknowledged || this.socket?.readyState !== WebSocket.OPEN) return;
            console.warn('WebSocket connection_ack not received; proceeding with queued stream messages');
            this.handleConnectionAck();
        }, 3000);
    }

    private startHeartbeat() {
        this.clearTimers();
        this.heartbeatTimer = window.setInterval(() => {
            if (this.socket?.readyState !== WebSocket.OPEN) return;
            this.sendNow({ type: 'ping', sent_at: Date.now() });
        }, this.heartbeatMs);

        this.staleTimer = window.setInterval(() => {
            if (Date.now() - this.lastSeenAt < this.staleMs) return;
            this.socket?.close(4000, 'stale_connection');
        }, Math.max(this.heartbeatMs, 1000));
    }

    private scheduleReconnect() {
        this.reconnectAttempt += 1;
        const jitter = Math.floor(Math.random() * 250);
        const delay = Math.min(1000 * 2 ** (this.reconnectAttempt - 1), this.maxReconnectDelayMs) + jitter;
        this.setState('reconnecting');
        this.onReconnect?.(this.reconnectAttempt);
        this.reconnectTimer = window.setTimeout(() => this.connect(), delay);
    }

    private clearTimers() {
        if (this.heartbeatTimer !== undefined) window.clearInterval(this.heartbeatTimer);
        if (this.staleTimer !== undefined) window.clearInterval(this.staleTimer);
        if (this.reconnectTimer !== undefined) window.clearTimeout(this.reconnectTimer);
        if (this.ackTimer !== undefined) window.clearTimeout(this.ackTimer);
        if (this.idleCloseTimer !== undefined) window.clearTimeout(this.idleCloseTimer);
        this.heartbeatTimer = undefined;
        this.staleTimer = undefined;
        this.reconnectTimer = undefined;
        this.ackTimer = undefined;
        this.idleCloseTimer = undefined;
    }

    private scheduleIdleClose() {
        if (this.idleCloseTimer !== undefined) window.clearTimeout(this.idleCloseTimer);
        this.idleCloseTimer = window.setTimeout(() => {
            if (this.subscriptions.size > 0) return;
            this.close();
        }, 30000);
    }

    private setState(nextState: LLMStreamConnectionState) {
        if (this.state === nextState) return;
        this.state = nextState;
        this.onStateChange?.(nextState);
    }
}
