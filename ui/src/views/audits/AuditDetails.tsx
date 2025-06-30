import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  CheckSquare, 
  User, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  UserPlus,
  Settings,
  FileText,
  BarChart3,
  Brain,
  Shield,
  ArrowLeft,
  ArrowRight,
  Users,
  Clock,
  Tag,
  Cog,
  Filter,
  MoreHorizontal,
  Bell,
  Share,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  Paperclip,
  Star,
  Send,
  Target,
  Edit2
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { 
  getAudit, 
  getWorkflows, 
  getAvailableTransitions, 
  transitionAuditStatus,
  getAuditTasks,
  createAuditTask,
  deleteAuditTask,
  updateAuditTask,
  getTaskTemplates,
  getTaskSummary,
  bulkCreateTasks,
  submitTaskForReview,
  approveTask,
  getUsers,
  changeChecklistStatus,
  assignUsersToTask,
  addUserToTask,
  removeUserFromTask,
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  assignTeamToAudit,
  unassignTeamFromAudit,
  getTeamStatistics,
  TEAM_TYPES
} from '../../utils/api_service';
import AuditTasks from './AuditTasks';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-lg ${
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    } ${className}`}
  >
    {label}
  </button>
);

// Left sidebar navigation items (GitHub style)
const sidebarNavigation = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: BookOpen,
    description: 'General audit information'
  },
  { 
    id: 'checklist', 
    label: 'Audit Items', 
    icon: FileText,
    description: 'Simple audit items'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: BarChart3,
    description: 'Audit reports and analytics'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    description: 'Teams, users and audit configuration'
  },
];

// Quill editor modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background',
  'link'
];

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  department: string;
  title: string;
  is_active: boolean;
  is_staff: boolean;
  canRead?: boolean;  // For permission tracking in UI
  canWrite?: boolean; // For permission tracking in UI
}

interface ChecklistItem {
  id: number;
  task_name: string;
  description: string;
  completed: boolean;
  assigned_to?: { id: number; name: string };
  assigned_users?: { id: number; name: string; email?: string; full_name?: string }[];
  assigned_teams?: { id: number; name: string; type: string; member_count: number }[];
  isExpanded: boolean;
  status: 'Pending' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  is_published?: boolean;
  checklist?: {
    id: number;
    name: string;
    status: string;
    completion_percentage: number;
    assigned_users?: { id: number; name: string; email?: string; full_name?: string }[];
    assigned_teams?: { id: number; name: string; type: string; member_count: number }[];
  };
  progress_percentage?: number;
}

const statusOptions = [
  { value: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  { value: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'On Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  { value: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
];

interface Workflow {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface Team {
  id: number;
  name: string;
  type: 'audit' | 'review' | 'management' | 'technical' | 'compliance';
  owner: User;
  members: User[];
  created_at: string;
  created_by: string;
}

interface AuditData {
  id: number;
  reference_number: string;
  title: string;
  audit_type: string;
  scope: string;
  objectives: string;
  status: string;
  period_from: string;
  period_to: string;
  assigned_users: number[];
  assigned_users_details?: any[];
  workflow: number;
  workflow_name?: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

// Dynamic status color assignment based on common status patterns
const getStatusStyling = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('draft') || statusLower.includes('plan')) {
    return {
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-400'
    };
  } else if (statusLower.includes('progress') || statusLower.includes('active') || statusLower.includes('ongoing')) {
    return {
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-800 dark:text-orange-400'
    };
  } else if (statusLower.includes('review') || statusLower.includes('pending')) {
    return {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      textColor: 'text-yellow-800 dark:text-yellow-400'
    };
  } else if (statusLower.includes('complete') || statusLower.includes('done') || statusLower.includes('finish')) {
    return {
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-400'
    };
  } else if (statusLower.includes('closed') || statusLower.includes('archive')) {
    return {
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      textColor: 'text-gray-800 dark:text-gray-400'
    };
  } else {
    return {
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-800 dark:text-purple-400'
    };
  }
};

const AuditDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeSideTab, setActiveSideTab] = useState('overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [editorContent, setEditorContent] = useState('');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Real data states
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [availableTransitions, setAvailableTransitions] = useState<string[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Users state - now loaded from backend
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [filteredChecklists, setFilteredChecklists] = useState<ChecklistItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [taskSummary, setTaskSummary] = useState<any>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ChecklistItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  
  // User assignment states
  const [assignModalTaskId, setAssignModalTaskId] = useState<number | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState<number | null>(null);
  
  // Team assignment states
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState<number | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'user' | 'team'>('user');
  
  // Unified assignment search states
  const [unifiedSearchTerm, setUnifiedSearchTerm] = useState('');
  const [showUnifiedDropdown, setShowUnifiedDropdown] = useState<number | null>(null);
  
  // Team creation states
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamForm, setTeamForm] = useState({
    name: '',
    type: 'audit',
    owner: '',
    members: [] as number[]
  });
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Team management states
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [isTeamLoading, setIsTeamLoading] = useState<number | null>(null);
  const [teamStatistics, setTeamStatistics] = useState<any>(null);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState<number | null>(null);

  const filteredUsers = users.filter(user => {
    const fullName = user.full_name || '';
    const department = user.department || '';
    const email = user.email || '';
    const searchLower = searchQuery.toLowerCase();
    
    return fullName.toLowerCase().includes(searchLower) ||
           department.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    if (searchParams.get('sidebar') === 'open') {
      // Handle any specific URL parameters if needed
    }
    
    // Handle tab parameter for direct navigation to specific tabs
    const tabParam = searchParams.get('tab');
    if (tabParam && sidebarNavigation.some(nav => nav.id === tabParam)) {
      setActiveSideTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isStatusDropdownOpen) {
          setIsStatusDropdownOpen(false);
        }
      }
      
      // Close user assignment dropdown when clicking outside
      if (showUserDropdown !== null && !(event.target as Element).closest('.user-assignment-dropdown')) {
        setShowUserDropdown(null);
        setUserSearchTerm('');
      }
      
      // Close team assignment dropdown when clicking outside
      if (showTeamDropdown !== null && !(event.target as Element).closest('.team-assignment-dropdown')) {
        setShowTeamDropdown(null);
        setTeamSearchTerm('');
      }
      
      // Close unified assignment dropdown when clicking outside
      if (showUnifiedDropdown !== null && !(event.target as Element).closest('.unified-assignment-dropdown')) {
        setShowUnifiedDropdown(null);
        setUnifiedSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen, showUserDropdown, showUnifiedDropdown]);

  // Load audit data and workflow info
  useEffect(() => {
    if (id) {
      loadAuditData();
      loadAuditTasks();
      loadTaskTemplates();
      loadTaskSummary();
      loadUsers();
      loadTeams();
      loadTeamStatistics();
    }
  }, [id]);

  // Update filtered list whenever checklists change
  useEffect(() => {
    applyFilters(checklists, activeFilter, searchQuery);
  }, [checklists]);

  // Load teams when users are loaded (removed sample data - now using real API only)
  useEffect(() => {
    if (users.length > 0) {
      // Teams are now loaded via loadTeams() function which calls the real API
      // No more sample data creation
    }
  }, [users]);

  const loadAuditData = async () => {
    if (!id) return;
    
    setIsLoadingData(true);
    try {
      const [auditResponse, workflowsData] = await Promise.all([
        getAudit(parseInt(id)),
        getWorkflows()
      ]);

      setAuditData(auditResponse);
      setWorkflows(workflowsData);

      // Set current workflow from audit data
      if (auditResponse.workflow) {
        const workflow = workflowsData.find((w: Workflow) => w.id === auditResponse.workflow);
        if (workflow) {
          setCurrentWorkflow(workflow);
        }
      }

      // Load available transitions
      try {
        const transitions = await getAvailableTransitions(parseInt(id));
        console.log('Loaded transitions:', transitions);
        setAvailableTransitions(Array.isArray(transitions) ? transitions : []);
      } catch (error) {
        console.error('Error loading transitions:', error);
        setAvailableTransitions([]);
      }

    } catch (error) {
      console.error('Error loading audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadAuditTasks = async () => {
    if (!id) return;
    
    try {
      const tasks = await getAuditTasks(parseInt(id));
      console.log('=== RAW API RESPONSE ===');
      console.log('Number of tasks:', tasks.length);
      console.log('Raw tasks:', JSON.stringify(tasks, null, 2));
      
      // Transform audit tasks to checklist items format
      const transformedTasks: ChecklistItem[] = tasks.map((task: any) => {
        console.log('Transforming task:', {
          id: task.id,
          task_name: task.task_name,
          task_assignment: {
            assigned_to: task.assigned_to,
            assigned_to_name: task.assigned_to_name,
            assigned_to_type: typeof task.assigned_to
          },
          checklist_assignment: {
            has_checklist: !!task.checklist,
            checklist_assigned_to: task.checklist?.assigned_to,
            checklist_assigned_to_id: task.checklist?.assigned_to?.id,
            checklist_assigned_to_name: task.checklist?.assigned_to?.full_name || task.checklist?.assigned_to?.username
          },
          task_status: task.task_status,
          checklist_status: task.checklist?.status
        });
        
        // Use checklist status if available, otherwise fall back to task status
        let status: ChecklistItem['status'] = 'Pending';
        if (task.checklist && task.checklist.status) {
          // Map backend checklist status to frontend status
          switch (task.checklist.status) {
            case 'in_progress':
              status = 'In Progress';
              break;
            case 'completed':
              status = 'Completed';
              break;
            case 'on_hold':
              status = 'On Hold';
              break;
            case 'cancelled':
              status = 'Cancelled';
              break;
            case 'draft':
            default:
              status = 'Pending';
              break;
          }
        } else {
          // Fall back to task status
          status = getStatusFromTaskStatus(task.task_status || 'pending');
        }
        
        console.log('Status mapping for task:', {
          taskId: task.id,
          checklistStatus: task.checklist?.status,
          taskStatus: task.task_status,
          finalStatus: status
        });
        
        // Determine assignment data - support both single and multiple assignments
        let assignedTo = undefined;
        let assignedUsers = [];
        
        // Priority 1: Use checklist multiple assignments (if array has users)
        if (task.checklist && task.checklist.assigned_users && task.checklist.assigned_users.length > 0) {
          assignedUsers = task.checklist.assigned_users.map((user: any) => ({
            id: user.id,
            name: user.full_name || user.username || 'Unknown User',
            email: user.email,
            full_name: user.full_name
          }));
          // Set first user as primary for backward compatibility
          assignedTo = assignedUsers[0];
        } 
        // Priority 2: Use checklist single assignment (convert to multiple format)
        else if (task.checklist && task.checklist.assigned_to) {
          assignedTo = {
            id: task.checklist.assigned_to.id,
            name: task.checklist.assigned_to.full_name || task.checklist.assigned_to.username || 'Unknown User',
            email: task.checklist.assigned_to.email,
            full_name: task.checklist.assigned_to.full_name
          };
          assignedUsers = [assignedTo];
        }
        // Priority 3: Use task multiple assignments (if array has users)
        else if (task.assigned_users_details && task.assigned_users_details.length > 0) {
          assignedUsers = task.assigned_users_details.map((user: any) => ({
            id: user.id,
            name: user.full_name || user.username || 'Unknown User',
            email: user.email,
            full_name: user.full_name
          }));
          // Set first user as primary for backward compatibility
          assignedTo = assignedUsers[0];
        }
        // Priority 4: Fall back to task single assignment (convert to multiple format)
        else if (task.assigned_to !== null && task.assigned_to !== undefined) {
          assignedTo = {
            id: task.assigned_to,
            name: task.assigned_to_name || 'Unknown User',
            email: undefined, // Task level doesn't have email
            full_name: task.assigned_to_name
          };
          assignedUsers = [assignedTo];
        }

        const transformedTask = {
          id: task.id,
          task_name: task.task_name,
          description: task.description || '',
          completed: status === 'Completed',
          assigned_to: assignedTo,
          assigned_users: assignedUsers,
          isExpanded: false,
          status: status,
          priority: task.priority || 'medium',
          due_date: task.due_date,
          is_published: task.is_published ?? (task.id % 2 === 0), // Use API field or create sample data
          checklist: task.checklist,
          progress_percentage: task.completion_percentage || 0
        };
        
        console.log(`[ASSIGNMENT DEBUG] Task ${task.id} transformation:`, {
          originalTask: {
            assigned_to: task.assigned_to,
            assigned_to_name: task.assigned_to_name,
            assigned_users_details: task.assigned_users_details,
            checklist_assigned_to: task.checklist?.assigned_to,
            checklist_assigned_users: task.checklist?.assigned_users,
            checklistHasAssignedUsers: !!(task.checklist && task.checklist.assigned_users && task.checklist.assigned_users.length > 0),
            taskHasAssignedUsersDetails: !!(task.assigned_users_details && task.assigned_users_details.length > 0)
          },
          transformedTask: {
            assigned_to: transformedTask.assigned_to,
            assigned_users: transformedTask.assigned_users,
            hasAssignments: transformedTask.assigned_users?.length > 0,
            assignedUsersNames: transformedTask.assigned_users?.map((u: any) => u.name)
          }
        });
        
        return transformedTask;
      });
      
      setChecklists(transformedTasks);
      setFilteredChecklists(transformedTasks);
    } catch (error) {
      console.error('Error loading audit tasks:', error);
      toast.error('Failed to load audit tasks');
    }
  };

  const loadTaskTemplates = async () => {
    if (!id) return;
    
    try {
      const templates = await getTaskTemplates(parseInt(id));
      setTaskTemplates(templates);
    } catch (error) {
      console.error('Error loading task templates:', error);
      toast.error('Failed to load task templates');
    }
  };

  const loadTaskSummary = async () => {
    if (!id) return;
    
    try {
      const summary = await getTaskSummary(parseInt(id));
      setTaskSummary(summary);
    } catch (error) {
      console.error('Error loading task summary:', error);
      // Don't show error toast for summary as it's not critical
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getUsers();
      
      // Process users to ensure full_name is available and set default permissions
      const processedUsers = usersData.map((user: any) => ({
        ...user,
        full_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username,
        canRead: true,  // Default read permission
        canWrite: user.is_staff || false  // Staff users get write permission by default
      }));

      setUsers(processedUsers);
      console.log('Users loaded successfully:', {
        totalUsers: processedUsers.length,
        firstFewUsers: processedUsers.slice(0, 3).map((u: User) => ({
          id: u.id,
          username: u.username,
          full_name: u.full_name,
          email: u.email
        }))
      });
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTeams = async () => {
    try {
      const teamsData = await getTeams();
      console.log('Teams loaded:', teamsData);
      
      // Convert API response to UI format
      const teamsForUI: Team[] = teamsData.map((team: any) => ({
        id: team.id,
        name: team.name,
        type: team.type,
        owner: team.owner_details || { 
          id: team.owner, 
          username: 'Unknown', 
          email: '', 
          first_name: '', 
          last_name: '', 
          full_name: 'Unknown User', 
          department: '', 
          title: '', 
          is_active: true, 
          is_staff: false 
        },
        members: team.members_details?.map((member: any) => member.user_details) || [],
        created_at: team.created_at,
        created_by: team.created_by_name || 'Unknown'
      }));
      
      setTeams(teamsForUI);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    }
  };



  const getStatusFromTaskStatus = (taskStatus: string): ChecklistItem['status'] => {
    switch (taskStatus) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'on_hold':
        return 'On Hold';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!id || !auditData) {
      toast.error('Audit data not available');
      return;
    }
    
    console.log('Attempting status transition:', {
      auditId: id,
      currentStatus: auditData.status,
      newStatus,
      availableTransitions
    });
    
    setIsTransitioning(true);
    try {
      // Check if transition is available
      if (availableTransitions.length > 0 && !availableTransitions.includes(newStatus)) {
        throw new Error(`Invalid transition. Available transitions: ${availableTransitions.join(', ')}`);
      }
      
      const response = await transitionAuditStatus(parseInt(id), newStatus);
      console.log('Transition response:', response);
      
      // Reload audit data to get updated status and transitions
      await loadAuditData();
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error transitioning status:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      let errorMessage = 'Failed to update status';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Audit not found';
      } else if (error?.response?.status === 400) {
        const detail = error?.response?.data?.detail;
        const message = error?.response?.data?.message;
        errorMessage = detail || message || 'Invalid status transition';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to change audit status';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error occurred during status transition';
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsTransitioning(false);
    }
  };



  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Saving draft:', editorContent);
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log('Publishing:', editorContent);
  };

  const handlePermissionChange = (userId: number, permission: 'read' | 'write', value: boolean) => {
    console.warn('Permission changes are not currently supported');
  };

  const handleChecklistContentChange = async (id: number, description: string) => {
    // Update local state immediately for better UX
    const updatedChecklists = checklists.map(item => 
      item.id === id ? { ...item, description } : item
    );
    setChecklists(updatedChecklists);
    applyFilters(updatedChecklists, activeFilter, searchQuery);
    
    // Debounce API call to avoid too many requests
    try {
      await updateAuditTask(id, { description });
    } catch (error) {
      console.error('Error updating task description:', error);
      toast.error('Failed to update task description');
      // Revert local state on error
      loadAuditTasks();
    }
  };

  const handleChecklistComplete = async (id: number) => {
    const item = checklists.find(item => item.id === id);
    if (!item) return;
    
    const newCompleted = !item.completed;
    const newStatus = newCompleted ? 'Completed' : 'Pending';
    
    // Update local state immediately for better UX
    const updatedChecklists = checklists.map(item =>
      item.id === id ? { 
        ...item, 
        completed: newCompleted,
        status: newStatus as ChecklistItem['status'],
        progress_percentage: newCompleted ? 100 : 0
      } : item
    );
    setChecklists(updatedChecklists);
    applyFilters(updatedChecklists, activeFilter, searchQuery);
    
    try {
      if (item.checklist) {
        // Update checklist status if checklist exists
        const backendStatus = newCompleted ? 'completed' : 'draft';
        await changeChecklistStatus(item.checklist.id, backendStatus);
      } else {
        // Update task status directly if no checklist
        const backendTaskStatus = newCompleted ? 'completed' : 'in_progress';
        await updateAuditTask(id, { 
          completion_notes: newCompleted ? 'Marked as completed from simple checklist' : ''
        });
      }
      
      // Refresh task summary after status change
      loadTaskSummary();
      
      if (newCompleted) {
        toast.success('Audit item marked as completed');
      } else {
        toast.success('Audit item marked as incomplete');
      }
    } catch (error) {
      console.error('Error updating completion status:', error);
      toast.error('Failed to update completion status');
      // Revert local state on error
      loadAuditTasks();
    }
  };

  const handleChecklistExpand = (id: number) => {
    const updatedChecklists = checklists.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    );
    setChecklists(updatedChecklists);
    // Also update filtered list to reflect expand state changes
    applyFilters(updatedChecklists, activeFilter, searchQuery);
  };

  const handleAddChecklist = async () => {
    if (!id) return;
    
    try {
      // Create a simple audit task with minimal checklist
      const taskData = {
        template_id: 1, // Use first available template as default
              task_name: 'New Audit Item',
      checklist_name: 'Simple Audit Item',
      description: 'Quick audit item for basic audit tracking',
        priority: 'medium',
        control_area: 'General',
        risk_level: 'medium'
      };
      
      const newTask = await createAuditTask(parseInt(id), taskData);
      
      // Add to local state immediately for better UX
      const newChecklistItem: ChecklistItem = {
        id: newTask.id,
        task_name: newTask.task_name,
        description: newTask.description || '',
        completed: false,
        assigned_to: newTask.assigned_to,
        isExpanded: true,
        status: 'Pending',
        priority: newTask.priority || 'medium',
        due_date: newTask.due_date,
        is_published: false, // New items start as unpublished drafts
        checklist: newTask.checklist,
        progress_percentage: 0
      };
      
      const updatedChecklists = [...checklists, newChecklistItem];
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      toast.success('New checklist item created successfully');
    } catch (error) {
      console.error('Error creating checklist item:', error);
      toast.error('Failed to create checklist item');
    }
  };

  const handleAssignUser = async (checklistId: number, userId: number) => {
    try {
      console.log(`[UI] Assigning user ${userId} to checklist ${checklistId}`);
      
      // Get current checklist item to see existing assignments
      const currentChecklist = checklists.find(item => item.id === checklistId);
      const currentUsers = currentChecklist?.assigned_users || [];
      
      // Check if user is already assigned
      if (currentUsers.some(user => user.id === userId)) {
        toast('User is already assigned to this task');
        return;
      }
      
      // Add user to the existing assignments
      await addUserToTask(checklistId, userId);
      
      toast.success('User assigned successfully');
      
      // Reload the tasks to get the latest data
      await loadAuditTasks();
      
    } catch (error: any) {
      console.error('[UI] Failed to assign user:', error);
      toast.error(error.message || 'Failed to assign user');
    }
    
    // Close any open search/assignment UI
    setUserSearchTerm('');
    setShowUserDropdown(null);
  };

  const handleRemoveUserAssignment = async (checklistId: number, userId: number) => {
    try {
      console.log(`[UI] Removing user ${userId} from checklist ${checklistId}`);
      
      await removeUserFromTask(checklistId, userId);
      
      toast.success('User removed successfully');
      
      // Reload the tasks to get the latest data
      await loadAuditTasks();
      
    } catch (error: any) {
      console.error('[UI] Failed to remove user assignment:', error);
      toast.error(error.message || 'Failed to remove user assignment');
    }
  };

  const handleBulkAssignUsersToTask = async (checklistId: number, userIds: number[]) => {
    try {
      console.log(`[UI] Bulk assigning users ${userIds} to checklist ${checklistId}`);
      
      await assignUsersToTask(checklistId, userIds);
      
      toast.success('Users assigned successfully');
      
      // Reload the tasks to get the latest data
      await loadAuditTasks();
      
    } catch (error: any) {
      console.error('[UI] Failed to bulk assign users:', error);
      toast.error(error.message || 'Failed to assign users');
    }
  };

  const handleTitleChange = async (id: number, task_name: string) => {
    // Update local state immediately for better UX
    const updatedChecklists = checklists.map(item => 
      item.id === id ? { ...item, task_name } : item
    );
    setChecklists(updatedChecklists);
    applyFilters(updatedChecklists, activeFilter, searchQuery);
    
    // Debounce API call to avoid too many requests
    try {
      await updateAuditTask(id, { task_name });
    } catch (error) {
      console.error('Error updating task name:', error);
      toast.error('Failed to update task name');
      // Revert local state on error
      loadAuditTasks();
    }
  };

  const handleDeleteChecklist = async (id: number) => {
    if (!confirm('Are you sure you want to delete this checklist item? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteAuditTask(id);
      const updatedChecklists = checklists.filter(item => item.id !== id);
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      toast.success('Checklist item deleted successfully');
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast.error('Failed to delete checklist item');
    }
  };

  const handleBulkAssign = () => {
    setIsAssignModalOpen(true);
  };

  const handleBulkAssignUsers = async (userId: number) => {
    try {
      // Get unassigned checklist items
      const unassignedItems = checklists.filter(item => !item.assigned_to);
      
      if (unassignedItems.length === 0) {
        toast('All checklist items are already assigned');
        setIsAssignModalOpen(false);
        return;
      }

      // Bulk assign to all unassigned items
      const updatePromises = unassignedItems.map(item => 
        updateAuditTask(item.id, { assigned_to: userId })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const assignedUser = users.find(u => u.id === userId);
      const updatedChecklists = checklists.map(item => 
        unassignedItems.some(ui => ui.id === item.id)
          ? { 
              ...item, 
              assigned_to: assignedUser 
                ? { id: userId, name: assignedUser.full_name }
                : undefined
            }
          : item
      );
      
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      setIsAssignModalOpen(false);
      
      toast.success(`${unassignedItems.length} items assigned to ${assignedUser?.full_name}`);
    } catch (error) {
      console.error('Error bulk assigning users:', error);
      toast.error('Failed to bulk assign users');
    }
  };

  const handleExportList = () => {
    try {
      // Prepare CSV data
      const csvHeaders = ['Task Name', 'Status', 'Priority', 'Assigned To', 'Progress', 'Due Date'];
      const csvData = filteredChecklists.map(item => [
        `"${item.task_name.replace(/"/g, '""')}"`, // Escape quotes in task name
        item.status,
        item.priority,
        item.assigned_to?.name || 'Unassigned',
        `${Math.round(item.progress_percentage || 0)}%`,
        item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'
      ]);
      
      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-checklist-${auditData?.reference_number || 'export'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Checklist exported successfully');
    } catch (error) {
      console.error('Error exporting checklist:', error);
      toast.error('Failed to export checklist');
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSearchQueryChange = (id: number, query: string) => {
    setChecklists(checklists.map(item => 
      item.id === id ? { ...item, searchQuery: query } : item
    ));
  };

  const handleStatusChange = async (id: number, newStatus: ChecklistItem['status']) => {
    console.log('=== STATUS CHANGE START ===');
    console.log('Task ID:', id);
    console.log('New Status:', newStatus);
    
    // Find the task and its checklist
    const task = checklists.find(item => item.id === id);
    console.log('Found task:', task ? { id: task.id, name: task.task_name, checklist: task.checklist } : 'not found');
    
    if (!task) {
      console.error('Task not found');
      toast.error('Task not found');
      return;
    }
    
    if (!task.checklist) {
      console.error('Task has no checklist');
      toast.error('Task has no associated checklist');
      return;
    }
    
    // Map frontend status to backend checklist status
    const backendStatus = newStatus === 'In Progress' ? 'in_progress' : 
                         newStatus === 'Completed' ? 'completed' :
                         newStatus === 'On Hold' ? 'on_hold' :
                         newStatus === 'Cancelled' ? 'cancelled' : 
                         newStatus === 'Pending' ? 'draft' : 'draft';
    
    console.log('Status mapping:', { frontend: newStatus, backend: backendStatus });
    
    // Update local state immediately
    const updatedChecklists = checklists.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setChecklists(updatedChecklists);
    applyFilters(updatedChecklists, activeFilter, searchQuery);
    setStatusDropdownId(null);
    
    try {
      console.log('Calling changeChecklistStatus with:', { checklistId: task.checklist.id, status: backendStatus });
      
      // Update checklist status
      const response = await changeChecklistStatus(task.checklist.id, backendStatus);
      console.log('Status update response:', response);
      
      // Reload audit tasks to ensure consistency
      await loadAuditTasks();
      
      toast.success(`Status updated to ${newStatus}`);
      console.log('=== STATUS CHANGE SUCCESS ===');
    } catch (error: any) {
      console.error('=== STATUS CHANGE ERROR ===');
      console.error('Error updating status:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      // More specific error handling
      let errorMessage = 'Failed to update status';
      if (error?.response?.status === 404) {
        errorMessage = 'Checklist not found';
      } else if (error?.response?.status === 400) {
        const errorData = error?.response?.data;
        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Revert local state on error
      console.log('Reverting local state...');
      loadAuditTasks();
    }
  };

  const applyFilters = (items: ChecklistItem[], filter: string, search: string) => {
    console.log('Applying filters:', { 
      totalItems: items.length, 
      filter, 
      search,
      items: items.map(i => ({ id: i.id, name: i.task_name, status: i.status }))
    });
    
    let filtered = items;
    
    // Apply status filter
    if (filter !== 'All') {
      filtered = filtered.filter(item => item.status === filter);
      console.log('After status filter:', { filter, filteredCount: filtered.length });
    }
    
    // Apply search filter with safe navigation
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        const taskName = item.task_name || '';
        const description = item.description || '';
        const assignedUserName = item.assigned_to?.name || '';
        
        const matches = taskName.toLowerCase().includes(searchLower) ||
                       description.toLowerCase().includes(searchLower) ||
                       assignedUserName.toLowerCase().includes(searchLower);
        
        return matches;
      });
      console.log('After search filter:', { search, filteredCount: filtered.length });
    }
    
    console.log('Final filtered items:', filtered.length);
    setFilteredChecklists(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(checklists, filter, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    console.log('Search change:', { search, totalItems: checklists.length });
    setSearchQuery(search);
    applyFilters(checklists, activeFilter, search);
  };

  // User assignment helper functions
  const getFilteredUsersForAssignment = () => {
    const filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results for performance
    
    console.log('Filtering users for assignment:', {
      searchTerm: userSearchTerm,
      totalUsers: users.length,
      filteredUsers: filtered.length,
      filtered: filtered.map(u => ({ id: u.id, name: u.full_name, email: u.email }))
    });
    
    return filtered;
  };

  const handleUserSearch = (searchTerm: string, taskId: number) => {
    setUserSearchTerm(searchTerm);
    setShowUserDropdown(searchTerm ? taskId : null);
  };

  const handleUserAssignmentSelect = (user: User, taskId: number) => {
    console.log('User assignment selected:', { user, taskId });
    handleAssignUser(taskId, user.id);
  };

  const handleRemoveAssignment = async (taskId: number) => {
    try {
      await updateAuditTask(taskId, { assigned_to: null });
      
      // Update local state
      const updatedChecklists = checklists.map(item => 
        item.id === taskId ? { ...item, assigned_to: undefined } : item
      );
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      
      toast.success('Assignment removed successfully');
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  // Team assignment handlers
  const handleTeamSearch = (searchTerm: string, taskId: number) => {
    setTeamSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setShowTeamDropdown(null);
    } else {
      setShowTeamDropdown(taskId);
    }
  };

  const handleTeamAssignmentSelect = async (team: Team, taskId: number) => {
    try {
      console.log('Assigning team to task:', { teamId: team.id, taskId });
      
      // Update UI directly (you can integrate with backend later)
      const updatedChecklists = checklists.map(item => {
        if (item.id === taskId) {
          const currentTeams = item.assigned_teams || [];
          const isAlreadyAssigned = currentTeams.some(t => t.id === team.id);
          
          if (!isAlreadyAssigned) {
            const teamForUI = {
              id: team.id,
              name: team.name,
              type: team.type,
              member_count: team.members.length
            };
            
            return {
              ...item,
              assigned_teams: [...currentTeams, teamForUI]
            };
          }
        }
        return item;
      });
      
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      
      setShowTeamDropdown(null);
      setTeamSearchTerm('');
      
      toast.success(`Team "${team.name}" assigned to task`);
    } catch (error: any) {
      console.error('Error assigning team:', error);
      toast.error(error.message || 'Failed to assign team');
    }
  };

  const handleRemoveTeamAssignment = async (taskId: number, teamId: number) => {
    try {
      console.log('Removing team from task:', { teamId, taskId });
      
      // Update UI
      const updatedChecklists = checklists.map(item => {
        if (item.id === taskId && item.assigned_teams) {
          return {
            ...item,
            assigned_teams: item.assigned_teams.filter(team => team.id !== teamId)
          };
        }
        return item;
      });
      
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      
      const team = teams.find(t => t.id === teamId);
      toast.success(`Team "${team?.name || 'Unknown'}" removed from task`);
    } catch (error: any) {
      console.error('Error removing team assignment:', error);
      toast.error(error.message || 'Failed to remove team assignment');
    }
  };

  const getFilteredTeamsForAssignment = () => {
    if (!teamSearchTerm.trim()) return [];
    
    const searchLower = teamSearchTerm.toLowerCase();
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchLower) ||
      team.type.toLowerCase().includes(searchLower)
    );
  };

  // Unified search handlers for both users and teams
  const handleUnifiedSearch = (searchTerm: string, taskId: number) => {
    setUnifiedSearchTerm(searchTerm);
    setShowUnifiedDropdown(searchTerm ? taskId : null);
  };

  const getFilteredUsersAndTeamsForAssignment = () => {
    if (!unifiedSearchTerm.trim()) return { users: [], teams: [] };
    
    const searchLower = unifiedSearchTerm.toLowerCase();
    
    // Filter users
    const filteredUsersForAssignment = users.filter(user => 
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
    
    // Filter teams
    const filteredTeamsForAssignment = teams.filter(team => 
      team.name.toLowerCase().includes(searchLower) ||
      team.type.toLowerCase().includes(searchLower)
    );
    
    return {
      users: filteredUsersForAssignment,
      teams: filteredTeamsForAssignment
    };
  };

  const handleUnifiedAssignmentSelect = async (
    item: User | Team, 
    taskId: number, 
    type: 'user' | 'team'
  ) => {
    if (type === 'user') {
      handleUserAssignmentSelect(item as User, taskId);
    } else {
      handleTeamAssignmentSelect(item as Team, taskId);
    }
    
    // Clear unified search
    setUnifiedSearchTerm('');
    setShowUnifiedDropdown(null);
  };

  // Publish audit item handler
  const handlePublishAuditItem = async (itemId: number) => {
    try {
      console.log('Publishing audit item:', itemId);
      
      // Update the item status to 'Published' or handle the publishing logic
      const updatedChecklists = checklists.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'In Progress' as ChecklistItem['status'], // Change status to In Progress when published
            is_published: true // Add published flag if needed
          };
        }
        return item;
      });
      
      setChecklists(updatedChecklists);
      applyFilters(updatedChecklists, activeFilter, searchQuery);
      
      // Here you would typically call an API endpoint to publish the item
      // await publishAuditItem(itemId);
      
      toast.success('Audit item published successfully');
      
      // Reload tasks to get updated data
      await loadAuditTasks();
      await loadTaskSummary();
    } catch (error: any) {
      console.error('Error publishing audit item:', error);
      toast.error(error.message || 'Failed to publish audit item');
    }
  };

  // Team creation handlers
  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    if (!teamForm.owner) {
      toast.error('Team owner is required');
      return;
    }

    // If editing, use update handler
    if (editingTeamId) {
      return handleUpdateTeam();
    }

    try {
      // Prepare team data for API
      const teamData = {
        name: teamForm.name,
        type: teamForm.type,
        owner: parseInt(teamForm.owner),
        member_ids: teamForm.members,
        description: '',
        is_active: true
      };

      console.log('Creating team with data:', teamData);

      // Call the real API
      const newTeam = await createTeam(teamData);
      
      console.log('Team created successfully:', newTeam);

      // Add to teams state (convert API response to UI format)
      const owner = users.find(u => u.id === newTeam.owner);
      const members = users.filter(u => teamData.member_ids.includes(u.id));
      
      const teamForUI: Team = {
        id: newTeam.id,
        name: newTeam.name,
        type: newTeam.type,
        owner: owner!,
        members: members,
        created_at: newTeam.created_at,
        created_by: newTeam.created_by_name || 'Current User'
      };

      setTeams(prev => [...prev, teamForUI]);
      
      toast.success(`Team "${teamForm.name}" created successfully`);
      handleCloseTeamModal();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    }
  };

  const handleTeamMemberToggle = (userId: number) => {
    setTeamForm(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  // Enhanced team management handlers
  const handleEditTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setTeamForm({
        name: team.name,
        type: team.type,
        owner: team.owner.id.toString(),
        members: team.members.map(m => m.id)
      });
      setEditingTeamId(teamId);
      setIsCreateTeamModalOpen(true);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeamId || !teamForm.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      setIsTeamLoading(editingTeamId);

      const updateData = {
        name: teamForm.name,
        type: teamForm.type,
        owner: parseInt(teamForm.owner),
        member_ids: teamForm.members,
        description: '',
        is_active: true
      };

      console.log('Updating team with data:', updateData);
      const updatedTeam = await updateTeam(editingTeamId, updateData);

      // Update local state
      const owner = users.find(u => u.id === updatedTeam.owner);
      const members = users.filter(u => teamForm.members.includes(u.id));

      const teamForUI: Team = {
        id: updatedTeam.id,
        name: updatedTeam.name,
        type: updatedTeam.type,
        owner: owner!,
        members: members,
        created_at: updatedTeam.created_at,
        created_by: updatedTeam.created_by_name || 'Unknown'
      };

      setTeams(prev => prev.map(t => t.id === editingTeamId ? teamForUI : t));
      toast.success(`Team "${teamForm.name}" updated successfully`);
      handleCloseTeamModal();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error(error.message || 'Failed to update team');
    } finally {
      setIsTeamLoading(null);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (!window.confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      return;
    }

    try {
      setIsTeamLoading(teamId);
      console.log('Deleting team:', teamId);
      
      await deleteTeam(teamId);
      
      // Remove from local state
      setTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success(`Team "${team.name}" deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'Failed to delete team');
    } finally {
      setIsTeamLoading(null);
    }
  };

  const handleAddMemberToTeam = async (teamId: number, userId: number) => {
    try {
      const memberData = {
        user: userId,
        role: 'member'
      };

      console.log('Adding member to team:', { teamId, memberData });
      await addTeamMember(teamId, memberData);

      // Reload teams to get updated data
      await loadTeams();
      toast.success('Member added to team successfully');
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add member to team');
    }
  };

  const handleRemoveMemberFromTeam = async (teamId: number, userId: number) => {
    try {
      console.log('Removing member from team:', { teamId, userId });
      await removeTeamMember(teamId, userId);

      // Update local state
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members: team.members.filter(m => m.id !== userId) }
          : team
      ));
      toast.success('Member removed from team successfully');
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast.error(error.message || 'Failed to remove member from team');
    }
  };

  const handleAssignTeamToAudit = async (teamId: number) => {
    if (!auditData?.id) {
      toast.error('No audit selected');
      return;
    }

    try {
      console.log('Assigning team to audit:', { teamId, auditId: auditData.id });
      await assignTeamToAudit(teamId, auditData.id);
      
      toast.success('Team assigned to audit successfully');
      // Reload audit data to reflect changes
      await loadAuditData();
    } catch (error: any) {
      console.error('Error assigning team to audit:', error);
      toast.error(error.message || 'Failed to assign team to audit');
    }
  };

  const handleUnassignTeamFromAudit = async (teamId: number) => {
    if (!auditData?.id) {
      toast.error('No audit selected');
      return;
    }

    try {
      console.log('Unassigning team from audit:', { teamId, auditId: auditData.id });
      await unassignTeamFromAudit(teamId, auditData.id);
      
      toast.success('Team unassigned from audit successfully');
      // Reload audit data to reflect changes
      await loadAuditData();
    } catch (error: any) {
      console.error('Error unassigning team from audit:', error);
      toast.error(error.message || 'Failed to unassign team from audit');
    }
  };

  const handleCloseTeamModal = () => {
    setIsCreateTeamModalOpen(false);
    setEditingTeamId(null);
    setTeamForm({
      name: '',
      type: 'audit',
      owner: '',
      members: []
    });
    setTeamMemberSearch('');
    setCurrentPage(1);
    setSelectedDepartment('all');
  };

  const loadTeamStatistics = async () => {
    try {
      const stats = await getTeamStatistics();
      console.log('Team statistics loaded:', stats);
      setTeamStatistics(stats);
    } catch (error) {
      console.error('Error loading team statistics:', error);
    }
  };

  const getFilteredUsersForTeam = () => {
    return users.filter(user => {
      const fullName = user.full_name || '';
      const email = user.email || '';
      const department = user.department || '';
      const searchLower = teamMemberSearch.toLowerCase();
      
      // Search filter
      const matchesSearch = fullName.toLowerCase().includes(searchLower) ||
                           email.toLowerCase().includes(searchLower) ||
                           department.toLowerCase().includes(searchLower);
      
      // Department filter
      const matchesDepartment = selectedDepartment === 'all' || 
                               department.toLowerCase() === selectedDepartment.toLowerCase();
      
      return matchesSearch && matchesDepartment;
    });
  };

  const getPaginatedUsers = () => {
    const filtered = getFilteredUsersForTeam();
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return {
      users: filtered.slice(startIndex, endIndex),
      totalUsers: filtered.length,
      totalPages: Math.ceil(filtered.length / usersPerPage)
    };
  };

  const getUniqueDepartments = () => {
    const departments = users.map(user => user.department || 'No Department')
                           .filter((dept, index, arr) => arr.indexOf(dept) === index)
                           .sort();
    return departments;
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsersForTeam();
    const filteredUserIds = filteredUsers.map(user => user.id);
    const allSelected = filteredUserIds.every(id => teamForm.members.includes(id));
    
    if (allSelected) {
      // Deselect all filtered users
      setTeamForm(prev => ({
        ...prev,
        members: prev.members.filter(id => !filteredUserIds.includes(id))
      }));
    } else {
      // Select all filtered users
      const newMembers = [...new Set([...teamForm.members, ...filteredUserIds])];
      setTeamForm(prev => ({
        ...prev,
        members: newMembers
      }));
    }
  };

  const renderOverviewContent = () => {
    if (!auditData) return null;

    return (
      <div className="space-y-6">
        {/* Audit Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyling(auditData.status).bgColor} ${getStatusStyling(auditData.status).textColor}`}>
              {auditData.status}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Current audit status
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {taskSummary ? Math.round(((taskSummary.breakdown?.by_status?.completed || 0) / (taskSummary.total_tasks || 1)) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {taskSummary ? `${taskSummary.breakdown?.by_status?.completed || 0} of ${taskSummary.total_tasks || 0} tasks completed` : 'No tasks found'}
            </p>
          </div>

          {/* Team Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {auditData.assigned_users?.length || 0}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Assigned team members
            </p>
          </div>
        </div>

        {/* Audit Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Number
              </label>
              <p className="text-gray-900 dark:text-white">{auditData.reference_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audit Type
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{auditData.audit_type.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period From
              </label>
              <p className="text-gray-900 dark:text-white">{auditData.period_from || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period To
              </label>
              <p className="text-gray-900 dark:text-white">{auditData.period_to || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scope
              </label>
              <p className="text-gray-900 dark:text-white">{auditData.scope || 'No scope defined'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Objectives
              </label>
              <p className="text-gray-900 dark:text-white">{auditData.objectives || 'No objectives defined'}</p>
            </div>
          </div>
        </div>

        {/* Workflow Information */}
        {currentWorkflow && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workflow Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow Name
                </label>
                <p className="text-gray-900 dark:text-white">{currentWorkflow.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow Status
                </label>
                <p className="text-gray-900 dark:text-white">{currentWorkflow.status}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">{currentWorkflow.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportsContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Audit Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Generate and view comprehensive audit reports
              </p>
            </div>
            <button
              onClick={() => navigate(`/audits/${id}/report`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm font-medium"
            >
              <BarChart3 className="w-5 h-5" />
              View Full Report
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tasks</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {taskSummary?.total_tasks || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Completed</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {taskSummary?.breakdown?.by_status?.completed || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">In Progress</p>
                  <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    {taskSummary?.breakdown?.by_status?.in_progress || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Pending</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {taskSummary?.breakdown?.by_status?.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">Summary Report</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  High-level overview of audit progress and key findings
                </p>
                <button className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                  Generate Report →
                </button>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">Detailed Report</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive report with all tasks, findings, and evidence
                </p>
                <button className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                  Generate Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsContent = () => {
    const settingsTabs = [
      { id: 'general', label: 'General', icon: Settings },
      { id: 'teamsUsers', label: 'Teams & Users', icon: Users },
    ];

    const renderGeneralSettings = () => (
      <div className="space-y-6">
        {/* General Settings */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive email updates for audit progress</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save Drafts</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save changes as drafts</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Collaboration</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable real-time updates for team members</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Control</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Restrict Edit Access</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Only assigned users can edit this audit</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Visibility</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Make audit visible to all users in organization</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data & Export</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Retention Period
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                <option>1 year</option>
                <option>2 years</option>
                <option>5 years</option>
                <option>Indefinite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format Preference
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                <option>PDF</option>
                <option>Excel</option>
                <option>Word</option>
                <option>JSON</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Reset to Default
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    );

    const renderTeamsAndUsersSettings = () => (
      <div className="space-y-6">
        {/* Header */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teams & Users Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage teams and user access for this audit project
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span>{teams.length} teams</span>
                <span>{auditData?.assigned_users?.length || 0} total members</span>
              </div>
              <button
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
              >
                <Users className="w-4 h-4" />
                Create Team
              </button>
            </div>
          </div>

          {/* Teams Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Created Teams</h4>
              {teams.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {teams.reduce((total, team) => total + team.members.length + 1, 0)} total members
                </span>
              )}
            </div>
            
            {teams.length > 0 ? (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                          <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{team.name}</h5>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {team.type === 'audit' && '🔍'} 
                              {team.type === 'review' && '📋'} 
                              {team.type === 'management' && '👔'} 
                              {team.type === 'technical' && '⚙️'} 
                              {team.type === 'compliance' && '✅'} 
                              {team.type.charAt(0).toUpperCase() + team.type.slice(1)} Team
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {team.members.length + 1} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTeam(team.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit team"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignTeamToAudit(team.id)}
                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                          title="Assign team to audit"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          disabled={isTeamLoading === team.id}
                          title="Delete team"
                        >
                          {isTeamLoading === team.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Team Owner */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Team Owner</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {team.owner.full_name?.[0] || team.owner.first_name?.[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{team.owner.full_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({team.owner.email})</span>
                      </div>
                    </div>
                    
                    {/* Team Members */}
                    {team.members.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Team Members</p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 group">
                              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {member.full_name?.[0] || member.first_name?.[0]}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300">{member.full_name}</span>
                              <button
                                onClick={() => handleRemoveMemberFromTeam(team.id, member.id)}
                                className="ml-1 p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                title="Remove member"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleUnassignTeamFromAudit(team.id)}
                          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Unassign from audit"
                        >
                          Unassign
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Created {new Date(team.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No teams created yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Create teams to organize your audit workflow</p>
              </div>
            )}
          </div>
        </div>

        {/* Individual Users Management */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Individual Users</h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {auditData?.assigned_users_details?.length || 0} assigned users
            </span>
          </div>
          
          {/* Current Individual Users */}
          {auditData?.assigned_users_details && auditData.assigned_users_details.length > 0 ? (
            <div className="space-y-3 mb-4">
              {auditData.assigned_users_details.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || `${user.first_name} ${user.last_name}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email} • {user.department || 'No Department'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                      Individual User
                    </span>
                    <button
                      onClick={() => {
                        // Add remove user functionality here
                        toast.success(`${user.full_name} removed from audit`);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg mb-4">
              <User className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No individual users assigned</p>
            </div>
          )}

          {/* Add Individual Users */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users to add individually..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Available Users List */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.department || 'No Department'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Add user to audit functionality here
                        toast.success(`${user.full_name} added to audit`);
                      }}
                      className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Access Control & Permissions */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Access Control & Permissions</h4>
          
          {/* Global Permissions */}
          <div className="space-y-4 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
              <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Global Audit Permissions</h5>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow audit editing</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team members can edit audit details and configuration</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow task management</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team members can create, edit, and assign tasks</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow report generation</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team members can generate and export audit reports</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow team management</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team owners can invite or remove team members</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
              </div>
            </div>
          </div>

          {/* Team-Specific Permissions */}
          {teams.length > 0 && (
            <div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Team-Specific Permissions</h5>
              </div>
              
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{team.type} team</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
                        <span className="text-gray-700 dark:text-gray-300">Read access</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-700 dark:text-gray-300">Write access</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-700 dark:text-gray-300">Delete access</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-700 dark:text-gray-300">Admin access</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Audit Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure audit parameters, teams, and preferences
              </p>
            </div>
          </div>

          {/* Settings Sub-navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeSettingsTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          {activeSettingsTab === 'general' ? renderGeneralSettings() : renderTeamsAndUsersSettings()}
        </div>
      </div>
    );
  };

  const renderChecklistContent = () => {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Tasks & Audit Items</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive task management with audit items, evidence collection, and progress tracking
            </p>
            {taskSummary && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>{taskSummary.total_tasks || 0}</strong> Total Tasks
                </span>
                <span className="text-green-600 dark:text-green-400">
                  <strong>{taskSummary.breakdown?.by_status?.completed || 0}</strong> Completed
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  <strong>{taskSummary.breakdown?.by_status?.in_progress || 0}</strong> In Progress
                </span>
                {taskSummary.breakdown?.overdue_count > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    <strong>{taskSummary.breakdown.overdue_count}</strong> Overdue
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit items..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Progress Summary */}
            {checklists.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {checklists.filter(item => item.completed).length} of {checklists.length} completed
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>
              <button
                onClick={handleAddChecklist}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Quick Item
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        {checklists.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Quick Actions:
              </div>
              <button 
                onClick={async () => {
                  const allCompleted = checklists.every(item => item.completed);
                  const newCompleted = !allCompleted;
                  
                  const updatedChecklists = checklists.map(item => ({ 
                    ...item, 
                    completed: newCompleted,
                    status: (newCompleted ? 'Completed' : 'Pending') as ChecklistItem['status'],
                    progress_percentage: newCompleted ? 100 : 0
                  }));
                  
                  setChecklists(updatedChecklists);
                  applyFilters(updatedChecklists, activeFilter, searchQuery);
                  
                  try {
                    // Update all tasks in parallel - use proper API calls
                    const updatePromises = checklists.map(async item => {
                      if (item.checklist) {
                        // Update checklist status if checklist exists
                        const backendStatus = newCompleted ? 'completed' : 'draft';
                        return changeChecklistStatus(item.checklist.id, backendStatus);
                      } else {
                        // Update task directly if no checklist
                        return updateAuditTask(item.id, { 
                          completion_notes: newCompleted ? 'Bulk marked as completed' : 'Bulk marked as incomplete'
                        });
                      }
                    });
                    
                    await Promise.all(updatePromises);
                    
                    // Refresh task summary after bulk operation
                    loadTaskSummary();
                    
                    toast.success(`All items marked as ${newCompleted ? 'complete' : 'incomplete'}`);
                  } catch (error) {
                    console.error('Error bulk updating items:', error);
                    toast.error('Failed to bulk update items');
                    loadAuditTasks();
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {checklists.every(item => item.completed) ? 'Mark All Incomplete' : 'Mark All Complete'}
              </button>
              <button 
                onClick={() => {
                  const updatedChecklists = checklists.map(item => ({ ...item, isExpanded: false }));
                  setChecklists(updatedChecklists);
                  applyFilters(updatedChecklists, activeFilter, searchQuery);
                }}
                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
              >
                Collapse All
              </button>
              <button 
                onClick={() => {
                  const updatedChecklists = checklists.map(item => ({ ...item, isExpanded: true }));
                  setChecklists(updatedChecklists);
                  applyFilters(updatedChecklists, activeFilter, searchQuery);
                }}
                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
              >
                Expand All
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Progress:</div>
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${checklists.length > 0 ? (checklists.filter(item => item.completed).length / checklists.length) * 100 : 0}%` }}
                />
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {checklists.length > 0 ? Math.round((checklists.filter(item => item.completed).length / checklists.length) * 100) : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        {checklists.length > 0 && (
          <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-6">
              {['All', 'Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map((filter) => {
                const count = filter === 'All' 
                  ? checklists.length 
                  : checklists.filter(item => item.status === filter).length;
                
                return (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilter === filter
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Checklist Items */}
        <div className="space-y-3">
          {filteredChecklists.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                {checklists.length === 0 ? (
                  <>
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No audit items yet</h3>
                    <p className="text-sm mb-4">Get started by adding your first audit item</p>
                    <button
                      onClick={handleAddChecklist}
                      className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Item
                    </button>
                  </>
                ) : (
                  <>
                    <Search className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No items found</h3>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            filteredChecklists.map((item, index) => {
            const statusOption = statusOptions.find(s => s.value === item.status);
            const assignedUsers = item.assigned_users || [];
            const hasAssignments = assignedUsers.length > 0;
            
            console.log('Rendering item:', {
              id: item.id,
              task_name: item.task_name,
              assigned_users: assignedUsers,
              hasAssignments: hasAssignments,
              assignedUsersCount: assignedUsers.length,
              firstUserName: assignedUsers[0]?.name,
              checklistAssignedUsers: item.checklist?.assigned_users
            });

                        return (
              <div key={item.id} className={`group relative rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                item.completed 
                  ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                  : 'border border-gray-200 bg-white hover:border-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700'
              }`}>
                {/* Simple top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                  item.completed 
                    ? 'bg-green-500' 
                    : item.status === 'In Progress' 
                      ? 'bg-orange-500'
                      : item.status === 'On Hold'
                        ? 'bg-yellow-500'
                        : 'bg-primary-500'
                }`} />
                 
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Simple Checkbox */}
                      <button
                        onClick={() => handleChecklistComplete(item.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          item.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500'
                        }`}
                      >
                        {item.completed && <Check className="h-3 w-3" />}
                      </button>
                      
                      {/* Simple Item Number */}
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {index + 1}
                      </div>

                      {/* Simple Title Input */}
                      <input
                        type="text"
                        value={item.task_name}
                        onChange={(e) => handleTitleChange(item.id, e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-base font-medium transition-all duration-200 ${
                          item.completed 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}
                        placeholder="Enter audit task name..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Simple Status Badge */}
                      <div className="relative">
                        <button
                          onClick={() => setStatusDropdownId(statusDropdownId === item.id ? null : item.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${statusOption?.color}`}
                        >
                          {item.status}
                        </button>
                        
                        {statusDropdownId === item.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 min-w-40">
                            <div className="py-1">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    handleStatusChange(item.id, option.value as ChecklistItem['status']);
                                    setStatusDropdownId(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.split(' ')[0]}`} />
                                  {option.value}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Simple Metadata */}
                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {item.priority?.toUpperCase()}
                        </div>
                        
                        {/* Progress Percentage */}
                        {item.progress_percentage !== undefined && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded text-xs text-primary-700 dark:text-primary-300">
                            <BarChart3 className="h-3 w-3" />
                            {Math.round(item.progress_percentage)}%
                          </div>
                        )}
                        
                        {/* Published/Unpublished Status */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          item.is_published
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {item.is_published ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Draft
                            </>
                          )}
                        </div>
                        
                        {                        /* Assigned Users and Teams */}
                        {hasAssignments || (item.assigned_teams && item.assigned_teams.length > 0) ? (
                          <div className="flex items-center gap-1">
                            {/* User Assignments */}
                            {hasAssignments && (
                              assignedUsers.length === 1 ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                  <User className="h-3 w-3" />
                                  {assignedUsers[0].name}
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded text-xs text-primary-700 dark:text-primary-300"
                                  title={`Assigned to: ${assignedUsers.map(u => u.name).join(', ')}`}
                                >
                                  <Users className="h-3 w-3" />
                                  {assignedUsers.length} users
                                </div>
                              )
                            )}
                            
                            {/* Team Assignments */}
                            {item.assigned_teams && item.assigned_teams.length > 0 && (
                              item.assigned_teams.length === 1 ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-600 dark:text-blue-400">
                                  <Users className="h-3 w-3" />
                                  {item.assigned_teams[0].name}
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-600 dark:text-blue-400"
                                  title={`Teams: ${item.assigned_teams.map(t => t.name).join(', ')}`}
                                >
                                  <Users className="h-3 w-3" />
                                  {item.assigned_teams.length} teams
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded text-xs text-orange-600 dark:text-orange-400">
                            <UserPlus className="h-3 w-3" />
                            Unassigned
                          </div>
                        )}
                        
                        {/* Due Date */}
                        {item.due_date && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            new Date(item.due_date) < new Date() && !item.completed
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(item.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Simple Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Expand/Collapse */}
                        <button
                          onClick={() => handleChecklistExpand(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title={item.isExpanded ? "Collapse details" : "Expand details"}
                        >
                          {item.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {/* Task Details */}
                        <button
                          onClick={() => {
                            setSelectedTask(item);
                            setIsTaskDetailsModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="View Task Details"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteChecklist(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete audit item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Simple Expanded Content */}
                  {item.isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 shadow-inner bg-gray-50/50 dark:bg-gray-800/30 rounded-b-lg -mx-4 px-4 pb-4">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description & Notes
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleChecklistContentChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                          rows={3}
                          placeholder="Add detailed description, notes, or requirements for this audit task..."
                        />
                      </div>

                      {/* Unified Assignment Section */}
                      <div>

                        {/* Unified Assignment Search */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Assignments
                          </label>
                          
                          {/* Current Assignments Display */}
                          <div className="space-y-2">
                            {/* User Assignments */}
                            {item.assigned_users && item.assigned_users.map((user) => (
                              <div key={`user-${user.id}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                      {user.name}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">User</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveUserAssignment(item.id, user.id)}
                                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  title="Remove user assignment"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            
                            {/* Team Assignments */}
                            {item.assigned_teams && item.assigned_teams.map((team) => (
                              <div key={`team-${team.id}`} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {team.name}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {team.type.charAt(0).toUpperCase() + team.type.slice(1)} Team • {team.member_count} members
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveTeamAssignment(item.id, team.id)}
                                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  title="Remove team assignment"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                              
                              {/* Unified Search Input */}
                              <div className="relative unified-assignment-dropdown">
                                <input
                                  type="text"
                                  placeholder="Search users and teams to assign..."
                                  value={showUnifiedDropdown === item.id ? unifiedSearchTerm : ''}
                                  onChange={(e) => handleUnifiedSearch(e.target.value, item.id)}
                                  onFocus={() => setShowUnifiedDropdown(item.id)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                
                                {/* Unified Dropdown */}
                                {showUnifiedDropdown === item.id && unifiedSearchTerm && (
                                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-60 overflow-y-auto">
                                    {(() => {
                                      const { users: filteredUsers, teams: filteredTeams } = getFilteredUsersAndTeamsForAssignment();
                                      const availableUsers = filteredUsers.filter(user => !item.assigned_users?.some(assignedUser => assignedUser.id === user.id));
                                      const availableTeams = filteredTeams.filter(team => !item.assigned_teams?.some(assignedTeam => assignedTeam.id === team.id));
                                      
                                      if (availableUsers.length === 0 && availableTeams.length === 0) {
                                        return (
                                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            No users or teams found
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <>
                                          {/* Users Section */}
                                          {availableUsers.length > 0 && (
                                            <>
                                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                                                Users ({availableUsers.length})
                                              </div>
                                              {availableUsers.map((user) => (
                                                <div
                                                  key={`search-user-${user.id}`}
                                                  onClick={() => handleUnifiedAssignmentSelect(user, item.id, 'user')}
                                                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {user.full_name}
                                                      </div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user.email} • {user.department}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </>
                                          )}
                                          
                                          {/* Teams Section */}
                                          {availableTeams.length > 0 && (
                                            <>
                                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                                                Teams ({availableTeams.length})
                                              </div>
                                              {availableTeams.map((team) => (
                                                <div
                                                  key={`search-team-${team.id}`}
                                                  onClick={() => handleUnifiedAssignmentSelect(team, item.id, 'team')}
                                                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {team.name}
                                                      </div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {team.type.charAt(0).toUpperCase() + team.type.slice(1)} Team • {team.members.length} members
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          {/* )} */}
                        </div>


                      </div>

                      {/* Additional Actions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quick Actions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => {
                              setSelectedTask(item);
                              setIsTaskDetailsModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs bg-primary-100 text-primary-700 border border-primary-300 rounded-md hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-600"
                          >
                            <FileText className="h-3 w-3 inline mr-1" />
                            View Details
                          </button>
                          <button 
                            onClick={() => {
                              navigate(`/audit-tasks/${item.id}/fill`);
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-600"
                          >
                            <CheckSquare className="h-3 w-3 inline mr-1" />
                            Fill Checklist
                          </button>
                          {item.checklist?.status !== 'completed' && (
                            <button 
                              onClick={async () => {
                                try {
                                  await submitTaskForReview(item.id);
                                  toast.success('Task submitted for review');
                                  loadAuditTasks();
                                } catch (error) {
                                  toast.error('Failed to submit for review');
                                }
                              }}
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-600"
                            >
                              <Send className="h-3 w-3 inline mr-1" />
                              Submit Review
                            </button>
                          )}
                          
                          {/* Publish Audit Item Button */}
                          {item.status !== 'In Progress' && item.status !== 'Completed' && (
                            <button 
                              onClick={() => handlePublishAuditItem(item.id)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600 transition-all duration-200"
                              title="Publish audit item for team access"
                            >
                              <Share className="h-3 w-3 inline mr-1" />
                              Publish Item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
        </div>



        {/* Simple Footer Summary */}
        {checklists.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>
                Total items: {checklists.length} • 
                Completed: {checklists.filter(item => item.completed).length} • 
                Remaining: {checklists.filter(item => !item.completed).length}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBulkAssign}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Bulk Assign
                </button>
                <button 
                  onClick={handleExportList}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                >
                  Export List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {isCreateTaskModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1004] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
              {/* Enhanced Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-8 py-6 border-b border-primary-500/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Create New Audit Task
                      </h3>
                      <p className="text-primary-100 mt-1 text-sm">
                        Select a checklist template and configure your audit task
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateTaskModalOpen(false)}
                    className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 group"
                    title="Close (Esc)"
                  >
                    <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="p-8 space-y-8">
                  {/* Template Selection Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                          Checklist Template <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose a template to base your task on</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={selectedTemplate?.id || ''}
                        onChange={(e) => {
                          const template = taskTemplates.find(t => t.id === parseInt(e.target.value));
                          setSelectedTemplate(template);
                        }}
                        className="flex-1 px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                        required
                      >
                        <option value="">Select a template...</option>
                        {taskTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.total_fields} fields) - {template.category}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          // Navigate to template creation page in same tab
                          navigate('/templates/create?return_to=/audits/' + id + '?tab=checklist');
                        }}
                        className="flex items-center justify-center px-5 py-4 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105"
                        title="Create new template"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {selectedTemplate && (
                      <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                              {selectedTemplate.name}
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                              {selectedTemplate.description}
                            </p>
                            <div className="flex flex-wrap gap-6 mt-4">
                              <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 px-3 py-1.5 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                                {selectedTemplate.total_fields} fields
                              </span>
                              <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 px-3 py-1.5 rounded-lg">
                                <Target className="w-4 h-4" />
                                {selectedTemplate.category || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTemplate && (
                    <>
                      {/* Task Details Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your audit task</p>
                          </div>
                        </div>

                        {/* Task Name */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Task Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            defaultValue={selectedTemplate.name}
                            id="taskName"
                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                            placeholder="Enter a descriptive task name"
                            required
                          />
                        </div>
                      </div>

                      {/* Assignment & Configuration Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment & Configuration</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set priority, assignments, and scheduling</p>
                          </div>
                        </div>

                        {/* Assigned To */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Assign To
                          </label>
                          <select
                            id="assignedUser"
                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                          >
                            <option value="">Select a user (optional)</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Priority and Risk Level */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Priority Level
                            </label>
                            <select
                              id="priority"
                              defaultValue="medium"
                              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                            >
                              <option value="low">🟢 Low Priority</option>
                              <option value="medium">🟡 Medium Priority</option>
                              <option value="high">🟠 High Priority</option>
                              <option value="critical">🔴 Critical Priority</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Risk Level
                            </label>
                            <select
                              id="riskLevel"
                              defaultValue="medium"
                              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                            >
                              <option value="low">🟢 Low Risk</option>
                              <option value="medium">🟡 Medium Risk</option>
                              <option value="high">🟠 High Risk</option>
                              <option value="critical">🔴 Critical Risk</option>
                            </select>
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Due Date
                          </label>
                          <input
                            type="datetime-local"
                            id="dueDate"
                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Enhanced Actions */}
                  <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-8 -mb-8 px-8 py-6 rounded-b-2xl">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      All fields marked with <span className="text-red-500">*</span> are required
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsCreateTaskModalOpen(false)}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:scale-105 shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!selectedTemplate || !id) return;
                          
                          const taskNameInput = document.getElementById('taskName') as HTMLInputElement;
                          const prioritySelect = document.getElementById('priority') as HTMLSelectElement;
                          const riskLevelSelect = document.getElementById('riskLevel') as HTMLSelectElement;
                          const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;
                          const assignedUserSelect = document.getElementById('assignedUser') as HTMLSelectElement;
                          
                          try {
                            const taskData = {
                              template_id: selectedTemplate.id,
                              task_name: taskNameInput.value,
                              checklist_name: taskNameInput.value,
                              description: `Task created from ${selectedTemplate.name} template`,
                              priority: prioritySelect.value,
                              control_area: selectedTemplate.category || 'General',
                              risk_level: riskLevelSelect.value,
                              due_date: dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null,
                              assigned_to: assignedUserSelect.value ? parseInt(assignedUserSelect.value) : null
                            };
                            
                            await createAuditTask(parseInt(id), taskData);
                            toast.success('Task created successfully');
                            setIsCreateTaskModalOpen(false);
                            setSelectedTemplate(null);
                            loadAuditTasks();
                            loadTaskSummary();
                          } catch (error) {
                            console.error('Error creating task:', error);
                            toast.error('Failed to create task');
                          }
                        }}
                        disabled={!selectedTemplate}
                        className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 border border-transparent rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                      >
                        <div className="flex items-center gap-3">
                          <Plus className="w-5 h-5" />
                          Create Task
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {isTaskDetailsModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Details</h3>
                <button
                  onClick={() => {
                    setIsTaskDetailsModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedTask.task_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      statusOptions.find(s => s.value === selectedTask.status)?.color
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedTask.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedTask.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Progress:</span>
                    <span className="ml-2">{Math.round(selectedTask.progress_percentage || 0)}%</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Assigned:</span>
                    <span className="ml-2">{selectedTask.assigned_to?.name || 'Unassigned'}</span>
                  </div>
                  {selectedTask.due_date && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                      <span className="ml-2">{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {selectedTask.checklist && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Checklist Information</h5>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Template: {selectedTask.checklist.name}</div>
                      <div>Completion: {selectedTask.checklist.completion_percentage || 0}%</div>
                      <div>Status: {selectedTask.checklist.status}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsTaskDetailsModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedTask) {
                      navigate(`/audit-tasks/${selectedTask.id}/fill`);
                    }
                    setIsTaskDetailsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  Fill Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Assignment Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bulk Assign Users</h3>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User to Assign
                  </label>
                  <select
                    onChange={(e) => {
                      const userId = parseInt(e.target.value);
                      if (userId) {
                        handleBulkAssignUsers(userId);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This will assign the selected user to all unassigned checklist items.
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };





  const renderContent = () => {
    console.log('renderContent called with activeSideTab:', activeSideTab, 'auditData:', !!auditData);
    
    switch (activeSideTab) {
      case 'overview':
        return renderOverviewContent();
      case 'tasks':
        console.log('Rendering tasks tab, auditData available:', !!auditData);
        if (!auditData) {
          return (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading audit data...</div>
            </div>
          );
        }
        
        // Test rendering with a simple fallback first
        try {
          return (
            <div className="w-full min-h-[400px] p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Audit Tasks - {auditData.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Audit ID: {auditData.id}
                </p>
                
                {/* Test if AuditTasks component renders */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AuditTasks Component:</p>
                  <AuditTasks 
                    auditId={auditData.id} 
                    auditTitle={auditData.title}
                    onTaskCreated={() => {
                      console.log('Task created callback triggered');
                      loadAuditData();
                    }}
                  />
                </div>
              </div>
            </div>
          );
        } catch (error) {
          console.error('Error rendering AuditTasks:', error);
          return (
            <div className="w-full min-h-[400px] p-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">
                  Error Loading Tasks
                </h2>
                <p className="text-red-600 dark:text-red-400">
                  There was an error loading the AuditTasks component: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          );
        }
        case 'checklist':
          return renderChecklistContent();
        case 'reports':
          return renderReportsContent();
        case 'settings':
          return renderSettingsContent();
        default:
          console.log('Default case hit for activeSideTab:', activeSideTab);
          return null;
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading audit details...</div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Audit not found</div>
      </div>
    );
  }

  const statusStyling = getStatusStyling(auditData.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 sm:px-4 lg:px-6">
          {/* Top Header Row */}
          <div className="flex items-center justify-between h-14 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/audits')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {auditData.title}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <Tag className="h-4 w-4" />
                    {auditData.reference_number}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <User className="h-4 w-4" />
                    Created by {auditData.created_by_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsStatusDropdownOpen(!isStatusDropdownOpen);
                          console.log('Status dropdown clicked:', !isStatusDropdownOpen, 'Available transitions:', availableTransitions);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors hover:opacity-80 ${statusStyling.bgColor} ${statusStyling.textColor}`}
                      >
                        {auditData.status}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      
                      {isStatusDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-48">
                          <div className="py-1">
                            {availableTransitions.length > 0 ? (
                              <>
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                                  Available Transitions
                                </div>
                                {availableTransitions.map((transition) => (
                                  <button
                                    key={transition}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusTransition(transition);
                                      setIsStatusDropdownOpen(false);
                                    }}
                                    disabled={isTransitioning}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                    {transition}
                                  </button>
                                ))}
                              </>
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No transitions available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded"
              >
                {isRightSidebarOpen ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs Row */}
          <div className="flex items-center h-12">
            <nav className="flex space-x-6">
              {sidebarNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSideTab(item.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeSideTab === item.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-3">
          {/* Main Content Area - Full Width */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
              {renderContent()}
            </div>
          </div>

          {/* Right Sidebar - Jira style */}
          {isRightSidebarOpen && (
            <div className="w-80 flex-shrink-0">
              <div className="space-y-3">
              {/* Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyling.bgColor} ${statusStyling.textColor}`}>
                      {auditData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reference</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{auditData.reference_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{auditData.audit_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Workflow</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{currentWorkflow?.name || 'No Workflow'}</span>
                  </div>
                </div>
              </div>

              {/* Workflow Card */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Workflow</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Workflow</label>
                    <div className="mt-1 px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">{currentWorkflow?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{currentWorkflow?.description}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Status</label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusStyling.bgColor.includes('blue') ? 'bg-blue-500' : 
                        statusStyling.bgColor.includes('orange') ? 'bg-orange-500' : 
                        statusStyling.bgColor.includes('yellow') ? 'bg-yellow-500' : 
                        statusStyling.bgColor.includes('green') ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-sm text-gray-900 dark:text-white">{auditData.status}</span>
                    </div>
                  </div>

                  {availableTransitions.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available Transitions</label>
                      <div className="mt-1 space-y-1">
                        {availableTransitions.map((transition) => (
                          <button
                            key={transition}
                            onClick={() => handleStatusTransition(transition)}
                            disabled={isTransitioning}
                            className="w-full flex items-center gap-2 text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-gray-700 dark:text-gray-300">{transition}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                   <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                     <div className="flex gap-1">
                       <button 
                         onClick={() => navigate(`/audits/${id}/edit`)}
                         className="flex-1 px-2 py-1.5 bg-primary-500 text-white text-xs rounded hover:bg-primary-600"
                       >
                         Edit Audit
                       </button>
                       <button className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                         Share
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assignees</label>
                    <div className="mt-1 space-y-1">
                      {auditData.assigned_users_details && auditData.assigned_users_details.length > 0 ? (
                        auditData.assigned_users_details.map((user: any) => (
                          <div key={user.id} className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No assignees</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Period End</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{new Date(auditData.period_to).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{new Date(auditData.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created By</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{auditData.created_by_name}</p>
                  </div>
                </div>
              </div>

              {/* Team Card */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Team</h3>
                <div className="space-y-1.5">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{user.full_name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {user.canWrite ? 'Write' : 'Read'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h3>
                <div className="space-y-1">
                  <button className="w-full text-left px-1.5 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    📋 Clone audit
                  </button>
                  <button className="w-full text-left px-1.5 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    📧 Send reminder
                  </button>
                  <button 
                    onClick={() => navigate(`/audits/${id}/report`)}
                    className="w-full text-left px-1.5 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    📊 Generate report
                  </button>
                  <button className="w-full text-left px-1.5 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    🔗 Share audit
                  </button>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">John Doe</span> completed task "Review Documentation"
                      <div className="text-gray-500 mt-1">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Jane Smith</span> added comment
                      <div className="text-gray-500 mt-1">4 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Mike Johnson</span> was assigned to audit
                      <div className="text-gray-500 mt-1">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Sarah Wilson</span> updated status to "In Progress"
                      <div className="text-gray-500 mt-1">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Attachments</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-1.5 border border-gray-200 dark:border-gray-600 rounded">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-900 dark:text-white">audit-checklist.pdf</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 border border-gray-200 dark:border-gray-600 rounded">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-900 dark:text-white">financial-data.xlsx</span>
                  </div>
                  <button className="w-full p-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500">
                    + Add attachment
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Create Team Modal */}
        {isCreateTeamModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingTeamId ? 'Edit Team' : 'Create New Team'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {editingTeamId ? 'Update team details and members' : 'Set up a new team for your audit project'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseTeamModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Team Details */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        Team Details
                      </h3>
                      
                      {/* Team Name */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Team Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={teamForm.name}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter team name..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Team Type */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Team Type
                        </label>
                        <div className="relative">
                          <select
                            value={teamForm.type}
                            onChange={(e) => setTeamForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white appearance-none"
                          >
                            {TEAM_TYPES.map(teamType => (
                              <option key={teamType.id} value={teamType.id}>
                                {teamType.id === 'audit' && '🔍'} 
                                {teamType.id === 'review' && '📋'} 
                                {teamType.id === 'management' && '👔'} 
                                {teamType.id === 'technical' && '⚙️'} 
                                {teamType.id === 'compliance' && '✅'} 
                                {' '}{teamType.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Team Owner */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Team Owner <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={teamForm.owner}
                            onChange={(e) => setTeamForm(prev => ({ ...prev, owner: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white appearance-none"
                          >
                            <option value="">Select team owner...</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.full_name} ({user.email})
                              </option>
                            ))}
                          </select>
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Selected Members Display - Ultra Compact */}
                      {teamForm.members.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              Selected Team Members ({teamForm.members.length})
                            </span>
                            <button
                              onClick={() => setTeamForm(prev => ({ ...prev, members: [] }))}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {teamForm.members.map((memberId) => {
                              const user = users.find(u => u.id === memberId);
                              if (!user) return null;
                              return (
                                <div
                                  key={user.id}
                                  className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-2.5 py-1 text-xs group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                                >
                                  <div className="w-4 h-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {user.full_name.charAt(0)}
                                  </div>
                                  <span className="text-gray-900 dark:text-white font-medium max-w-20 truncate" title={user.full_name}>
                                    {user.full_name.split(' ')[0]}
                                  </span>
                                  <button
                                    onClick={() => handleTeamMemberToggle(user.id)}
                                    className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Team Members */}
                  <div className="space-y-6">

                    {/* Team Members Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          Add Team Members
                        </h3>
                        {getFilteredUsersForTeam().length > 0 && (
                          <button
                            onClick={handleSelectAll}
                            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                          >
                            {getFilteredUsersForTeam().every(user => teamForm.members.includes(user.id)) ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                      </div>
                      
                      {/* Search and Filter Bar */}
                      <div className="space-y-3 mb-4">
                        {/* Search Members */}
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={teamMemberSearch}
                            onChange={(e) => {
                              setTeamMemberSearch(e.target.value);
                              setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Search by name, email, or department..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        {/* Department Filter */}
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <select
                            value={selectedDepartment}
                            onChange={(e) => {
                              setSelectedDepartment(e.target.value);
                              setCurrentPage(1); // Reset to first page on filter change
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="all">All Departments</option>
                            {getUniqueDepartments().map((dept) => (
                              <option key={dept} value={dept}>
                                {dept} ({users.filter(u => (u.department || 'No Department') === dept).length})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Members List with Pagination */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        {getPaginatedUsers().users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {user.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.full_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {user.department || 'No Department'} • {user.title || 'No Title'}
                                </p>
                              </div>
                            </div>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={teamForm.members.includes(user.id)}
                                onChange={() => handleTeamMemberToggle(user.id)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              />
                            </label>
                          </div>
                        ))}
                        
                        {getPaginatedUsers().users.length === 0 && (
                          <div className="p-8 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              No users found
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pagination Controls */}
                      {getPaginatedUsers().totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, getPaginatedUsers().totalUsers)} of {getPaginatedUsers().totalUsers} users
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, getPaginatedUsers().totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                      currentPage === pageNum
                                        ? 'bg-primary-600 text-white'
                                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              {getPaginatedUsers().totalPages > 5 && (
                                <>
                                  <span className="text-gray-400">...</span>
                                  <button
                                    onClick={() => setCurrentPage(getPaginatedUsers().totalPages)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                      currentPage === getPaginatedUsers().totalPages
                                        ? 'bg-primary-600 text-white'
                                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {getPaginatedUsers().totalPages}
                                  </button>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(getPaginatedUsers().totalPages, prev + 1))}
                              disabled={currentPage === getPaginatedUsers().totalPages}
                              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Stats */}
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white">{users.length}</div>
                            <div className="text-gray-600 dark:text-gray-400">Total Users</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white">{getPaginatedUsers().totalUsers}</div>
                            <div className="text-gray-600 dark:text-gray-400">Filtered Results</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-primary-600 dark:text-primary-400">{teamForm.members.length}</div>
                            <div className="text-gray-600 dark:text-gray-400">Selected Members</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleCloseTeamModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={isTeamLoading === editingTeamId}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isTeamLoading === editingTeamId && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {editingTeamId ? 'Update Team' : 'Create Team'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDetails; 