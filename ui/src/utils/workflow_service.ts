import { Node, Edge } from 'reactflow';
import axiosApi from './axios_api';

export interface Workflow {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  data: WorkflowData;
}

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

export interface CreateWorkflowPayload {
  name: string;
  data: WorkflowData;
}

export const workflowService = {
  getWorkflows: async (): Promise<Workflow[]> => {
    const response = await axiosApi.get('/api/workflows/');
    return response.data;
  },

  getWorkflow: async (id: number): Promise<Workflow> => {
    const response = await axiosApi.get(`/api/workflows/${id}/`);
    return response.data;
  },

  createWorkflow: async (workflow: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosApi.post('/api/workflows/', workflow);
    return response.data;
  },

  updateWorkflow: async (id: number, workflow: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosApi.put(`/api/workflows/${id}/`, workflow);
    return response.data;
  },

  deleteWorkflow: async (id: number): Promise<void> => {
    await axiosApi.delete(`/api/workflows/${id}/`);
  },

  duplicateWorkflow: async (id: number): Promise<Workflow> => {
    const response = await axiosApi.post(`/api/workflows/${id}/duplicate/`);
    return response.data;
  }
}; 