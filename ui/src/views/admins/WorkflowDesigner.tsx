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
  actions?: string[];
  roles?: number[];
}

interface WorkflowNodeData extends WorkflowNode {
  type: 'task';
}

interface Role {
  id: number;
  name: string;
  description: string;
  severity: string;
  hierarchy_position: number;
  status: 'Active' | 'Inactive';
}

interface EdgeData {
  actions: string[];
}

type WorkflowEdge = Edge<EdgeData>;

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
  const [nodeActions, setNodeActions] = useState<string[]>(data.actions || []);
  const [nodeRoles, setNodeRoles] = useState<number[]>(data.roles || []);
  const [newAction, setNewAction] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    // Fetch available roles when the edit popup opens
    if (isEditing) {
      const fetchRoles = async () => {
        try {
          const response = await fetch('/api/roles/roles/');
          const data = await response.json();
          setRoles(data.results || data);
        } catch (error) {
          console.error('Error fetching roles:', error);
          toast.error('Failed to load roles');
        }
      };
      fetchRoles();
    }
  }, [isEditing]);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeName.trim()) {
      data.name = nodeName.trim();
      data.actions = nodeActions;
      data.roles = nodeRoles;
      setIsEditing(false);
    }
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setNodeActions([...nodeActions, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setNodeActions(nodeActions.filter((_, i) => i !== index));
  };

  const handleRoleChange = (roleId: number) => {
    if (nodeRoles.includes(roleId)) {
      setNodeRoles(nodeRoles.filter(id => id !== roleId));
    } else {
      setNodeRoles([...nodeRoles, roleId]);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-w-[200px]">
      {/* Handles */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, left: '50%' }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ ...handleStyle, top: '50%' }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ ...handleStyle, top: '50%' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, left: '50%' }}
      />

      {/* Node Content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{data.name}</div>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="h-3 w-3 text-gray-500" />
          </button>
        </div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>{data.actions?.length || 0} actions</span>
          <span>•</span>
          <span>{data.roles?.length || 0} roles</span>
        </div>
      </div>

      {/* Edit Popup */}
      <Popup
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setNodeName(data.name);
          setNodeActions(data.actions || []);
          setNodeRoles(data.roles || []);
        }}
        title="Edit Node"
        size="modal-md"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsEditing(false);
                setNodeName(data.name);
                setNodeActions(data.actions || []);
                setNodeRoles(data.roles || []);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              onClick={handleEdit}
              disabled={!nodeName.trim()}
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Name
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter node name"
            />
          </div>

          {/* Actions Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter action"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAction();
                    }
                  }}
                />
                <button
                  onClick={handleAddAction}
                  disabled={!newAction.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {nodeActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{action}</span>
                    <button
                      onClick={() => handleRemoveAction(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roles Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={nodeRoles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popup>
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
  data: { actions: [] } as EdgeData,
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
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newNode, setNewNode] = useState<WorkflowNode>({ name: '' });
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edgeActions, setEdgeActions] = useState<string[]>([]);
  const [newAction, setNewAction] = useState('');
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
        data: {
          actions: edge.data?.actions || []
        }
      })) as Edge<EdgeData>[];

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
          const newEdge: Edge<EdgeData> = {
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
    const typedEdge = edge as Edge<EdgeData>;
    setSelectedEdge(typedEdge);
    setEdgeActions(typedEdge.data?.actions || []);
    setIsEditing(true);
  };

  const handleAddEdgeAction = () => {
    if (newAction.trim()) {
      const updatedActions = [...edgeActions, newAction.trim()];
      setEdgeActions(updatedActions);
      setNewAction('');
      
      // Update the edge data
      if (selectedEdge) {
        setEdges(eds => 
          eds.map(e => 
            e.id === selectedEdge.id 
              ? { ...e, data: { ...e.data, actions: updatedActions } }
              : e
          ) as Edge<EdgeData>[]
        );
      }
    }
  };

  const handleRemoveEdgeAction = (index: number) => {
    const updatedActions = edgeActions.filter((_, i) => i !== index);
    setEdgeActions(updatedActions);
    
    // Update the edge data
    if (selectedEdge) {
      setEdges(eds => 
        eds.map(e => 
          e.id === selectedEdge.id 
            ? { ...e, data: { ...e.data, actions: updatedActions } }
            : e
        ) as Edge<EdgeData>[]
      );
    }
  };

  const handleSaveEdge = () => {
    setIsEditing(false);
    setSelectedEdge(null);
    setNewAction('');
  };

  const onEdgeDelete = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      setIsEditing(false);
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
        data: { ...newNode, type: 'task', actions: [], roles: [] },
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
          edges: edges.map(({ id, source, target, sourceHandle, targetHandle, data }) => ({
            id,
            source,
            target,
            sourceHandle,
            targetHandle,
            data: {
              actions: data?.actions || []
            }
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
          onPaneClick={() => {
            setSelectedEdge(null);
            setIsEditing(false);
          }}
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

      {/* Edge Actions Modal */}
      <Popup
        isOpen={isEditing && !!selectedEdge}
        onClose={() => {
          setIsEditing(false);
          setSelectedEdge(null);
          setNewAction('');
        }}
        title="Edit Edge Actions"
        size="modal-md"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsEditing(false);
                setSelectedEdge(null);
                setNewAction('');
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
              onClick={onEdgeDelete}
            >
              Delete Edge
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              onClick={handleSaveEdge}
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edge Actions
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter action"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEdgeAction();
                    }
                  }}
                />
                <button
                  onClick={handleAddEdgeAction}
                  disabled={!newAction.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {edgeActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{action}</span>
                    <button
                      onClick={() => handleRemoveEdgeAction(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default WorkflowDesigner; 