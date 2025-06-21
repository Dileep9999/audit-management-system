import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, FileX, Plus, Calendar, Tag, AlertTriangle, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import Pagination from '../../components/shared/Pagination';
import { Workflow } from '../../models/Workflow';
import Popup from '../../components/shared/Popup';
import Confirm from '../../components/shared/Confirm';

const WORKFLOW_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'] as const;
const WORKFLOW_TYPES = ['Audit', 'Compliance', 'Risk', 'Policy', 'Review', 'Approval'];
const WORKFLOW_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
const WORKFLOW_LABELS = ['Bug', 'Feature', 'Documentation', 'Enhancement', 'Security'];

const dummyWorkflows: Workflow[] = [
  { 
    id: 1, 
    name: 'Annual Audit Review', 
    description: 'Review and approve annual audit reports',
    status: 'In Progress',
    type: 'Audit',
    priority: 'High',
    createdAt: '05-01-2024 14:23',
    updatedAt: '05-02-2024 09:30',
    assignedTo: 'Alice Smith',
    dueDate: '05-15-2024',
    labels: ['Documentation']
  },
  { 
    id: 2, 
    name: 'Quarterly Compliance Check', 
    description: 'Verify compliance with regulatory requirements',
    status: 'To Do',
    type: 'Compliance',
    priority: 'Medium',
    createdAt: '04-28-2024 09:10',
    updatedAt: '04-28-2024 09:10',
    assignedTo: 'Bob Johnson',
    dueDate: '05-30-2024',
    labels: ['Security']
  },
  { 
    id: 3, 
    name: 'Risk Assessment', 
    description: 'Conduct risk assessment for new projects',
    status: 'Done',
    type: 'Risk',
    priority: 'Urgent',
    createdAt: '05-02-2024 08:45',
    updatedAt: '05-02-2024 15:20',
    assignedTo: 'Charlie Lee',
    dueDate: '05-10-2024',
    labels: ['Documentation', 'Security']
  },
  { 
    id: 4, 
    name: 'Policy Review', 
    description: 'Review and update company policies',
    status: 'In Review',
    type: 'Policy',
    priority: 'Low',
    createdAt: '04-30-2024 16:00',
    updatedAt: '05-01-2024 11:45',
    assignedTo: 'David Kim',
    dueDate: '05-20-2024',
    labels: ['Documentation']
  }
];

const emptyWorkflow: Workflow = {
  id: 0,
  name: '',
  description: '',
  status: 'To Do',
  type: '',
  priority: 'Medium',
  createdAt: '',
  updatedAt: '',
  assignedTo: '',
  labels: []
};

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(dummyWorkflows);
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<Workflow>(emptyWorkflow);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Validation functions
  const isFormValid = (workflow: Workflow) => {
    return workflow.name.trim() !== '' && 
           workflow.description.trim() !== '' && 
           workflow.type.trim() !== '' &&
           workflow.assignedTo.trim() !== '';
  };

  const isAddFormValid = isFormValid(newWorkflow);
  const isEditFormValid = editWorkflow ? isFormValid(editWorkflow) : false;

  // Filtered workflows
  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(filter.toLowerCase()) ||
    w.description.toLowerCase().includes(filter.toLowerCase()) ||
    w.type.toLowerCase().includes(filter.toLowerCase()) ||
    w.status.toLowerCase().includes(filter.toLowerCase()) ||
    w.assignedTo.toLowerCase().includes(filter.toLowerCase()) ||
    w.priority.toLowerCase().includes(filter.toLowerCase())
  );

  // Group workflows by status for board view
  const workflowsByStatus = WORKFLOW_STATUSES.reduce((acc, status) => {
    acc[status] = filteredWorkflows.filter(w => w.status === status);
    return acc;
  }, {} as Record<typeof WORKFLOW_STATUSES[number], Workflow[]>);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same status column
      const items = Array.from(workflowsByStatus[source.droppableId as typeof WORKFLOW_STATUSES[number]]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      setWorkflows(prevWorkflows => 
        prevWorkflows.map(w => 
          w.status === source.droppableId ? items.find(item => item.id === w.id) || w : w
        )
      );
    } else {
      // Moving to a different status column
      const workflow = workflows.find(w => w.id === parseInt(draggableId));
      if (workflow) {
        const updatedWorkflow = {
          ...workflow,
          status: destination.droppableId as typeof WORKFLOW_STATUSES[number],
          updatedAt: new Date().toLocaleString()
        };
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(w => w.id === workflow.id ? updatedWorkflow : w)
        );
      }
    }
  };

  const handleEdit = (workflow: Workflow) => {
    setEditWorkflow(workflow);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editWorkflow) return;
    setEditWorkflow({ ...editWorkflow, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (!editWorkflow) return;
    const updatedWorkflow = {
      ...editWorkflow,
      updatedAt: new Date().toLocaleString()
    };
    setWorkflows(workflows.map(w => (w.id === editWorkflow.id ? updatedWorkflow : w)));
    setShowEditModal(false);
    setEditWorkflow(null);
  };

  const handleDelete = (id: number) => {
    setDeleteWorkflowId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteWorkflowId !== null) {
      setWorkflows(workflows.filter(w => w.id !== deleteWorkflowId));
    }
    setShowDeleteDialog(false);
    setDeleteWorkflowId(null);
  };

  const handleAdd = () => {
    const nextId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;
    const newWorkflowWithDates = {
      ...newWorkflow,
      id: nextId,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    };
    setWorkflows([newWorkflowWithDates, ...workflows]);
    setShowAddModal(false);
    setNewWorkflow(emptyWorkflow);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderWorkflowCard = (workflow: Workflow, index: number) => (
    <Draggable key={workflow.id} draggableId={workflow.id.toString()} index={index}>
      {(provided: DraggableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white dark:bg-gray-700 p-4 mb-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(workflow)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(workflow.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{workflow.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {workflow.labels.map((label, i) => (
              <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                {workflow.priority}
              </span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs">{workflow.dueDate}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{workflow.assignedTo}</span>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Workflows</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'board' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('board')}
            >
              Board
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <input
            type="text"
            placeholder="Filter workflows..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-64"
          />
          <button
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {viewMode === 'board' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW_STATUSES.map(status => (
              <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h2 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {status} ({workflowsByStatus[status].length})
                </h2>
                <Droppable droppableId={status}>
                  {(provided: DroppableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[200px]"
                    >
                      {workflowsByStatus[status].map((workflow, index) => 
                        renderWorkflowCard(workflow, index)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Add/Edit Modal */}
      <Popup
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditWorkflow(null);
        }}
        title={showAddModal ? "Add Workflow" : "Edit Workflow"}
        size="modal-lg"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditWorkflow(null);
              }}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                (showAddModal ? isAddFormValid : isEditFormValid)
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={showAddModal ? handleAdd : handleUpdate}
              disabled={!(showAddModal ? isAddFormValid : isEditFormValid)}
            >
              {showAddModal ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={showAddModal ? newWorkflow.name : editWorkflow?.name || ''}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, name: e.target.value }) : handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={showAddModal ? newWorkflow.description : editWorkflow?.description || ''}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, description: e.target.value }) : handleEditChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={showAddModal ? newWorkflow.type : editWorkflow?.type || ''}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, type: e.target.value }) : handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Type</option>
              {WORKFLOW_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={showAddModal ? newWorkflow.priority : editWorkflow?.priority || 'Medium'}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, priority: e.target.value as any }) : handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {WORKFLOW_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <input
              type="text"
              name="assignedTo"
              value={showAddModal ? newWorkflow.assignedTo : editWorkflow?.assignedTo || ''}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, assignedTo: e.target.value }) : handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={showAddModal ? newWorkflow.dueDate : editWorkflow?.dueDate || ''}
              onChange={showAddModal ? (e) => setNewWorkflow({ ...newWorkflow, dueDate: e.target.value }) : handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Labels</label>
            <div className="flex flex-wrap gap-2">
              {WORKFLOW_LABELS.map(label => (
                <button
                  key={label}
                  onClick={() => {
                    if (showAddModal) {
                      const labels = newWorkflow.labels.includes(label)
                        ? newWorkflow.labels.filter(l => l !== label)
                        : [...newWorkflow.labels, label];
                      setNewWorkflow({ ...newWorkflow, labels });
                    } else if (editWorkflow) {
                      const labels = editWorkflow.labels.includes(label)
                        ? editWorkflow.labels.filter(l => l !== label)
                        : [...editWorkflow.labels, label];
                      setEditWorkflow({ ...editWorkflow, labels });
                    }
                  }}
                  className={`px-2 py-1 rounded-full text-xs ${
                    (showAddModal ? newWorkflow.labels : editWorkflow?.labels || []).includes(label)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Popup>

      {/* Delete Confirm Dialog */}
      <Confirm
        isOpen={showDeleteDialog}
        title="Confirm Delete"
        message={
          <span>
            Are you sure you want to delete this workflow?
          </span>
        }
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Workflows; 