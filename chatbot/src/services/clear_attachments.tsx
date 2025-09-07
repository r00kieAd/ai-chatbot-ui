import ENDPOINTS from '../configs/endpoints.json';
import axios from "axios";

interface Params {
    username: string;
    token: string;
};

async function clearAttachments({username, token}: Params) {
    const base = import.meta.env.VITE_API_BASE_URL;
    try {
        const response = await axios.delete(
            base + ENDPOINTS.CLEAR_DATA + '?username=' + encodeURIComponent(username),
            {
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return {
            status: true,
            statusCode: response.status,
            resp: response.data,
        };
    } catch(error) {
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
};

export default clearAttachments;