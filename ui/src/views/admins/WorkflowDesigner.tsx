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
  XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, ArrowLeft, Save, Edit2, X } from 'lucide-react';
import Popup from '../../components/shared/Popup';
import { workflowService, Workflow, WorkflowStatus } from '../../utils/workflow_service';
import { fetchRoles } from '../../utils/roles_api';
import { toast } from 'react-toastify';
import { ApiError } from '../../utils/api_error';
import { WorkflowNodeData, EdgeData } from '../../models/Workflow';
import { validateWorkflowData, WorkflowData, saveWorkflowWithTransitions, getNextStates, isValidTransition } from '../../utils/workflow_transitions';
import useTranslation from '../../hooks/useTranslation';

// Custom handle styles
const handleStyle = {
  width: '12px',
  height: '12px',
  backgroundColor: '#fff',
  border: '2px solid',
  borderRadius: '50%'
};

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

interface Role {
  id: number;
  name: string;
  description: string;
  severity: string;
  hierarchy_position: number;
  status: 'Active' | 'Inactive';
}

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
  const { t } = useTranslation();
  
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
            className="ms-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={t('workflows.actions.edit_node', 'Edit Node')}
          >
            <Edit2 className="h-3 w-3 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
          <span>{data.roles?.length || 0} {t('roles.title', 'roles')}</span>
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

interface WorkflowTransition {
  to: string;
  actions: string[];
  roles: number[];
}

interface WorkflowTransitions {
  [fromState: string]: WorkflowTransition[];
}

interface WorkflowState {
  name: string;
  label?: string;
  color: string;
  roles: number[];
}

interface WorkflowDefinition {
  states: { [key: string]: WorkflowState };
  transitions: WorkflowTransitions;
  initialState?: string;
}

const hexToRgba = (hex: string, alpha: number = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const defaultNodeData: Required<WorkflowNodeData> = {
  name: '',
  label: '',
  color: '#64748b',
  roles: [],
  type: 'task'
};

const WorkflowDesigner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useTranslation();
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newNode, setNewNode] = useState<Required<WorkflowNodeData>>(defaultNodeData);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Required<WorkflowNodeData>>(defaultNodeData);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edgeActions, setEdgeActions] = useState<string[]>([]);
  const [newAction, setNewAction] = useState<string>('');
  const [nodeActions, setNodeActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    status: 'draft'
  });
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [addNodeErrors, setAddNodeErrors] = useState<Record<string, string[]>>({});
  const [editNodeErrors, setEditNodeErrors] = useState<Record<string, string[]>>({});

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
        setSelectedNodeData({
          name: node.data.name,
          label: node.data.label || '',
          color: node.data.color || '#64748b',
          roles: node.data.roles || [],
          type: node.type || 'task'
        });
      }
    }
  }, [selectedNode, nodes]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      setIsLoading(true);
      const data = await workflowService.getWorkflow(workflowId);
      setWorkflow(data);
      setFormData({
        name: data.name,
        description: data.description,
        status: data.status
      });

      // Process nodes to ensure all required fields are present
      const processedNodes = data.data.nodes.map(node => ({
        ...node,
        type: node.type || 'task',
        data: {
          ...node.data,
          type: node.type || 'task',
          label: node.data.label || '',
          color: node.data.color || '#64748b',
          roles: node.data.roles || []
        }
      }));

      // Process edges to ensure all required fields are present
      const processedEdges = data.data.edges.map(edge => ({
        ...edge,
        type: 'custom',
        data: {
          actions: edge.data?.actions || []
        },
        style: { 
          ...edgeOptions.style,
          stroke: processedNodes.find(n => n.id === edge.source)?.data?.color || '#64748b'
        },
        markerEnd: {
          ...edgeOptions.markerEnd,
          color: processedNodes.find(n => n.id === edge.source)?.data?.color || '#64748b'
        }
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
    } catch (error: unknown) {
      console.error('Error loading workflow:', error);
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to load workflow');
      } else {
        toast.error('Failed to load workflow');
      }
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
            data: {
              actions: []
            }
          };

          // Add the edge
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
    setNewAction('');
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

  const validateNodeData = (node: Required<WorkflowNodeData>): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    // Validate name
    if (!node.name.trim()) {
      errors.name = ['Node name is required'];
    } else if (nodes.some(n => n.data.name.trim().toLowerCase() === node.name.trim().toLowerCase())) {
      errors.name = ['A node with this name already exists'];
    }

    // Validate roles
    if (!node.roles?.length) {
      errors.roles = ['At least one role is required'];
    }

    return errors;
  };

  const handleAddNode = () => {
    // Validate node data
    const validationErrors = validateNodeData(newNode);
    setAddNodeErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const newNodeId = `node-${nodes.length + 1}`;
    const newNodeData: Node<WorkflowNodeData> = {
      id: newNodeId,
      type: 'task',
      position: { x: 100, y: 100 },
      data: {
        type: 'task',
        name: newNode.name.trim(),
        label: newNode.label.trim(),
        color: newNode.color,
        roles: newNode.roles
      }
    };

    setNodes([...nodes, newNodeData]);
    setShowAddModal(false);
    setNewNode(defaultNodeData);
    setAddNodeErrors({});
    toast.success('Node added successfully');
  };

  const handleSelectedNodeDataChange = (field: keyof WorkflowNodeData, value: string | number[]) => {
    setSelectedNodeData(prev => ({
      ...prev,
      [field]: value,
      label: field === 'label' ? (value as string) || '' : (prev.label || '')
    }));
  };

  const handleEditNode = () => {
    // Validate node data
    const validationErrors = validateNodeData({
      ...selectedNodeData,
      type: 'task' // Add required field for validation
    });
    
    // Remove duplicate name error if it's the same node
    if (validationErrors.name?.includes('A node with this name already exists')) {
      const currentNode = nodes.find(n => n.id === selectedNode);
      if (currentNode && currentNode.data.name.trim().toLowerCase() === selectedNodeData.name.trim().toLowerCase()) {
        delete validationErrors.name;
      }
    }

    setEditNodeErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (selectedNode) {
      setNodes(nds => 
        nds.map(node => {
          if (node.id === selectedNode) {
            return {
              ...node,
              data: {
                ...node.data,
                name: selectedNodeData.name.trim(),
                label: selectedNodeData.label.trim(),
                color: selectedNodeData.color,
                roles: selectedNodeData.roles
              }
            };
          }
          return node;
        })
      );
      setSelectedNode(null);
      setEditNodeErrors({});
      toast.success('Node updated successfully');
    }
  };

  const convertToWorkflowDefinition = (): WorkflowDefinition => {
    const states: { [key: string]: WorkflowState } = {};
    const transitions: WorkflowTransitions = {};
    let initialState: string | undefined;

    // Convert nodes to states
    nodes.forEach((node) => {
      // Use the first node as initial state if not set
      if (!initialState) {
        initialState = node.id;
      }

      states[node.id] = {
        name: node.data.name,
        label: node.data.label,
        color: node.data.color,
        roles: node.data.roles || []
      };
    });

    // Convert edges to transitions
    edges.forEach((edge) => {
      const fromState = edge.source;
      const toState = edge.target;
      
      if (!transitions[fromState]) {
        transitions[fromState] = [];
      }

      transitions[fromState].push({
        to: toState,
        actions: edge.data?.actions || [],
        roles: states[fromState].roles // Inherit roles from source state
      });
    });

    return {
      states,
      transitions,
      initialState
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate form data
      const validationErrors: Record<string, string[]> = {};
console.log("Dsdfdsvd");
      
      if (!formData.name.trim()) {
        validationErrors.name = ['Workflow name is required'];
      }

      if (!nodes.length) {
        validationErrors.nodes = ['At least one node is required'];
      }

      nodes.forEach((node, index) => {
        if (!node.data?.name?.trim()) {
          validationErrors[`node_${index}`] = [`Node ${index + 1} name is required`];
        }
        if (!node.data?.roles?.length) {
          validationErrors[`node_${index}_roles`] = [`Node ${index + 1} must have at least one role`];
        }
      });
console.log("Dsdfdsvd",validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });
        setIsSaving(false);
        return;
      }
console.log("Dsdfdsvd");

      // Prepare workflow data
      const workflowData: WorkflowData = {
        nodes: nodes.map(node => ({
          ...node,
          type: node.type || 'task',
          data: {
            ...node.data,
            type: node.type || 'task',
            label: node.data.label || '',
            color: node.data.color || '#64748b',
            roles: node.data.roles || []
          }
        })),
        edges: edges.map(edge => ({
          ...edge,
          type: 'custom',
          data: {
            actions: edge.data?.actions || []
          }
        }))
      };

      // Validate the workflow data structure
      if (!validateWorkflowData(workflowData)) {
        toast.error('Invalid workflow structure. Please check nodes and connections.');
        setIsSaving(false);
        return;
      }

      // Process workflow data and transitions
      const workflowDataWithTransitions = saveWorkflowWithTransitions(workflowData);
console.log("workflowDataWithTransitions ",workflowDataWithTransitions);

      if (!workflowDataWithTransitions) {
        toast.error('Failed to process workflow transitions');
        setIsSaving(false);
        return;
      }

      // Create the payload with proper transitions
      const payload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        data: {
          nodes: workflowData.nodes,
          edges: workflowData.edges,
          transitions: workflowDataWithTransitions.transitions
        }
      };
console.log("fdsv ",payload);

      if (workflow?.id) {
        await workflowService.updateWorkflow(workflow.id, payload);
        toast.success('Workflow updated successfully');
      } else {
        await workflowService.createWorkflow(payload);
        toast.success('Workflow created successfully');
      }

      navigate('/admins/workflows');
    } catch (error: unknown) {
      console.error('Error saving workflow:', error);
      if (error instanceof ApiError) {
        const apiError = error as ApiError;
        if (apiError.data) {
          Object.entries(apiError.data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              toast.error(`${field}: ${messages.join(', ')}`);
            }
          });
        } else {
          toast.error('Failed to save workflow');
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save workflow');
      }
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
    }
  };

  const nodeTypes = useMemo(() => ({
    task: (props: NodeProps<WorkflowNodeData>) => (
      <TaskNode {...props} setSelectedNode={setSelectedNode} />
    ),
  }), [setSelectedNode]);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const handleAddAction = () => {
    if (newAction.trim()) {
      setEdgeActions([...edgeActions, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setEdgeActions(edgeActions.filter((_, i) => i !== index));
  };

  // Clear errors when closing modals
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewNode(defaultNodeData);
    setAddNodeErrors({});
  };

  const handleCloseEditModal = () => {
    setSelectedNode(null);
    setSelectedNodeData(defaultNodeData);
    setEditNodeErrors({});
  };

  return (
    <div className="h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admins/workflows')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title={t('workflows.actions.back', 'Back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{t('workflows.designer.title', 'Workflow Designer')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus className="h-4 w-4" />
            <span>{t('workflows.actions.add_node', 'Add Node')}</span>
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            <Save className="h-4 w-4" />
            <span>{t('workflows.actions.save', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Flow Container */}
      <div className="flex-1 h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          onEdgeClick={onEdgeClick}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Add Node Modal */}
      <Popup
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title={t('workflows.designer.node_form.title', 'Node Details')}
        size="modal-md"
        position="modal-center"
      >
        <div className="space-y-4">
          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.name.label', 'Name')}
            </label>
            <input
              type="text"
              value={newNode.name}
              onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              placeholder={t('workflows.designer.node_form.name.placeholder', 'Enter node name')}
              className={formFieldClasses.input}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.label.label', 'Label')}
            </label>
            <input
              type="text"
              value={newNode.label}
              onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
              placeholder={t('workflows.designer.node_form.label.placeholder', 'Enter node label')}
              className={formFieldClasses.input}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.color.label', 'Color')}
            </label>
            <input
              type="color"
              value={newNode.color}
              onChange={(e) => setNewNode({ ...newNode, color: e.target.value })}
              className={formFieldClasses.colorInput}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.roles.label', 'Roles')}
            </label>
            <div className={formFieldClasses.rolesContainer}>
              {roles.map((role) => (
                <div key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={(newNode.roles || []).includes(role.id)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...(newNode.roles || []), role.id]
                        : (newNode.roles || []).filter(id => id !== role.id);
                      setNewNode({ ...newNode, roles: newRoles });
                    }}
                    className={formFieldClasses.checkbox}
                  />
                  <label htmlFor={`role-${role.id}`} className={formFieldClasses.checkboxLabel}>
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCloseAddModal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('workflows.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleAddNode}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              {t('workflows.actions.add_node', 'Add Node')}
            </button>
          </div>
        </div>
      </Popup>

      {/* Edit Node Modal */}
      <Popup
        isOpen={!!selectedNode}
        onClose={handleCloseEditModal}
        title={t('workflows.designer.node_form.title', 'Node Details')}
        size="modal-md"
        position="modal-center"
      >
        <div className="space-y-4">
          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.name.label', 'Name')}
            </label>
            <input
              type="text"
              value={selectedNodeData.name}
              onChange={(e) => handleSelectedNodeDataChange('name', e.target.value)}
              placeholder={t('workflows.designer.node_form.name.placeholder', 'Enter node name')}
              className={formFieldClasses.input}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.label.label', 'Label')}
            </label>
            <input
              type="text"
              value={selectedNodeData.label}
              onChange={(e) => handleSelectedNodeDataChange('label', e.target.value)}
              placeholder={t('workflows.designer.node_form.label.placeholder', 'Enter node label')}
              className={formFieldClasses.input}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.color.label', 'Color')}
            </label>
            <input
              type="color"
              value={selectedNodeData.color}
              onChange={(e) => handleSelectedNodeDataChange('color', e.target.value)}
              className={formFieldClasses.colorInput}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.designer.node_form.roles.label', 'Roles')}
            </label>
            <div className={formFieldClasses.rolesContainer}>
              {roles.map((role) => (
                <div key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={(selectedNodeData.roles || []).includes(role.id)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...(selectedNodeData.roles || []), role.id]
                        : (selectedNodeData.roles || []).filter(id => id !== role.id);
                      handleSelectedNodeDataChange('roles', newRoles);
                    }}
                    className={formFieldClasses.checkbox}
                  />
                  <label htmlFor={`role-${role.id}`} className={formFieldClasses.checkboxLabel}>
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCloseEditModal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('workflows.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleEditNode}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              {t('workflows.actions.save', 'Save')}
            </button>
          </div>
        </div>
      </Popup>

      {/* Edge Actions Modal */}
      <Popup
        isOpen={!!selectedEdge}
        onClose={() => {
          setSelectedEdge(null);
          setEdgeActions([]);
          setNewAction('');
        }}
        title={t('workflows.designer.edge_form.title', 'Transition Details')}
        size="modal-md"
        position="modal-center"
      >
        <div className="space-y-4">
          <div className={formFieldClasses.actionsContainer}>
            {edgeActions.map((action, index) => (
              <div key={index} className={formFieldClasses.actionItem}>
                <span className={formFieldClasses.actionText}>{action}</span>
                <button
                  onClick={() => handleRemoveEdgeAction(index)}
                  className={formFieldClasses.deleteButton}
                  title={t('workflows.actions.remove_action', 'Remove Action')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder={t('workflows.designer.edge_form.action.placeholder', 'Enter action name')}
              className={formFieldClasses.actionInput}
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
              {t('workflows.actions.add_action', 'Add Action')}
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setSelectedEdge(null);
                setEdgeActions([]);
                setNewAction('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('workflows.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSaveEdge}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              {t('workflows.actions.save', 'Save')}
            </button>
          </div>
        </div>
      </Popup>

      {/* Save Workflow Modal */}
      <Popup
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={t('workflows.form.title', 'Save Workflow')}
        size="modal-md"
        position="modal-center"
      >
        <div className="space-y-4">
          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.form.name.label', 'Name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('workflows.form.name.placeholder', 'Enter workflow name')}
              className={formFieldClasses.input}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.form.description.label', 'Description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('workflows.form.description.placeholder', 'Enter workflow description')}
              className={`${formFieldClasses.input} min-h-[100px]`}
            />
          </div>

          <div>
            <label className={formFieldClasses.label}>
              {t('workflows.form.status.label', 'Status')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkflowStatus })}
              className={formFieldClasses.select}
            >
              <option value="draft">{t('workflows.status.draft', 'Draft')}</option>
              <option value="active">{t('workflows.status.active', 'Active')}</option>
              <option value="inactive">{t('workflows.status.inactive', 'Inactive')}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('workflows.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
            >
              {isSaving ? t('common.saving', 'Saving...') : t('workflows.actions.save', 'Save')}
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default WorkflowDesigner; 