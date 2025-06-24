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
  EyeOff
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { getAudit, getWorkflows, getAvailableTransitions, transitionAuditStatus } from '../../utils/api_service';
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
    id: 'assignTo', 
    label: 'Collaborators', 
    icon: Users,
    description: 'Manage team access'
  },
  { 
    id: 'tasks', 
    label: 'Tasks', 
    icon: CheckSquare,
    description: 'Audit checklists and tasks'
  },
  // Checklist tab hidden - replaced by Tasks tab
  // { 
  //   id: 'checklist', 
  //   label: 'Checklist', 
  //   icon: CheckSquare,
  //   description: 'Legacy checklist (deprecated)'
  // },
];

const overviewTabs = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'modelAudit', label: 'Model Audit', icon: Brain },
  { id: 'controlSelection', label: 'Control Selection', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
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
  name: string;
  department: string;
  email: string;
  canRead: boolean;
  canWrite: boolean;
}

interface ChecklistItem {
  id: number;
  title: string;
  content: string;
  completed: boolean;
  assignedUsers: number[];
  isExpanded: boolean;
  searchQuery: string;
  status: 'Pending' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
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
  const [activeOverviewTab, setActiveOverviewTab] = useState('content');
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

  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', department: 'Finance', email: 'john@example.com', canRead: true, canWrite: true },
    { id: 2, name: 'Jane Smith', department: 'Compliance', email: 'jane@example.com', canRead: true, canWrite: false },
    { id: 3, name: 'Mike Johnson', department: 'IT', email: 'mike@example.com', canRead: true, canWrite: false },
    { id: 4, name: 'Sarah Wilson', department: 'Risk Management', email: 'sarah@example.com', canRead: false, canWrite: false },
  ]);

  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: 'Review Documentation',
      content: '',
      completed: false,
      assignedUsers: [1],
      isExpanded: false,
      searchQuery: '',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Check Compliance',
      content: '',
      completed: false,
      assignedUsers: [2],
      isExpanded: false,
      searchQuery: '',
      status: 'Pending'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchParams.get('sidebar') === 'open') {
      // Handle any specific URL parameters if needed
    }
    
    // Handle tab parameter for direct navigation to specific tabs
    const tabParam = searchParams.get('tab');
    if (tabParam && sidebarNavigation.some(nav => nav.id === tabParam)) {
      setActiveSideTab(tabParam);
    } else if (tabParam === 'checklist') {
      // Redirect checklist tab to tasks tab since checklist is hidden
      setActiveSideTab('tasks');
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isStatusDropdownOpen) {
          setIsStatusDropdownOpen(false);
        }
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  // Load audit data and workflow info
  useEffect(() => {
    if (id) {
      loadAuditData();
    }
  }, [id]);

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
        const transitionsResponse = await getAvailableTransitions(parseInt(id));
        setAvailableTransitions(transitionsResponse.data || []);
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

  const handleStatusTransition = async (newStatus: string) => {
    if (!id || !auditData) return;
    
    setIsTransitioning(true);
    try {
      await transitionAuditStatus(parseInt(id), newStatus);
      
      // Reload audit data to get updated status and transitions
      await loadAuditData();
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error transitioning status:', error);
      let errorMessage = 'Failed to update status';
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  const handleChecklistContentChange = (id: number, content: string) => {
    setChecklists(checklists.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const handleChecklistComplete = (id: number) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleChecklistExpand = (id: number) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleAddChecklist = () => {
    const newId = Math.max(...checklists.map(item => item.id), 0) + 1;
    setChecklists([...checklists, {
      id: newId,
      title: 'New Checklist Item',
      content: '',
      completed: false,
      assignedUsers: [],
      isExpanded: true,
      searchQuery: '',
      status: 'Pending'
    }]);
  };

  const handleAssignUser = (checklistId: number, userId: number) => {
    setChecklists(checklists.map(item => {
      if (item.id === checklistId) {
        const isAssigned = item.assignedUsers.includes(userId);
        return {
          ...item,
          assignedUsers: isAssigned 
            ? item.assignedUsers.filter(id => id !== userId)
            : [...item.assignedUsers, userId]
        };
      }
      return item;
    }));
  };

  const handleTitleChange = (id: number, title: string) => {
    setChecklists(checklists.map(item => 
      item.id === id ? { ...item, title } : item
    ));
  };

  const handleDeleteChecklist = (id: number) => {
    setChecklists(checklists.filter(item => item.id !== id));
  };

  const handleBulkAssign = () => {
    setChecklists(checklists.map(item => ({
      ...item,
      assignedUsers: [...new Set([...item.assignedUsers, ...selectedUsers])]
    })));
    setSelectedUsers([]);
    setIsAssignModalOpen(false);
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

  const handleStatusChange = (id: number, newStatus: ChecklistItem['status']) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
    setStatusDropdownId(null);
  };

  const renderOverviewTabContent = () => {
    switch (activeOverviewTab) {
      case 'content':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audit Content</h3>
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                className="bg-white dark:bg-gray-800"
                style={{ height: '400px', marginBottom: '50px' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                Publish
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reports</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports generated yet</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Generate your first audit report to get started.</p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        );
      case 'modelAudit':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Model Audit</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a model to begin audit</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Choose from available models to start the audit process.</p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Select Model
                </button>
              </div>
            </div>
          </div>
        );
      case 'controlSelection':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Control Selection</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No controls selected</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Select controls to include in your audit scope.</p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Select Controls
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit Settings</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">General Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Email notifications</label>
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Auto-save drafts</label>
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderChecklistContent = () => {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Checklist</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track progress and manage audit tasks</p>
          </div>
          <button
            onClick={handleAddChecklist}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
          {checklists.map((item) => {
            const statusOption = statusOptions.find(s => s.value === item.status);
            const assignedUserNames = item.assignedUsers.map(userId => 
              users.find(user => user.id === userId)?.name
            ).filter(Boolean);

            return (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleChecklistComplete(item.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.completed && <Check className="h-3 w-3" />}
                      </button>
                      
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleTitleChange(item.id, e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${
                          item.completed 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <div className="relative">
                        <button
                          onClick={() => setStatusDropdownId(statusDropdownId === item.id ? null : item.id)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${statusOption?.color}`}
                        >
                          {item.status}
                        </button>
                        
                        {statusDropdownId === item.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-32">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleStatusChange(item.id, option.value as ChecklistItem['status'])}
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {option.value}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Assigned Users */}
                      {assignedUserNames.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {assignedUserNames.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Expand/Collapse */}
                      <button
                        onClick={() => handleChecklistExpand(item.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {item.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteChecklist(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {item.isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={item.content}
                          onChange={(e) => handleChecklistContentChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          rows={3}
                          placeholder="Add a description for this task..."
                        />
                      </div>

                      {/* Assign Users */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Assign to users
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {users.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleAssignUser(item.id, user.id)}
                              className={`px-3 py-1 text-xs rounded-full border ${
                                item.assignedUsers.includes(user.id)
                                  ? 'bg-primary-100 text-primary-700 border-primary-300 dark:bg-primary-900 dark:text-primary-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {user.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {checklists.length === 0 && (
          <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No checklist items yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first checklist item to get started.</p>
            <button
              onClick={handleAddChecklist}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add First Task
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCollaboratorsContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage access</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Control who can view and edit this audit</p>
        </div>

        {/* Search and Add Users */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add collaborator
          </button>
        </div>

        {/* Users Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.canRead}
                          onChange={(e) => handlePermissionChange(user.id, 'read', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Read</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.canWrite}
                          onChange={(e) => handlePermissionChange(user.id, 'write', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Write</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activities */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Recent activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Jane Smith</strong> was granted read access
              </span>
              <span className="text-gray-400 text-xs">2 days ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Mike Johnson</strong> was granted read access
              </span>
              <span className="text-gray-400 text-xs">3 days ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>John Doe</strong> was granted write access
              </span>
              <span className="text-gray-400 text-xs">1 week ago</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSideTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Sub-navigation for Overview */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {overviewTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOverviewTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeOverviewTab === tab.id
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
            {renderOverviewTabContent()}
          </div>
        );
      case 'assignTo':
        return renderCollaboratorsContent();
      case 'tasks':
        return auditData ? (
          <AuditTasks 
            auditId={auditData.id} 
            auditTitle={auditData.title}
            onTaskCreated={() => {
              // Optionally refresh audit data to show updated task counts
              loadAuditData();
            }}
          />
        ) : null;
      // Checklist case removed - functionality moved to Tasks tab
      // case 'checklist':
      //   return renderChecklistContent();
      default:
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
          <div className="flex items-center justify-between h-14">
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
        </div>
      </div>

      <div className="px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-3">
          {/* Left Sidebar - GitHub style */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-0.5">
              {sidebarNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSideTab(item.id)}
                    className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded ${
                      activeSideTab === item.id
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
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
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
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
                  <button className="w-full text-left px-1.5 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
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
      </div>
    </div>
  );
};

export default AuditDetails; 