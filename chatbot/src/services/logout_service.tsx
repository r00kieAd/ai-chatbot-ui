import ENDPOINTS from '../configs/endpoints.json'
import axios from "axios";

interface Params {
    username: string;
    token: string;
};

async function initiateLogout({ username, token }: Params) {
    const base = import.meta.env.VITE_API_BASE_URL;
    const options = {
        method: 'POST',
        url: base + ENDPOINTS.LOGOUT,
        headers: {
            "content-type": "application/json",
            "accept": "*/*"
        },
        data: {
            "username": username,
            "token": token
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
    };
};

export default initiateLogout;