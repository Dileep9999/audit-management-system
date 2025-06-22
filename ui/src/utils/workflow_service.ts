import { Node, Edge, XYPosition } from 'reactflow';
import axiosApi from './axios_api';
import { WorkflowNodeData, EdgeData } from '../models/Workflow';
import { WorkflowData, WorkflowTransitions, saveWorkflowWithTransitions } from './workflow_transitions';

export type WorkflowStatus = 'draft' | 'active' | 'inactive';

export interface Workflow {
  id: number;
  name: string;
  description: string;
  status: WorkflowStatus;
  data: {
    nodes: Node<WorkflowNodeData>[];
    edges: Edge<EdgeData>[];
    transitions: WorkflowTransitions;
  };
  created_at: string;
  updated_at: string;
  created_by_name: string;
  version: number;
}

export interface CreateWorkflowPayload {
  name: string;
  description: string;
  status: WorkflowStatus;
  data: {
    nodes: Node<WorkflowNodeData>[];
    edges: Edge<EdgeData>[];
    transitions: WorkflowTransitions;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface WorkflowListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
}

export const workflowService = {
  async createWorkflow(data: CreateWorkflowPayload): Promise<Workflow> {
    const response = await axiosApi.post<Workflow>('/api/workflows/workflows/', data);
    return response.data;
  },

  async updateWorkflow(id: number, data: CreateWorkflowPayload): Promise<Workflow> {
    const response = await axiosApi.put<Workflow>(`/api/workflows/workflows/${id}/`, data);
    return response.data;
  },

  async getWorkflow(id: number): Promise<Workflow> {
    const response = await axiosApi.get<Workflow>(`/api/workflows/workflows/${id}/`);
    return response.data;
  },

  async getWorkflows(params?: WorkflowListParams): Promise<PaginatedResponse<Workflow>> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }

    const url = `/api/workflows/workflows/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosApi.get<PaginatedResponse<Workflow>>(url);
    return response.data;
  },

  async deleteWorkflow(id: number): Promise<void> {
    await axiosApi.delete(`/api/workflows/workflows/${id}/`);
  },

  async duplicateWorkflow(id: number): Promise<Workflow> {
    const response = await axiosApi.post<Workflow>(`/api/workflows/workflows/${id}/duplicate/`);
    return response.data;
  }
}; 