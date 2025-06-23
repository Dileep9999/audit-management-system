import api from './axios_api';
import { handleApiError } from './api_error';

// Get the current hostname and port for development
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment ? '/api' : '/api';

// Audits
export const getAudits = async () => {
    try {
        const response = await api.get(`${API_BASE_URL}/audits/audits/`);
        // Ensure we always return an array
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAudit = async (id: number) => {
    try {
        const response = await api.get(`${API_BASE_URL}/audits/audits/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createAudit = async (data: any) => {
    try {
        const response = await api.post(`${API_BASE_URL}/audits/audits/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAudit = async (id: number, data: any) => {
    try {
        const response = await api.patch(`${API_BASE_URL}/audits/audits/${id}/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAudit = async (id: number) => {
    try {
        await api.delete(`${API_BASE_URL}/audits/audits/${id}/`);
    } catch (error) {
        throw handleApiError(error);
    }
}; 