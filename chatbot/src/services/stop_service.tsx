import ENDPOINTS from '../configs/endpoints.json'

interface StopServiceResponse {
    status: boolean;
    statusCode?: number;
    resp?: string;
}

async function stopStream(streamId: string): Promise<StopServiceResponse> {
    const base = import.meta.env.VITE_API_BASE_URL;
    try {
        const response = await fetch(base + ENDPOINTS.STOP, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ stream_id: streamId })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                status: false,
                statusCode: response.status,
                resp: errorText || response.statusText
            };
        }

        const dataText = await response.text();
        return {
            status: true,
            resp: dataText
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Stop request failed';
        return {
            status: false,
            resp: message
        };
    }
}

export default stopStream;
