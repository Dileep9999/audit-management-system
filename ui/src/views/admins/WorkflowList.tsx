import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { workflowService, Workflow } from '../../utils/workflow_service';
import { toast } from 'react-toastify';
import Popup from '../../components/shared/Popup';
import { AxiosError } from 'axios';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await workflowService.getWorkflows();
      setWorkflows(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.detail || 'Failed to load workflows');
      } else {
        toast.error('Failed to load workflows');
      }
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkflow) return;

    try {
      setIsLoading(true);
      await workflowService.deleteWorkflow(selectedWorkflow.id);
      setWorkflows(prevWorkflows => prevWorkflows.filter(w => w.id !== selectedWorkflow.id));
      toast.success('Workflow deleted successfully');
      setShowDeleteModal(false);
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.detail || 'Failed to delete workflow');
      } else {
        toast.error('Failed to delete workflow');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      setIsLoading(true);
      const newWorkflow = await workflowService.duplicateWorkflow(workflow.id);
      setWorkflows(prevWorkflows => [...prevWorkflows, newWorkflow]);
      toast.success('Workflow duplicated successfully');
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.detail || 'Failed to duplicate workflow');
      } else {
        toast.error('Failed to duplicate workflow');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (workflow: Workflow) => {
    navigate(`/admins/workflows/designer/${workflow.id}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <button
          onClick={() => navigate('/admins/workflows/designer')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 mb-4">No workflows found</p>
          <button
            onClick={() => navigate('/admins/workflows/designer')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create your first workflow</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {workflow.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(workflow)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    title="Duplicate"
                    disabled={isLoading}
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleEdit(workflow)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    title="Edit"
                    disabled={isLoading}
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setShowDeleteModal(true);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    title="Delete"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(workflow.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last modified: {new Date(workflow.updated_at).toLocaleDateString()}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Nodes: {workflow.data.nodes.length} | Connections: {workflow.data.edges.length}
              </div>
            </div>
          ))}
        </div>
      )}

      <Popup
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedWorkflow(null);
        }}
        title="Delete Workflow"
        size="modal-sm"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedWorkflow(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the workflow "{selectedWorkflow?.name}"?
          This action cannot be undone.
        </p>
      </Popup>
    </div>
  );
};

export default WorkflowList; 