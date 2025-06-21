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
import { workflowService, Workflow, CreateWorkflowPayload } from '../../utils/workflow_service';
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

const WorkflowDesigner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState<WorkflowNode>({ name: '' });
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      setIsLoading(true);
      const workflow = await workflowService.getWorkflow(workflowId);
      setWorkflowName(workflow.name);
      
      // Ensure nodes and edges have all required properties
      const processedNodes = workflow.data.nodes.map(node => ({
        ...node,
        type: node.type || 'task',  // Default to task type if not specified
        className: 'group',
      }));
      
      const processedEdges = workflow.data.edges.map(edge => ({
        ...edge,
        ...edgeOptions,  // Ensure consistent edge styling
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
      // Navigate back to list on error
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
    
    if (!workflowName.trim()) {
      errors.push('Workflow name is required');
    }

    if (nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Check for nodes without connections
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    if (nodes.length > 1) {
      const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
      if (disconnectedNodes.length > 0) {
        errors.push(`Some nodes are not connected: ${disconnectedNodes.map(n => n.data.name).join(', ')}`);
      }
    }

    return errors;
  };

  const handleSave = async () => {
    try {
      const errors = validateWorkflow();
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      setIsSaving(true);

      const workflowData: CreateWorkflowPayload = {
        name: workflowName.trim(),
        data: {
          nodes: nodes.map(({ className, ...node }) => node), // Remove UI-specific properties
          edges: edges.map(({ className, ...edge }) => edge),
        },
      };

      if (id) {
        await workflowService.updateWorkflow(parseInt(id), workflowData);
        toast.success('Workflow updated successfully');
      } else {
        await workflowService.createWorkflow(workflowData);
        toast.success('Workflow created successfully');
      }
      
      navigate('/admins/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
      if (error instanceof AxiosError && error.response?.data) {
        // Handle specific API errors
        const errorData = error.response.data as ApiErrorResponse | string;
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            messages.forEach(message => toast.error(`${field}: ${message}`));
          });
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error('Failed to save workflow. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onPaneClick = () => {
    setSelectedEdge(null);
  };

  return (
    <div className="h-screen w-full p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admins/workflows')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Workflow Designer</h1>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="px-3 py-1 border border-gray-300 rounded-md text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50"
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
                <span>Add Node</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-120px)] border border-gray-200 dark:border-gray-700 rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid
              snapGrid={[20, 20]}
              connectionMode={ConnectionMode.Strict}
              defaultEdgeOptions={edgeOptions}
            >
              <Background />
              <Controls />
              {selectedEdge && (
                <Panel position="top-center" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Selected Connection</span>
                    <button
                      onClick={onEdgeDelete}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Delete Connection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>

          <Popup
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add Node"
            size="modal-sm"
            position="modal-center"
            contentClass="space-y-4"
            footer={
              <>
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                  onClick={handleAddNode}
                  disabled={!newNode.name.trim()}
                >
                  Add
                </button>
              </>
            }
          >
            <div>
              <input
                type="text"
                value={newNode.name}
                onChange={(e) => setNewNode({ name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter node name"
                autoFocus
              />
            </div>
          </Popup>
        </>
      )}
    </div>
  );
};

export default WorkflowDesigner; 