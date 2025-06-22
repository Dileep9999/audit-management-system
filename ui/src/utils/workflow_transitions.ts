import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, EdgeData } from '../models/Workflow';

export interface WorkflowData {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge<EdgeData>[];
}

export interface WorkflowTransitions {
  [stateName: string]: { to: string; actions: string[]; roles: string[] }[];
}

export interface WorkflowWithTransitions extends WorkflowData {
  transitions: WorkflowTransitions;
}

/**
 * Maps node IDs to their corresponding state names (node.data.name)
 */
export function createNodeIdToNameMap(nodes: Node<WorkflowNodeData>[]): Map<string, string> {
  const idToNameMap = new Map<string, string>();
  
  if (!nodes) {
    console.warn('Nodes array is null or undefined');
    return idToNameMap;
  }
  
  nodes.forEach(node => {
    if (!node.data?.name) {
      console.warn(`Node ${node.id} is missing required name property`);
      return;
    }
    idToNameMap.set(node.id, node.data.name);
  });
  
  return idToNameMap;
}

/**
 * Converts workflow data to a transitions object using node names
 */
export function convertWorkflowToTransitions(workflowData: WorkflowData): WorkflowTransitions {
  try {
    if (!workflowData) {
      console.warn('Workflow data is null or undefined');
      return {};
    }

    const { nodes, edges } = workflowData;
    const transitions: WorkflowTransitions = {};
    const idToNameMap = createNodeIdToNameMap(nodes);

    // Initialize all states with empty arrays
    nodes.forEach(node => {
      if (!node.data?.name) {
        console.warn(`Node ${node.id} is missing required name property`);
        return;
      }
      transitions[node.data.name] = [];
    });

    // Add transitions based on edges
    edges.forEach(edge => {
      const sourceName = idToNameMap.get(edge.source);
      const targetName = idToNameMap.get(edge.target);

      if (!sourceName || !targetName) {
        console.warn(`Invalid edge: source or target node not found (${edge.source} -> ${edge.target})`);
        return;
      }

      // Add transition with actions
      transitions[sourceName].push({
        to: targetName,
        actions: edge.data?.actions || [],
        roles: [] // Default to empty roles array if not specified
      });
    });

    return transitions;
  } catch (error) {
    console.error('Error converting workflow to transitions:', error);
    return {};
  }
}

/**
 * Gets possible next states from a given state name
 */
export function getNextStates(currentNodeName: string, workflow: WorkflowData | WorkflowTransitions | null): string[] {
  try {
    if (!workflow) {
      console.warn('Workflow is null or undefined');
      return [];
    }

    if (!currentNodeName) {
      console.warn('Current node name is null or undefined');
      return [];
    }

    // If workflow is already a transitions object, use it directly
    if (!('nodes' in workflow)) {
      const transitions = workflow[currentNodeName] || [];
      return transitions.map(t => t.to);
    }

    // Convert workflow data to transitions if needed
    const transitions = convertWorkflowToTransitions(workflow as WorkflowData);
    return (transitions[currentNodeName] || []).map(t => t.to);
  } catch (error) {
    console.error('Error getting next states:', error);
    return [];
  }
}

/**
 * Formats workflow data for database storage by adding transitions
 */
export function saveWorkflowWithTransitions(workflowData: WorkflowData | null): WorkflowWithTransitions | null {
  try {
    if (!workflowData) {
      console.warn('Workflow data is null or undefined');
      return null;
    }

    const transitions = convertWorkflowToTransitions(workflowData);
    
    // Create the complete workflow object
    return {
      nodes: workflowData.nodes,
      edges: workflowData.edges,
      transitions
    };
  } catch (error) {
    console.error('Error preparing workflow for database:', error);
    return null;
  }
}

/**
 * Validates a workflow data structure
 */
export function validateWorkflowData(workflowData: WorkflowData | null): boolean {
  try {
    if (!workflowData) {
      console.warn('Workflow data is null or undefined');
      return false;
    }

    // Validate nodes
    if (!Array.isArray(workflowData.nodes)) {
      console.warn('Workflow nodes must be an array');
      return false;
    }

    // Check each node
    for (const node of workflowData.nodes) {
      if (!node.id) {
        console.warn('Each node must have an id');
        return false;
      }
      if (!node.data?.name) {
        console.warn(`Node ${node.id} is missing required name property`);
        return false;
      }
    }

    // Validate edges
    if (!Array.isArray(workflowData.edges)) {
      console.warn('Workflow edges must be an array');
      return false;
    }

    // Check each edge
    for (const edge of workflowData.edges) {
      if (!edge.source || !edge.target) {
        console.warn('Each edge must have source and target properties');
        return false;
      }
    }

    // Validate node references in edges
    const nodeIds = new Set(workflowData.nodes.map(node => node.id));
    for (const edge of workflowData.edges) {
      if (!nodeIds.has(edge.source)) {
        console.warn(`Edge references non-existent source node: ${edge.source}`);
        return false;
      }
      if (!nodeIds.has(edge.target)) {
        console.warn(`Edge references non-existent target node: ${edge.target}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating workflow data:', error);
    return false;
  }
}

/**
 * Gets all available states in the workflow
 */
export function getAllStates(workflow: WorkflowData | WorkflowTransitions | null): string[] {
  try {
    if (!workflow) {
      console.warn('Workflow is null or undefined');
      return [];
    }

    if ('nodes' in workflow) {
      return workflow.nodes
        .filter((node): node is Node<WorkflowNodeData> => node instanceof Object)
        .map(node => node.data?.name || '')
        .filter(Boolean);
    }
    return Object.keys(workflow);
  } catch (error) {
    console.error('Error getting all states:', error);
    return [];
  }
}

/**
 * Checks if a transition between two states is valid
 */
export function isValidTransition(fromState: string, toState: string, workflow: WorkflowData | WorkflowTransitions | null): boolean {
  try {
    if (!workflow || !fromState || !toState) {
      console.warn('Invalid arguments for transition check');
      return false;
    }

    const nextStates = getNextStates(fromState, workflow);
    return nextStates.includes(toState);
  } catch (error) {
    console.error('Error checking transition validity:', error);
    return false;
  }
} 