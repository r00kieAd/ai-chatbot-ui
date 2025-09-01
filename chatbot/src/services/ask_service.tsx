import ENDPOINTS from '../configs/endpoints.json'
import axios from "axios";

interface Params {
    username: string;
    prompt: string;
    client: string;
    model: string;
    top_k: number;
    use_rag: boolean;
    token: string;
};

async function initiateAsk({ username, prompt, client, model, top_k, use_rag, token }: Params) {
    const base = import.meta.env.VITE_API_BASE_URL;
    const options = {
        method: 'POST',
        url: base + ENDPOINTS.ASK,
        headers: {
            "content-type": "application/json",
            "accept": "*/*",
            "authorization": `Bearer ${token}`
        },
        data: {
            "username": username,
            "prompt": prompt,
            "client": client,
            "model": model,
            "top_k": top_k,
            "use_rag": use_rag
        }
    };

    try {
        const response = await axios.request(options);
        const req_succeeded = response.status >= 200 && response.status < 300;
        if (req_succeeded) {
            return { status: req_succeeded, resp: response.data }
        } else {
            return { status: req_succeeded, statusCode: response.status, resp: response.statusText }
        };
    } catch (error) {
        const axiosError = error as import("axios").AxiosError;
        const message =
            (axiosError?.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data
                ? (axiosError.response.data as { message?: string }).message
                : undefined) ||
            axiosError?.message ||
            "Something went wrong";

        return {
            status: false,
            statusCode: axiosError?.response?.status || 500,
            resp: message,
        };
    }

}

export default initiateAsk;