import { AxiosError } from 'axios';

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError) {
        const status = error.response?.status || 500;
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : data?.detail || error.message;
        return new ApiError(message, status, data);
    }
    return error;
}; 