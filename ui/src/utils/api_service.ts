import axiosApi from './axios_api';
import { handleApiError } from './api_error';

// Get the current hostname and port for development
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment ? '/api' : '/api';

// Static audit type configurations
export const AUDIT_TYPES = [
  { id: 'internal', name: 'Internal' },
  { id: 'external', name: 'External' },
  { id: 'compliance', name: 'Compliance' },
  { id: 'financial', name: 'Financial' },
  { id: 'operational', name: 'Operational' },
  { id: 'it', name: 'IT' },
  { id: 'performance', name: 'Performance' }
] as const;

export type AuditTypeId = typeof AUDIT_TYPES[number]['id'];

// Remove static status configurations - these will now be dynamic from workflows
// export const AUDIT_STATUSES = [
//   { id: 'planned', name: 'Planned' },
//   { id: 'in_progress', name: 'In Progress' },
//   { id: 'completed', name: 'Completed' },
//   { id: 'closed', name: 'Closed' }
// ] as const;

// export type AuditStatusId = typeof AUDIT_STATUSES[number]['id'];

// Audits
export const getAudits = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/`);
        // Ensure we always return an array
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAudit = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createAudit = async (data: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAudit = async (id: number, data: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/audits/audits/${id}/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAudit = async (id: number) => {
    try {
        await axiosApi.delete(`${API_BASE_URL}/audits/audits/${id}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};

// Users
export const getUsers = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/users/`);
        // Ensure we always return an array
        const users = Array.isArray(response.data) ? response.data : response.data.results || [];
        return users;
    } catch (error: any) {
        console.error('Error fetching users:', error);
        throw handleApiError(error);
    }
};

// Workflows
export const getWorkflows = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/workflows/workflows/`);
        // Ensure we always return an array
        const workflows = Array.isArray(response.data) ? response.data : response.data.results || [];
        return workflows;
    } catch (error: any) {
        console.error('Error fetching workflows:', error);
        throw handleApiError(error);
    }
};

// Dynamic status functions
export const getAuditStatuses = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/audit_statuses/`);
        return response;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAvailableTransitions = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/available_transitions/`);
        return response;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const transitionAuditStatus = async (auditId: number, status: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/${auditId}/transition_status/`, { status });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}; 