import { Node, Edge } from 'reactflow';
import axiosApi from './axios_api';

export type WorkflowStatus = 'draft' | 'active' | 'archived';

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  data: WorkflowData;
  version: number;
  status: WorkflowStatus;
}

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  data: WorkflowData;
  status: WorkflowStatus;
}

export interface UpdateWorkflowPayload extends CreateWorkflowPayload {
  id: number;
}

export const workflowService = {
  getWorkflows: async (params?: { page?: number; page_size?: number; ordering?: string }): Promise<{ results: Workflow[]; count: number }> => {
    const response = await axiosApi.get('/api/workflows/workflows/', { params });
    return response.data;
  },

  getWorkflow: async (id: number): Promise<Workflow> => {
    const response = await axiosApi.get(`/api/workflows/workflows/${id}/`);
    return response.data;
  },

  createWorkflow: async (workflow: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosApi.post('/api/workflows/workflows/', workflow);
    return response.data;
  },

  updateWorkflow: async (id: number, workflow: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosApi.put(`/api/workflows/workflows/${id}/`, workflow);
    return response.data;
  },

  deleteWorkflow: async (id: number): Promise<void> => {
    await axiosApi.delete(`/api/workflows/workflows/${id}/`);
  },

  duplicateWorkflow: async (id: number): Promise<Workflow> => {
    const response = await axiosApi.post(`/api/workflows/workflows/${id}/duplicate/`);
    return response.data;
  }
}; 