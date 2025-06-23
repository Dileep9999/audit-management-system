import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createAudit, getUsers, getWorkflows } from '../../utils/api_service';
import { X } from 'lucide-react';

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

export default function CreateAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      assigned_users: []
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [usersData, workflowsData] = await Promise.all([
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

      console.log('Loaded users:', processedUsers);
      console.log('Loaded workflows:', workflowsData);

      setUsers(processedUsers);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load users and workflows');
    } finally {
      setIsLoadingData(false);
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
    setIsLoading(true);
    try {
      console.log('Submitting audit data:', {
        ...data,
        assigned_users: selectedUsers.map(u => u.id),
        custom_audit_type: null
      });
      
      const result = await createAudit({
        ...data,
        assigned_users: selectedUsers.map(u => u.id),
        workflow: data.workflow,
        custom_audit_type: null // We're only using system audit types
        // Note: status will be automatically set by the backend based on workflow's initial state
      });
      
      console.log('Audit created successfully:', result);
      toast.success('Audit created successfully');
      navigate('/audits');
    } catch (error: any) {
      console.error('Error creating audit:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      let errorMessage = 'Failed to create audit';
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Audit</h1>
          <button
            onClick={() => navigate('/audits')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
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
                {workflows
                  .filter(w => w.status !== 'archived') // Exclude archived workflows
                  .sort((a, b) => {
                    // Sort active workflows first, then draft
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (b.status === 'active' && a.status !== 'active') return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} {workflow.status && `(${workflow.status})`} {workflow.description && `- ${workflow.description.substring(0, 50)}...`}
                  </option>
                ))}
              </select>
              {errors.workflow && <p className="mt-1 text-sm text-red-600">{errors.workflow.message}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The initial status will be set automatically based on the selected workflow
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
              {isLoading ? 'Creating...' : 'Create Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 