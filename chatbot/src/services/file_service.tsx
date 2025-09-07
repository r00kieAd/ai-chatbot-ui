import ENDPOINTS from '../configs/endpoints.json';
import axios from "axios";

interface Params {
    blob: Blob;
    username: string;
    token: string;
}

async function uploadFile({ token, username, blob }: Params) {
    const base = import.meta.env.VITE_API_BASE_URL;
    const form = new FormData();
    form.append('file', blob);
    form.append('username', username);

    try {
        const response = await axios.post(base + ENDPOINTS.UPLOAD, form, {
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        const req_succeeded = response.status >= 200 && response.status < 300;
        if (req_succeeded) {
            return { status: true, resp: response.data };
        } else {
            return { status: false, statusCode: response.status, resp: response.statusText };
        }
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

export default uploadFile;