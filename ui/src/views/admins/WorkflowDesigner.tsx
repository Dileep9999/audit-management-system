import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, ArrowLeft, Save, Edit2, X } from 'lucide-react';
import Popup from '../../components/shared/Popup';
import { workflowService, Workflow, CreateWorkflowPayload, WorkflowStatus } from '../../utils/workflow_service';
import { fetchRoles } from '../../utils/roles_api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

// Form field styling classes
const formFieldClasses = {
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
  input: "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out",
  select: "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out appearance-none",
  colorInput: "w-full h-12 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition duration-150 ease-in-out",
  checkbox: "h-5 w-5 text-primary-600 dark:text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 transition duration-150 ease-in-out",
  checkboxLabel: "ml-3 block text-sm text-gray-700 dark:text-gray-300",
  actionInput: "flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out",
  actionButton: "px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out",
  actionItem: "flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2.5 rounded-lg",
  actionText: "text-sm text-gray-700 dark:text-gray-300",
  deleteButton: "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition duration-150 ease-in-out",
  rolesContainer: "space-y-2 max-h-48 overflow-y-auto border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800",
  actionsContainer: "space-y-3 bg-white dark:bg-gray-800 rounded-lg",
};

interface WorkflowNode {
  name: string;
  label: string;
  color: string;
  roles: number[];
  type: 'task';
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
  width: '12px',
  height: '12px',
  backgroundColor: '#fff',
  border: '2px solid',
  borderRadius: '50%'
};

const hexToRgba = (hex: string, alpha: number = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ApiErrorResponse {
  [key: string]: string[];
}

interface WorkflowFormData {
  name: string;
  description: string;
  status: WorkflowStatus;
}

// Custom edge styles
const edgeOptions = {
  type: 'custom',
  animated: true,
  style: { strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  data: { actions: [] } as EdgeData,
};

type TaskNodeProps = NodeProps<WorkflowNodeData> & {
  setSelectedNode: (id: string | null) => void;
};

const TaskNode = ({ data, id, setSelectedNode }: TaskNodeProps) => {
  return (
    <div 
      className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-w-[200px]" 
      style={{ 
        borderColor: data.color,
        backgroundColor: hexToRgba(data.color, 0.1),
        borderWidth: '2px'
      }}
    >
      {/* Handles */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, borderColor: data.color, top: '-6px', left: '50%' }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ ...handleStyle, borderColor: data.color, left: '-6px', top: '50%' }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ ...handleStyle, borderColor: data.color, right: '-6px', top: '50%' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, borderColor: data.color, bottom: '-6px', left: '50%' }}
      />

      {/* Node Content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</div>
            {data.label && (
              <div className="text-xs text-gray-700 dark:text-gray-300">{data.label}</div>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(id)}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="h-3 w-3 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
          <span>{data.roles?.length || 0} roles</span>
        </div>
      </div>
    </div>
  );
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<EdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const actions = data?.actions || [];
  const hasActions = actions.length > 0;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {hasActions && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              padding: '6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 500,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col gap-1">
              {actions.map((action, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  nodeData: WorkflowNode;
  onSave: (node: WorkflowNode) => void;
  roles: Role[];
}

const defaultNodeData: WorkflowNode = {
  name: '',
  label: '',
  color: '#64748b',
  roles: [],
  type: 'task'
};

const NodeModal = ({ isOpen, onClose, mode, nodeData, onSave, roles }: NodeModalProps) => {
  const [formData, setFormData] = useState<WorkflowNode>(nodeData);

  useEffect(() => {
    setFormData(nodeData);
  }, [nodeData]);

  const handleChange = (field: keyof WorkflowNode, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setFormData(nodeData);
      }}
      title={mode === 'add' ? 'Add Node' : 'Edit Node'}
      size="modal-sm"
      position="modal-center"
      contentClass="space-y-4"
      footer={
        <>
          <button
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 ease-in-out"
            onClick={() => {
              onClose();
              setFormData(nodeData);
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition duration-150 ease-in-out"
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
          >
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={formFieldClasses.label}>
            Node Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={formFieldClasses.input}
            placeholder="Enter node name"
            autoFocus
          />
        </div>
        <div>
          <label className={formFieldClasses.label}>
            Label
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className={formFieldClasses.input}
            placeholder="Enter display label"
          />
        </div>
        <div>
          <label className={formFieldClasses.label}>
            Color
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className={formFieldClasses.colorInput}
          />
        </div>
        <div>
          <label className={formFieldClasses.label}>
            Roles
          </label>
          <div className={formFieldClasses.rolesContainer}>
            {roles.map((role) => (
              <div key={role.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`node-role-${role.id}`}
                  checked={formData.roles?.includes(role.id)}
                  onChange={(e) => {
                    const updatedRoles = e.target.checked
                      ? [...(formData.roles || []), role.id]
                      : (formData.roles || []).filter(id => id !== role.id);
                    handleChange('roles', updatedRoles);
                  }}
                  className={formFieldClasses.checkbox}
                />
                <label
                  htmlFor={`node-role-${role.id}`}
                  className={formFieldClasses.checkboxLabel}
                >
                  {role.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Popup>
  );
};

const WorkflowDesigner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newNode, setNewNode] = useState<WorkflowNode>({
    name: '',
    label: '',
    color: '#64748b',
    roles: [],
    type: 'task'
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<WorkflowNode>({
    name: '',
    label: '',
    color: '#64748b',
    roles: [],
    type: 'task'
  });
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edgeActions, setEdgeActions] = useState<string[]>([]);
  const [newAction, setNewAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    status: 'draft'
  });
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeModalMode, setNodeModalMode] = useState<'add' | 'edit'>('add');
  const [currentNodeData, setCurrentNodeData] = useState<WorkflowNode>(defaultNodeData);

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  // Fetch roles when component mounts
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetchRoles();
        setRoles(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles');
      }
    };
    loadRoles();
  }, []);

  // Effect to handle selected node
  useEffect(() => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        setCurrentNodeData({
          name: node.data.name,
          label: node.data.label || '',
          color: node.data.color || '#64748b',
          roles: node.data.roles || [],
          type: node.data.type
        });
        setNodeModalMode('edit');
        setShowNodeModal(true);
      }
    }
  }, [selectedNode, nodes]);

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
        type: 'custom',
        style: { 
          ...edgeOptions.style,
          stroke: processedNodes.find(n => n.id === edge.source)?.data?.color || '#64748b'
        },
        markerEnd: {
          ...edgeOptions.markerEnd,
          color: processedNodes.find(n => n.id === edge.source)?.data?.color || '#64748b'
        },
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
          // Get the source node's color
          const sourceNode = nodes.find(n => n.id === connection.source);
          const edgeColor = sourceNode?.data?.color || '#64748b';

          const newEdge: Edge<EdgeData> = {
            ...connection,
            source: connection.source,
            target: connection.target,
            id: `edge-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
            type: 'custom',
            style: { 
              ...edgeOptions.style,
              stroke: edgeColor
            },
            markerEnd: {
              ...edgeOptions.markerEnd,
              color: edgeColor
            },
            data: { actions: [] }
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
      }
    },
    [edges, setEdges, nodes]
  );

  const onEdgeClick: EdgeMouseHandler = (event, edge) => {
    event.stopPropagation();
    const typedEdge = edge as Edge<EdgeData>;
    setSelectedEdge(typedEdge);
    setEdgeActions(typedEdge.data?.actions || []);
    setNewAction(''); // Explicitly reset newAction when opening the edge editor
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

  const handleSaveNode = (nodeData: WorkflowNode) => {
    if (nodeModalMode === 'add') {
      const newNodeId = `node-${nodes.length + 1}`;
      const position = { x: Math.random() * 500, y: Math.random() * 500 };
      const newNodeObject: Node<WorkflowNodeData> = {
        id: newNodeId,
        type: 'task',
        position,
        data: nodeData
      };
      setNodes(nds => [...nds, newNodeObject]);
    } else {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === selectedNode) {
            return {
              ...node,
              data: nodeData
            };
          }
          return node;
        })
      );
      setSelectedNode(null);
    }
  };

  const handleSave = async () => {
    const errors = validateWorkflow();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsSaving(true);
      const workflowData: CreateWorkflowPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        data: {
          nodes: nodes.map(({ id, type, position, data }) => ({
            id,
            type,
            position,
            data: {
              type: data.type,
              name: data.name,
              label: data.label,
              color: data.color,
              roles: data.roles || []
            }
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

    // Check for nodes without colors
    const uncoloredNodes = nodes.filter(node => !node.data?.color);
    if (uncoloredNodes.length > 0) {
      errors.push(`${uncoloredNodes.length} node(s) are missing colors`);
    }

    // Check for disconnected nodes if there's more than one node
    if (nodes.length > 1) {
      const connectedNodes = new Set<string>();
      edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });

      const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
      if (disconnectedNodes.length > 0) {
        errors.push(`${disconnectedNodes.length} node(s) are not connected to any other nodes`);
      }
    }

    return errors;
  };

  const nodeTypes = useMemo(() => ({
    task: (props: NodeProps<WorkflowNodeData>) => (
      <TaskNode {...props} setSelectedNode={setSelectedNode} />
    ),
  }), [setSelectedNode]);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {workflow ? `Edit Workflow: ${workflow.name}` : 'Create New Workflow'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNodeModalMode('add');
              setCurrentNodeData(defaultNodeData);
              setShowNodeModal(true);
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
          >
            Add Node
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
          edgeTypes={edgeTypes}
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

      {/* Node Modal */}
      <NodeModal
        isOpen={showNodeModal}
        onClose={() => {
          setShowNodeModal(false);
          setSelectedNode(null);
          setCurrentNodeData(defaultNodeData);
        }}
        mode={nodeModalMode}
        nodeData={currentNodeData}
        onSave={handleSaveNode}
        roles={roles}
      />

      {/* Save Modal */}
      <Popup
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Workflow"
        size="modal-md"
        position="modal-center"
        contentClass="space-y-6"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 ease-in-out"
              onClick={() => setShowSaveModal(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition duration-150 ease-in-out"
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className={formFieldClasses.label}>
              Workflow Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={formFieldClasses.input}
              placeholder="Enter workflow name"
              autoFocus
            />
          </div>
          <div>
            <label className={formFieldClasses.label}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`${formFieldClasses.input} min-h-[100px] resize-y`}
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>
          <div>
            <label className={formFieldClasses.label}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as WorkflowStatus }))}
              className={formFieldClasses.select}
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
        contentClass="space-y-6"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 ease-in-out"
              onClick={() => {
                setIsEditing(false);
                setSelectedEdge(null);
                setNewAction('');
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mr-2 transition duration-150 ease-in-out"
              onClick={onEdgeDelete}
            >
              Delete Edge
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
              onClick={handleSaveEdge}
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className={formFieldClasses.label}>
              Edge Actions
            </label>
            <div className={formFieldClasses.actionsContainer}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className={formFieldClasses.actionInput}
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
                  className={formFieldClasses.actionButton}
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {edgeActions.map((action, index) => (
                  <div key={index} className={formFieldClasses.actionItem}>
                    <span className={formFieldClasses.actionText}>{action}</span>
                    <button
                      onClick={() => handleRemoveEdgeAction(index)}
                      className={formFieldClasses.deleteButton}
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