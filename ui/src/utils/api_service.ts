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

// Audit Tasks
export const getAuditTasks = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/tasks/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAuditTask = async (taskId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createAuditTask = async (auditId: number, data: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/${auditId}/tasks/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAuditTask = async (taskId: number, data: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAuditTask = async (taskId: number) => {
    try {
        await axiosApi.delete(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTaskTemplates = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/task_templates/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTaskSummary = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/task_summary/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const bulkCreateTasks = async (auditId: number, templates: any[]) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/${auditId}/bulk_create_tasks/`, {
            templates
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Task Evidence
export const getTaskEvidence = async (taskId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audit-tasks/${taskId}/evidence/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addTaskEvidence = async (taskId: number, data: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/evidence/`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const verifyEvidence = async (taskId: number, evidenceId: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/verify_evidence/`, {
            evidence_id: evidenceId
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateTaskCompletion = async (taskId: number, completionNotes: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/update_completion/`, {
            completion_notes: completionNotes
        });
        return response.data;
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

// Checklist Template API functions
export const getChecklistTemplates = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/templates/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/templates/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklistTemplate = async (templateData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/templates/`, templateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateChecklistTemplate = async (id: number, templateData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/templates/${id}/`, templateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteChecklistTemplate = async (id: number) => {
    try {
        await axiosApi.delete(`${API_BASE_URL}/checklists/templates/${id}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};

export const duplicateChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/templates/${id}/duplicate/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const freezeChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/templates/${id}/freeze/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const unfreezeChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/templates/${id}/unfreeze/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFieldTypes = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/templates/field_types/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist API functions
export const getChecklists = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/checklists/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getChecklist = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/checklists/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklist = async (checklistData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/checklists/`, checklistData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateChecklist = async (id: number, checklistData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/checklists/${id}/`, checklistData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteChecklist = async (id: number) => {
    try {
        await axiosApi.delete(`${API_BASE_URL}/checklists/checklists/${id}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist Response API functions
export const updateChecklistResponse = async (responseId: number, responseData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/responses/${responseId}/`, responseData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const submitChecklistResponse = async (checklistId: number, responses: any[]) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/checklists/${checklistId}/submit/`, {
            responses
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get checklist responses for a checklist
export const getChecklistResponses = async (checklistId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/checklists/${checklistId}/responses/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Submit single field response
export const submitFieldResponse = async (checklistId: number, fieldId: number, responseData: any) => {
    try {
        const payload = {
            field_id: fieldId,
            value: responseData.value || {},
            is_completed: responseData.is_completed || false,
            comments: responseData.comments || ''
        };
        
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/checklists/${checklistId}/submit_response/`, payload);
        return response.data;
    } catch (error) {
        console.error('API submitFieldResponse error:', error);
        throw handleApiError(error);
    }
};

// Update multiple responses
export const updateChecklistResponses = async (checklistId: number, responses: any[]) => {
    try {
        const payload = {
            responses: responses.map(r => ({
                id: r.id,
                field_id: r.field_id,
                value: r.value || {},
                is_completed: r.is_completed || false,
                comments: r.comments || ''
            }))
        };
        
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/checklists/${checklistId}/responses/`, payload);
        return response.data;
    } catch (error) {
        console.error('API updateChecklistResponses error:', error);
        throw handleApiError(error);
    }
};

// Change checklist status
export const changeChecklistStatus = async (checklistId: number, status: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/checklists/${checklistId}/change_status/`, {
            status
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}; 