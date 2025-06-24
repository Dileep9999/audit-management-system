import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Target,
  Shield,
  Eye,
  Trash2,
  Edit,
  MoreHorizontal,
  Upload,
  Download,
  Settings,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAuditTasks, 
  getTaskTemplates, 
  createAuditTask, 
  updateAuditTask,
  deleteAuditTask, 
  getTaskSummary,
  getUsers
} from '../../utils/api_service';
import ProgressIndicator from '../../components/shared/ProgressIndicator';

interface AuditTask {
  id: number;
  task_name: string;
  description: string;
  assigned_to_name: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  control_area: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  completion_percentage: number;
  template_name: string;
  created_at: string;
  updated_at: string;
}

interface ChecklistTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  field_count: number;
  estimated_duration: number;
  usage_count: number;
  is_frozen: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface TaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

interface TaskSummary {
  progress: TaskProgress;
  breakdown: {
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_risk_level: Record<string, number>;
    overdue_count: number;
    recent_activity: AuditTask[];
  };
  total_tasks: number;
}

interface AuditTasksProps {
  auditId: number;
  auditTitle: string;
  onTaskCreated?: () => void;
}



// Priority colors - matching the existing design system
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Status colors - matching the existing design system
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'pending':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Risk level colors - matching the existing design system
const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};



// New Task Modal Component
const NewTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  templates: ChecklistTemplate[];
  users: User[];
  loading: boolean;
  onCreateTemplate: () => void;
}> = ({ isOpen, onClose, onSubmit, templates, users, loading, onCreateTemplate }) => {
  const [formData, setFormData] = useState({
    template_id: '',
    task_name: '',
    checklist_name: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    control_area: '',
    risk_level: 'medium'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        template_id: '',
        task_name: '',
        checklist_name: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
        control_area: '',
        risk_level: 'medium'
      });
      setSelectedTemplate(null);
    }
  }, [isOpen]);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    setSelectedTemplate(template || null);
    setFormData({
      ...formData,
      template_id: templateId,
      task_name: template?.name || '',
      checklist_name: template?.name || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.template_id || !formData.task_name) {
      toast.error('Please select a template and provide a task name');
      return;
    }
    
    // Convert template_id to integer and prepare submit data
    const submitData: any = {
      template_id: parseInt(formData.template_id),
      task_name: formData.task_name,
      checklist_name: formData.checklist_name,
      description: formData.description,
      due_date: formData.due_date,
      priority: formData.priority,
      control_area: formData.control_area,
      risk_level: formData.risk_level
    };
    
    // Add assigned_to if selected
    if (formData.assigned_to) {
      submitData.assigned_to = parseInt(formData.assigned_to);
    }
    
    // Remove empty string fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        delete submitData[key];
      }
    });
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 group"
              title="Close (Esc)"
            >
              <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
                  value={formData.template_id}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="flex-1 px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                  required
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.field_count} fields) - {template.category}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onCreateTemplate}
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
                          {selectedTemplate.field_count} fields
                        </span>
                        <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4" />
                          ~{selectedTemplate.estimated_duration} min
                        </span>
                        <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 px-3 py-1.5 rounded-lg">
                          <Target className="w-4 h-4" />
                          Used {selectedTemplate.usage_count} times
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  value={formData.task_name}
                  onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                  placeholder="Enter a descriptive task name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600 resize-none"
                  placeholder="Provide additional context or instructions for this task"
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set priority, risk level, and assignments</p>
                </div>
              </div>

              {/* Assigned To */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Assign To
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
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
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                  >
                    <option value="low">🟢 Low Risk</option>
                    <option value="medium">🟡 Medium Risk</option>
                    <option value="high">🟠 High Risk</option>
                    <option value="critical">🔴 Critical Risk</option>
                  </select>
                </div>
              </div>

              {/* Control Area */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Control Area
                </label>
                <input
                  type="text"
                  value={formData.control_area}
                  onChange={(e) => setFormData({ ...formData, control_area: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                  placeholder="e.g., Financial Controls, IT Security, Compliance, Operations"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all duration-200 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-600"
                />
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-8 -mb-8 px-8 py-6 rounded-b-2xl">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                All fields marked with <span className="text-red-500">*</span> are required
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 border border-transparent rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Task...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5" />
                      Create Task
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AuditTasks: React.FC<AuditTasksProps> = ({ auditId, auditTitle, onTaskCreated }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [navigatingToTemplate, setNavigatingToTemplate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Bulk actions state
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [auditId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, templatesData, summaryData, usersData] = await Promise.all([
        getAuditTasks(auditId),
        getTaskTemplates(auditId),
        getTaskSummary(auditId),
        getUsers()
      ]);
      
      setTasks(tasksData);
      setTemplates(templatesData);
      setTaskSummary(summaryData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load audit tasks');
      console.error('Error loading audit tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    console.log('Creating audit task with data:', taskData);
    setCreatingTask(true);
    try {
      const newTask = await createAuditTask(auditId, taskData);
      console.log('Task created successfully:', newTask);
      setTasks([...tasks, newTask]);
      setShowNewTaskModal(false);
      toast.success('Task created');
      
      // Reload summary to get updated stats
      const summaryData = await getTaskSummary(auditId);
      setTaskSummary(summaryData);
      
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      let errorMessage = 'Failed to create task';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteAuditTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
      
      // Reload summary
      const summaryData = await getTaskSummary(auditId);
      setTaskSummary(summaryData);
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };



  const handleOpenCreateTemplate = () => {
    console.log('handleOpenCreateTemplate called');
    setNavigatingToTemplate(true);
    // Navigate to the create template page with a return URL
    const returnUrl = `/audits/${auditId}`;
    const createTemplateUrl = `/templates/create?return_to=${encodeURIComponent(returnUrl)}`;
    
    console.log('Navigating to:', createTemplateUrl);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      navigate(createTemplateUrl);
    }, 100);
  };

  // Bulk action handlers
  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTasks(prev => 
      prev.length === allTaskIds.length ? [] : allTaskIds
    );
  };

  const handleBulkAssign = async (userId: number) => {
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateAuditTask(taskId, { assigned_to: userId })
        )
      );
      
      // Reload data
      await loadData();
      setSelectedTasks([]);
      setShowBulkActions(false);
      
      toast.success(`${selectedTasks.length} tasks assigned`);
    } catch (error) {
      console.error('Error assigning tasks:', error);
      toast.error('Failed to assign tasks');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPriority = async (priority: string) => {
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateAuditTask(taskId, { priority })
        )
      );
      
      // Reload data
      await loadData();
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks updated`);
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Failed to update task priorities');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return;
    
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteAuditTask(taskId))
      );
      
      // Update local state
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks deleted`);
      
      // Reload summary
      const summaryData = await getTaskSummary(auditId);
      setTaskSummary(summaryData);
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      toast.error('Failed to delete tasks');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.control_area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.task_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading audit tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      {taskSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Audit Tasks
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track progress of audit checklist tasks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCreateTemplate}
                disabled={navigatingToTemplate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {navigatingToTemplate ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {navigatingToTemplate ? 'Opening...' : 'New Template'}
              </button>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>
          
          {/* Enhanced Progress Indicators */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Linear Progress with Milestones */}
            <div className="lg:col-span-2">
              <ProgressIndicator
                value={taskSummary.progress.percentage}
                total={taskSummary.progress.total}
                completed={taskSummary.progress.completed}
                variant="linear"
                size="lg"
                label="Overall Progress"
                color="primary"
                gradient={true}
                showMilestones={true}
                milestones={[25, 50, 75]}
                status={
                  taskSummary.progress.percentage >= 90 ? 'ahead' :
                  taskSummary.progress.percentage >= 70 ? 'on-track' :
                  taskSummary.progress.percentage >= 50 ? 'at-risk' : 'behind'
                }
                animated={true}
                thickness="thick"
              />
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center">
              <ProgressIndicator
                value={taskSummary.progress.percentage}
                variant="circular"
                size="lg"
                label="Completion"
                color="success"
                gradient={true}
                animated={true}
                status={
                  taskSummary.progress.percentage >= 90 ? 'ahead' :
                  taskSummary.progress.percentage >= 70 ? 'on-track' :
                  taskSummary.progress.percentage >= 50 ? 'at-risk' : 'behind'
                }
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {taskSummary.total_tasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Tasks</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {taskSummary.breakdown.by_status.completed || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {taskSummary.breakdown.by_status.in_progress || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">In Progress</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {taskSummary.breakdown.overdue_count}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Overdue</div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedTasks.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedTasks([])}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bulk Assign */}
              <select
                onChange={(e) => e.target.value && handleBulkAssign(parseInt(e.target.value))}
                disabled={bulkActionLoading}
                className="px-3 py-2 text-sm border border-primary-300 dark:border-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                defaultValue=""
              >
                <option value="">Assign to...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username}
                  </option>
                ))}
              </select>

              {/* Bulk Priority */}
              <select
                onChange={(e) => e.target.value && handleBulkPriority(e.target.value)}
                disabled={bulkActionLoading}
                className="px-3 py-2 text-sm border border-primary-300 dark:border-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                defaultValue=""
              >
                <option value="">Set priority...</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Select All Checkbox */}
            {filteredTasks.length > 0 && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === filteredTasks.length}
                  onChange={handleSelectAllTasks}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  title="Select all tasks"
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Select all
                </label>
              </div>
            )}
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks by name, description, or control area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors min-w-[140px]"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 mb-6">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {tasks.length === 0 
                ? "Get started by creating your first audit task using checklist templates." 
                : "No tasks match your current filters. Try adjusting your search criteria."
              }
            </p>
            {tasks.length === 0 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleOpenCreateTemplate}
                  disabled={navigatingToTemplate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {navigatingToTemplate ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  {navigatingToTemplate ? 'Opening...' : 'Create Template'}
                </button>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create First Task
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Task Checkbox */}
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleSelectTask(task.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        onClick={() => navigate(`/audit-tasks/${task.id}/fill`)}
                        title="Click to fill checklist"
                      >
                        {task.task_name}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => navigate(`/audit-tasks/${task.id}/fill`)}
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Fill checklist"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Task metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assigned_to_name || 'Unassigned'}
                  </span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {task.control_area && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {task.control_area}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {task.template_name}
                  </span>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.task_status)}`}>
                  {task.task_status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(task.risk_level)}`}>
                  {task.risk_level.toUpperCase()} RISK
                </span>
              </div>

              {/* Enhanced Progress */}
              <div className="space-y-3">
                <ProgressIndicator
                  value={task.completion_percentage}
                  variant="linear"
                  size="md"
                  label="Task Progress"
                  color={
                    task.completion_percentage >= 90 ? 'success' :
                    task.completion_percentage >= 70 ? 'primary' :
                    task.completion_percentage >= 50 ? 'warning' : 'danger'
                  }
                  gradient={true}
                  animated={true}
                  thickness="medium"
                  status={
                    task.completion_percentage >= 90 ? 'ahead' :
                    task.completion_percentage >= 70 ? 'on-track' :
                    task.completion_percentage >= 50 ? 'at-risk' : 'behind'
                  }
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSubmit={handleCreateTask}
        templates={templates}
        users={users}
        loading={creatingTask}
        onCreateTemplate={handleOpenCreateTemplate}
      />


    </div>
  );
};

export default AuditTasks; 