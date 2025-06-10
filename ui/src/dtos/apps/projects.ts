// Projects List
export interface Assignee {
  image: string;
  name: string;
}

// Projects List
export interface ProjectList {
  _id: any;
  projectImage: string;
  image: string;
  projectName: string;
  clientName: string;
  dueDate: string;
  totalAmount: string;
  assignees: Assignee[];
  progress: string;
  status: string;
}
