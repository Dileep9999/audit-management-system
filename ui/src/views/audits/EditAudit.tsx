import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getAudit, updateAudit, getUsers, getWorkflows, getAvailableTransitions, transitionAuditStatus } from '../../utils/api_service';
import { X, ArrowRight } from 'lucide-react';

type AuditType = 'internal' | 'external' | 'compliance' | 'financial' | 'operational' | 'it' | 'performance';

interface AuditTypeConfig {
  id: AuditType;
  display: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface AuditData {
  id: number;
  title: string;
  audit_type: AuditType;
  scope: string;
  objectives: string;
  status: string; // Now dynamic workflow state name
  period_from: string;
  period_to: string;
  assigned_users: number[];
  assigned_users_details?: User[];
  workflow: number;
  workflow_name?: string;
}

// Static data for audit types
const AUDIT_TYPES: AuditTypeConfig[] = [
  { id: 'internal', display: 'Internal' },
  { id: 'external', display: 'External' },
  { id: 'compliance', display: 'Compliance' },
  { id: 'financial', display: 'Financial' },
  { id: 'operational', display: 'Operational' },
  { id: 'it', display: 'IT' },
  { id: 'performance', display: 'Performance' }
];

interface FormData {
  title: string;
  audit_type: AuditType;
  scope: string;
  objectives: string;
  period_from: string;
  period_to: string;
  assigned_users: number[];
  workflow: number;
}

// Rich text editor modules
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'link', 'color', 'background'
];

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

export default function EditAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [availableTransitions, setAvailableTransitions] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<FormData>();

  useEffect(() => {
    if (id) {
      loadInitialData();
    }
  }, [id]);

  const loadInitialData = async () => {
    if (!id) return;
    
    setIsLoadingData(true);
    try {
      const [auditResponse, usersData, workflowsData] = await Promise.all([
        getAudit(parseInt(id)),
        getUsers(),
        getWorkflows()
      ]);

      // Process users data to ensure full_name is available
      const processedUsers = usersData.map((user: any) => ({
        ...user,
        full_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username
      }));

      setUsers(processedUsers);
      setWorkflows(workflowsData);
      setAuditData(auditResponse);

      // Set selected users from audit data
      if (auditResponse.assigned_users_details) {
        const assignedUsers = auditResponse.assigned_users_details.map((user: any) => ({
          ...user,
          full_name: user.full_name || user.username
        }));
        setSelectedUsers(assignedUsers);
      }
      
      // Reset form with loaded data
      reset({
        title: auditResponse.title,
        audit_type: auditResponse.audit_type,
        scope: auditResponse.scope,
        objectives: auditResponse.objectives,
        period_from: auditResponse.period_from,
        period_to: auditResponse.period_to,
        assigned_users: auditResponse.assigned_users || [],
        workflow: auditResponse.workflow || 0
      });

      // Load available transitions
      try {
        const transitionsResponse = await getAvailableTransitions(parseInt(id));
        setAvailableTransitions(transitionsResponse.data || []);
      } catch (error) {
        console.error('Error loading transitions:', error);
        setAvailableTransitions([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load audit data');
      navigate('/audits');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!id) return;
    
    setIsTransitioning(true);
    try {
      await transitionAuditStatus(parseInt(id), newStatus);
      toast.success(`Status changed to ${newStatus}`);
      
      // Reload data to get updated status and transitions
      await loadInitialData();
    } catch (error: any) {
      console.error('Error transitioning status:', error);
      let errorMessage = 'Failed to change status';
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const filteredUsers = users
    .filter(user => !selectedUsers.find(su => su.id === user.id))
    .filter(user => 
      userSearchTerm === '' || 
      user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    )
    .slice(0, Math.max(5, users.length)); // Show minimum 5 users

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
    setShowUserDropdown(true);
  };

  const handleUserSelectFromSearch = (user: User) => {
    handleUserSelect(user);
    setUserSearchTerm('');
    setShowUserDropdown(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      console.log('Updating audit data:', {
        ...data,
        assigned_users: selectedUsers.map(u => u.id),
        custom_audit_type: null
      });
      
      const result = await updateAudit(parseInt(id), {
        ...data,
        assigned_users: selectedUsers.map(u => u.id),
        workflow: data.workflow,
        custom_audit_type: null
        // Note: status is not updated here - use transition buttons instead
      });
      
      console.log('Audit updated successfully:', result);
      toast.success('Audit updated successfully');
      navigate('/audits');
    } catch (error: any) {
      console.error('Error updating audit:', error);
      
      let errorMessage = 'Failed to update audit';
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Audit</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reference: {auditData.id} | Workflow: {auditData.workflow_name || 'No Workflow'}
            </p>
          </div>
          <button
            onClick={() => navigate('/audits')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Status and Transitions */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusStyling.bgColor} ${statusStyling.textColor}`}>
                {auditData.status}
              </span>
            </div>
            {availableTransitions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Transitions</h3>
                <div className="flex gap-2">
                  {availableTransitions.map((transition) => (
                    <button
                      key={transition}
                      onClick={() => handleStatusTransition(transition)}
                      disabled={isTransitioning}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      {transition}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter audit title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Audit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audit Type *
              </label>
              <select
                {...register('audit_type', { required: 'Audit type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select audit type</option>
                {AUDIT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display}
                  </option>
                ))}
              </select>
              {errors.audit_type && <p className="mt-1 text-sm text-red-600">{errors.audit_type.message}</p>}
            </div>

            {/* Workflow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workflow *
              </label>
              <select
                {...register('workflow', { 
                  required: 'Workflow is required',
                  valueAsNumber: true 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select workflow</option>
                {workflows.filter(w => w.status === 'active').map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} {workflow.description && `- ${workflow.description.substring(0, 50)}...`}
                  </option>
                ))}
              </select>
              {errors.workflow && <p className="mt-1 text-sm text-red-600">{errors.workflow.message}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Changing workflow may affect available status transitions
              </p>
            </div>
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period From *
              </label>
              <input
                type="date"
                {...register('period_from', { required: 'Start date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.period_from && <p className="mt-1 text-sm text-red-600">{errors.period_from.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period To *
              </label>
              <input
                type="date"
                {...register('period_to', { required: 'End date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.period_to && <p className="mt-1 text-sm text-red-600">{errors.period_to.message}</p>}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scope *
            </label>
            <textarea
              {...register('scope', { required: 'Scope is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe the audit scope"
            />
            {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>}
          </div>

          {/* Objectives - Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objectives *
            </label>
            <Controller
              name="objectives"
              control={control}
              rules={{ required: 'Objectives are required' }}
              render={({ field }) => (
                <div className="border border-gray-300 rounded-md dark:border-gray-600">
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Describe the audit objectives..."
                    className="dark:text-white"
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>
              )}
            />
            {errors.objectives && <p className="mt-1 text-sm text-red-600">{errors.objectives.message}</p>}
          </div>

          {/* Assign Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Users
            </label>
            
            {/* Search Input with Autocomplete */}
            <div className="relative mb-4">
              <input
                type="text"
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                onFocus={() => setShowUserDropdown(true)}
                placeholder="Search users by name, email, or username..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              
              {/* Autocomplete Dropdown */}
              {showUserDropdown && userSearchTerm && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelectFromSearch(user)}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email} • {user.username}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Users ({selectedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {user.full_name}
                      <button
                        type="button"
                        onClick={() => handleUserRemove(user.id)}
                        className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/audits')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 