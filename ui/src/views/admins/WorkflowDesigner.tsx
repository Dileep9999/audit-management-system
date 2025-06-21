import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
  NodeProps,
  Panel,
  EdgeMouseHandler,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, ArrowLeft, Save, Edit2, X } from 'lucide-react';
import Popup from '../../components/shared/Popup';
import { workflowService, Workflow, CreateWorkflowPayload, WorkflowStatus } from '../../utils/workflow_service';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface WorkflowNode {
  name: string;
}

interface WorkflowNodeData extends WorkflowNode {
  type: 'task';
}

// Custom handle styles
const handleStyle = {
  width: '10px',
  height: '10px',
  backgroundColor: '#64748b',
  border: '2px solid #fff',
};

const TaskNode = ({ data, id }: NodeProps<WorkflowNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.name);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeName.trim()) {
      data.name = nodeName.trim();
      setIsEditing(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-w-[200px]">
      {/* Top Handle */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, left: '50%' }}
      />

      {/* Left Handle */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ ...handleStyle, top: '50%' }}
      />

      {/* Right Handle */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ ...handleStyle, top: '50%' }}
      />

      {/* Node Content */}
      <div className="flex items-center justify-between">
        {isEditing ? (
          <form onSubmit={handleEdit} className="flex-1">
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
              onBlur={handleEdit}
            />
          </form>
        ) : (
          <>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{data.name}</div>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit2 className="h-3 w-3 text-gray-500" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Handle */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, left: '50%' }}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  task: TaskNode,
};

// Custom edge styles
const edgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#64748b', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#64748b',
    width: 20,
    height: 20,
  },
};

interface ApiErrorResponse {
  [key: string]: string[];
}

interface WorkflowFormData {
  name: string;
  description: string;
  status: WorkflowStatus;
}

const WorkflowDesigner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newNode, setNewNode] = useState<WorkflowNode>({ name: '' });
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    status: 'draft'
  });
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      setIsLoading(true);
      const workflow = await workflowService.getWorkflow(workflowId);
      setWorkflow(workflow);
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        status: workflow.status
      });
      
      // Ensure nodes and edges have all required properties
      const processedNodes = workflow.data.nodes.map(node => ({
        ...node,
        type: node.type || 'task',
        className: 'group',
      }));
      
      const processedEdges = workflow.data.edges.map(edge => ({
        ...edge,
        ...edgeOptions,
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
    } catch (error) {
      console.error('Error loading workflow:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.detail || 'Failed to load workflow');
      } else {
        toast.error('Failed to load workflow');
      }
      navigate('/admins/workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const validateConnection = (connection: Connection) => {
    // Don't allow connections to the same node
    if (connection.source === connection.target) {
      return false;
    }

    // Check for existing connections between the same handles
    const duplicateConnection = edges.some(
      edge => 
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );

    if (duplicateConnection) {
      return false;
    }

    // Validate source and target handle types
    const sourceHandleId = connection.sourceHandle || '';
    const targetHandleId = connection.targetHandle || '';
    
    // Ensure we're connecting source handles to target handles
    const isSourceValid = sourceHandleId === 'right' || sourceHandleId === 'bottom';
    const isTargetValid = targetHandleId === 'left' || targetHandleId === 'top';

    return isSourceValid && isTargetValid;
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      if (validateConnection(connection)) {
        // Ensure connection has required source and target
        if (connection.source && connection.target) {
          const newEdge: Edge = {
            ...connection,
            source: connection.source,
            target: connection.target,
            id: `edge-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
            ...edgeOptions,
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
      }
    },
    [edges, setEdges]
  );

  const onEdgeClick: EdgeMouseHandler = (event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  };

  const onEdgeDelete = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  const handleAddNode = () => {
    if (!newNode.name.trim()) return;

    const newNodeId = `node_${Date.now()}`;
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500
    };

    setNodes((nds) => [
      ...nds,
      {
        id: newNodeId,
        type: 'task',
        position,
        data: { ...newNode, type: 'task' },
        className: 'group',
      }
    ]);

    setShowAddModal(false);
    setNewNode({ name: '' });
  };

  const validateWorkflow = (): string[] => {
    const errors: string[] = [];

    // Validate form data
    if (!formData.name.trim()) {
      errors.push('Workflow name is required');
    }

    // Validate nodes
    if (nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Check for nodes without names
    const unnamedNodes = nodes.filter(node => !node.data?.name);
    if (unnamedNodes.length > 0) {
      errors.push(`${unnamedNodes.length} node(s) are missing names`);
    }

    // Check for disconnected nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are not connected to any other nodes`);
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateWorkflow();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsSaving(true);
      const workflowData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        data: {
          nodes: nodes.map(({ id, type, position, data }) => ({
            id,
            type,
            position,
            data
          })),
          edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
            id,
            source,
            target,
            sourceHandle,
            targetHandle
          }))
        }
      };

      if (id) {
        await workflowService.updateWorkflow(parseInt(id), workflowData);
        toast.success('Workflow updated successfully');
      } else {
        const newWorkflow = await workflowService.createWorkflow(workflowData);
        toast.success('Workflow created successfully');
        navigate(`/admins/workflows/designer/${newWorkflow.id}`);
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        if (typeof data === 'object') {
          Object.entries(data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => toast.error(`${field}: ${error}`));
            }
          });
        } else {
          toast.error(data?.detail || 'Failed to save workflow');
        }
      } else {
        toast.error('Failed to save workflow');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onPaneClick = () => {
    setSelectedEdge(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admins/workflows')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Workflows</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Workflow Name"
              className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as WorkflowStatus }))}
              className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add Node</span>
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
        >
          <Background color="#e2e8f0" gap={16} size={1} />
          <Controls />
          <Panel position="top-left" className="flex gap-2">
            <div className="text-sm text-gray-500">
              {workflow ? (
                <>
                  <div>Version: {workflow.version}</div>
                  <div>Created by: {workflow.created_by_name}</div>
                </>
              ) : (
                <div>New Workflow</div>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add Node Modal */}
      <Popup
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewNode({ name: '' });
        }}
        title="Add Node"
        size="modal-sm"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setShowAddModal(false);
                setNewNode({ name: '' });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              onClick={handleAddNode}
              disabled={!newNode.name.trim()}
            >
              Add
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Name
          </label>
          <input
            type="text"
            value={newNode.name}
            onChange={(e) => setNewNode({ name: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter node name"
            autoFocus
          />
        </div>
      </Popup>

      {/* Save Modal */}
      <Popup
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Workflow"
        size="modal-md"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowSaveModal(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as WorkflowStatus }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Popup>

      {/* Delete Edge Modal */}
      <Popup
        isOpen={!!selectedEdge}
        onClose={() => setSelectedEdge(null)}
        title="Delete Connection"
        size="modal-sm"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => setSelectedEdge(null)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={onEdgeDelete}
            >
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this connection?</p>
      </Popup>
    </div>
  );
};

export default WorkflowDesigner; 