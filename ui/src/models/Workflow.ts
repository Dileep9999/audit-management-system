export interface Workflow {
  id: number;
  name: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string; // MM-DD-YYYY HH:mm
  updatedAt: string; // MM-DD-YYYY HH:mm
  assignedTo: string;
  dueDate?: string;
  labels: string[];
} 