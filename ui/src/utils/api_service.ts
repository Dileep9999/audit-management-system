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

// Audits API methods
export const getAudits = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/`);
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
        const response = await axiosApi.delete(`${API_BASE_URL}/audits/audits/${id}/`);
        return response.data;
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
        console.log(`[API] PUT ${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
        console.log('[API] Request data:', JSON.stringify(data, null, 2));
        
        const response = await axiosApi.put(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`, data);
        
        console.log('[API] Response status:', response.status);
        console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error: any) {
        console.error('[API] Request failed:', error);
        if (error?.response) {
            console.error('[API] Error status:', error.response.status);
            console.error('[API] Error data:', JSON.stringify(error.response.data, null, 2));
            console.error('[API] Error headers:', error.response.headers);
        }
        throw handleApiError(error);
    }
};

export const assignUsersToTask = async (taskId: number, userIds: number[]) => {
    try {
        const response = await axiosApi.patch(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`, {
            assigned_users: userIds
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const removeUserFromTask = async (taskId: number, userId: number) => {
    try {
        // Get current task data
        const taskResponse = await axiosApi.get(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
        const currentUserIds = taskResponse.data.assigned_users || [];
        
        // Remove the user from the list
        const updatedUserIds = currentUserIds.filter((id: number) => id !== userId);
        
        // Update task with new user list
        const response = await axiosApi.patch(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`, {
            assigned_users: updatedUserIds
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addUserToTask = async (taskId: number, userId: number) => {
    try {
        // Get current task data
        const taskResponse = await axiosApi.get(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
        const currentUserIds = taskResponse.data.assigned_users || [];
        
        // Add the user if not already assigned
        if (!currentUserIds.includes(userId)) {
            currentUserIds.push(userId);
        }
        
        // Update task with new user list
        const response = await axiosApi.patch(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`, {
            assigned_users: currentUserIds
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAuditTask = async (taskId: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/audits/audit-tasks/${taskId}/`);
        return response.data;
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
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/complete/`, {
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
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// Workflows
export const getWorkflows = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/workflows/workflows/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return [];
    }
};

// Dynamic status functions
export const getAuditStatuses = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/statuses/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        return [];
    }
};

export const getAvailableTransitions = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/available_transitions/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const transitionAuditStatus = async (auditId: number, status: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/${auditId}/transition_status/`, {
            status
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist Template API functions
export const getChecklistTemplates = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklistTemplate = async (templateData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/templates/`, templateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateChecklistTemplate = async (id: number, templateData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/api/templates/${id}/`, templateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/checklists/api/templates/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const duplicateChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/templates/${id}/duplicate/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const freezeChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/templates/${id}/freeze/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const unfreezeChecklistTemplate = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/templates/${id}/unfreeze/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFieldTypes = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/field-types/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist API functions
export const getChecklists = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getChecklist = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklist = async (checklistData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/`, checklistData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateChecklist = async (id: number, checklistData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/api/checklists/${id}/`, checklistData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteChecklist = async (id: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/checklists/api/checklists/${id}/`);
        return response.data;
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
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/responses/`, {
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
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/responses/`);
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
        
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/submit-response/`, payload);
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
        
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/update-responses/`, payload);
        return response.data;
    } catch (error) {
        console.error('API updateChecklistResponses error:', error);
        throw handleApiError(error);
    }
};

// Change checklist status
export const changeChecklistStatus = async (checklistId: number, status: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/change-status/`, {
            status
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Additional Checklist API methods
export const getChecklistProgress = async (checklistId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/progress/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getMyChecklists = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/my-checklists/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getDashboardStats = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/dashboard-stats/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Audit Findings API methods
export const getAuditFindings = async (auditId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audits/${auditId}/findings/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createAuditFinding = async (auditId: number, findingData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audits/${auditId}/findings/`, findingData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAuditFinding = async (findingId: number, findingData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/audits/findings/${findingId}/`, findingData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Task Management APIs
export const submitTaskForReview = async (taskId: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/submit-for-review/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const approveTask = async (taskId: number, notes?: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/approve/`, {
            notes
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const rejectTask = async (taskId: number, reason: string) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/audit-tasks/${taskId}/reject/`, {
            reason
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTaskReviews = async (taskId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/audit-tasks/${taskId}/reviews/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

// File Upload utilities
export const uploadFile = async (file: File, taskId?: number) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) {
            formData.append('task_id', taskId.toString());
        }
        
        const response = await axiosApi.post(`${API_BASE_URL}/files/upload/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Notification APIs
export const getNotifications = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/notifications/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const markNotificationRead = async (notificationId: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/notifications/${notificationId}/mark_read/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// ============================================
// COMPREHENSIVE CHECKLIST MANAGEMENT APIs
// ============================================

// Template Advanced Operations
export const getTemplateUsageStats = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/${id}/usage-stats/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addFieldsToTemplate = async (id: number, fieldsData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/templates/${id}/add-fields/`, fieldsData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTemplateCategories = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/categories/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getPopularTemplates = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/templates/popular/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist Comments
export const getChecklistComments = async (checklistId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/comments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklistComment = async (checklistId: number, commentData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/comments/`, commentData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist Attachments
export const getChecklistAttachments = async (checklistId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/attachments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const uploadChecklistAttachment = async (checklistId: number, fileData: FormData) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${checklistId}/attachments/`, fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const downloadChecklistAttachment = async (attachmentId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/attachments/${attachmentId}/download/`, {
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Checklist Advanced Operations
export const duplicateChecklist = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/${id}/duplicate/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const exportChecklist = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/checklists/${id}/export/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Field Management
export const getChecklistFields = async (params?: any) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/checklists/api/fields/`, { params });
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createChecklistField = async (fieldData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/fields/`, fieldData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateChecklistField = async (id: number, fieldData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/checklists/api/fields/${id}/`, fieldData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteChecklistField = async (id: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/checklists/api/fields/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const reorderChecklistFields = async (fieldOrders: any[]) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/fields/reorder/`, { field_orders: fieldOrders });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const duplicateChecklistField = async (id: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/fields/${id}/duplicate/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Bulk Operations
export const bulkUpdateChecklists = async (updateData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/checklists/api/checklists/bulk-update/`, updateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Auto-save functionality for checklist responses
export const autoSaveResponse = async (checklistId: number, fieldId: number, value: any, debounceMs: number = 1000) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(async () => {
            try {
                const result = await submitFieldResponse(checklistId, fieldId, {
                    value,
                    is_completed: false
                });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }, debounceMs);

        // Store timeout ID for potential cancellation
        (autoSaveResponse as any).timeoutId = timeoutId;
    });
};

// Validation helpers
export const validateFieldResponse = async (fieldType: string, value: any, fieldConfig: any) => {
    try {
        // Client-side validation logic
        switch (fieldType) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value?.email || '');
            
            case 'url':
                const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
                return urlRegex.test(value?.url || '');
            
            case 'number':
                const num = parseFloat(value?.number || 0);
                if (fieldConfig.min_value && num < fieldConfig.min_value) return false;
                if (fieldConfig.max_value && num > fieldConfig.max_value) return false;
                return !isNaN(num);
            
            case 'text':
            case 'textarea':
                const text = value?.text || '';
                if (fieldConfig.min_length && text.length < fieldConfig.min_length) return false;
                if (fieldConfig.max_length && text.length > fieldConfig.max_length) return false;
                return true;
            
            default:
                return true;
        }
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
};

// Progress calculation utilities
export const calculateChecklistProgress = (responses: any[], fields: any[]) => {
    const totalFields = fields.filter(f => f.field_type !== 'section').length;
    const completedFields = responses.filter(r => r.is_completed).length;
    
    return {
        total: totalFields,
        completed: completedFields,
        percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    };
};

// Real-time collaboration utilities
export const subscribeToChecklistUpdates = (checklistId: number, callback: (data: any) => void) => {
    // In a real application, this would set up WebSocket or SSE connection
    // For now, we'll implement polling or leave as placeholder
    console.log(`Subscribing to updates for checklist ${checklistId}`);
    
    // Return unsubscribe function
    return () => {
        console.log(`Unsubscribing from updates for checklist ${checklistId}`);
    };
};

// Export utility functions for external use
export const checklistUtils = {
    autoSaveResponse,
    validateFieldResponse,
    calculateChecklistProgress,
    subscribeToChecklistUpdates
};

// ======================== TEAMS API ========================

// Team management
export const getTeams = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/teams/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTeam = async (id: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/teams/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createTeam = async (teamData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/teams/`, teamData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateTeam = async (id: number, teamData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/audits/teams/${id}/`, teamData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteTeam = async (id: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/audits/teams/${id}/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Team members management
export const getTeamMembers = async (teamId: number) => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/teams/${teamId}/members/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addTeamMember = async (teamId: number, memberData: any) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/teams/${teamId}/add_member/`, memberData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const removeTeamMember = async (teamId: number, userId: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/audits/teams/${teamId}/remove_member/`, {
            data: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateTeamMember = async (teamId: number, memberId: number, memberData: any) => {
    try {
        const response = await axiosApi.put(`${API_BASE_URL}/audits/teams/${teamId}/members/${memberId}/`, memberData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Team audit assignments
export const assignTeamToAudit = async (teamId: number, auditId: number) => {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/audits/teams/${teamId}/assign_to_audit/`, {
            audit_id: auditId
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const unassignTeamFromAudit = async (teamId: number, auditId: number) => {
    try {
        const response = await axiosApi.delete(`${API_BASE_URL}/audits/teams/${teamId}/unassign_from_audit/`, {
            data: { audit_id: auditId }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Team utility endpoints
export const getMyTeams = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/teams/my_teams/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getTeamStatistics = async () => {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/audits/teams/statistics/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Team type options for frontend
export const TEAM_TYPES = [
    { id: 'audit', name: 'Audit Team' },
    { id: 'review', name: 'Review Team' },
    { id: 'management', name: 'Management Team' },
    { id: 'technical', name: 'Technical Team' },
    { id: 'compliance', name: 'Compliance Team' }
] as const;

export type TeamTypeId = typeof TEAM_TYPES[number]['id'];

// Team member roles for frontend
export const TEAM_MEMBER_ROLES = [
    { id: 'member', name: 'Member' },
    { id: 'lead', name: 'Team Lead' },
    { id: 'manager', name: 'Manager' },
    { id: 'admin', name: 'Admin' }
] as const;

export type TeamMemberRoleId = typeof TEAM_MEMBER_ROLES[number]['id']; 