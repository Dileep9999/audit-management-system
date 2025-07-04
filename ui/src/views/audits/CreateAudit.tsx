import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createAudit, getUsers, getWorkflows } from '../../utils/api_service';
import { X } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

type AuditType = 'internal' | 'external' | 'compliance' | 'financial' | 'operational' | 'it' | 'performance';

// Remove duplicate - using the one defined after imports

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

// Import audit types from API service
import { AUDIT_TYPES } from '../../utils/api_service';
type AuditTypeConfig = { id: string; display: string };

// Convert API audit types to component format
const AUDIT_TYPE_CONFIGS: AuditTypeConfig[] = AUDIT_TYPES.map(type => ({
  id: type.id,
  display: type.name
}));

interface FormData {
  title: string;
  audit_type: AuditType;
  audit_item: string;
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
  const { t } = useTranslation();

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
      
      let errorMessage = t('audits.errors.create_failed', 'Failed to create audit');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/audits')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-4"
              >
                <X className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('audits.create.title', 'Create New Audit')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Title - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('audits.form.title.label', 'Audit Title')} *
            </label>
            <input
              type="text"
              {...register('title', { required: t('audits.form.title.required', 'Title is required') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
              placeholder={t('audits.form.title.placeholder', 'Enter a descriptive audit title')}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          {/* Basic Information - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.type.label', 'Audit Type')} *
              </label>
              <select
                {...register('audit_type', { required: t('audits.form.type.required', 'Audit type is required') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('audits.form.type.placeholder', 'Select audit type')}</option>
                {AUDIT_TYPE_CONFIGS.map((type) => (
                  <option key={type.id} value={type.id}>
                    {t(`audits.types.${type.id}`, type.display)}
                  </option>
                ))}
              </select>
              {errors.audit_type && <p className="mt-1 text-sm text-red-600">{errors.audit_type.message}</p>}
            </div>

            {/* Workflow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.workflow.label', 'Workflow')} *
              </label>
              <select
                {...register('workflow', { 
                  required: t('audits.form.workflow.required', 'Workflow is required'),
                  valueAsNumber: true 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('audits.form.workflow.placeholder', 'Select workflow')}</option>
                {workflows
                  .filter(w => w.status !== 'archived')
                  .sort((a, b) => {
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (b.status === 'active' && a.status !== 'active') return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} {workflow.status === 'active' ? t('audits.form.workflow.active', '✓') : t('audits.form.workflow.draft', '(Draft)')}
                  </option>
                ))}
              </select>
              {errors.workflow && <p className="mt-1 text-sm text-red-600">{errors.workflow.message}</p>}
            </div>
          </div>

          {/* Audit Item - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('audits.form.item.label', 'Audit Item')}
            </label>
            <input
              type="text"
              {...register('audit_item')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('audits.form.item.placeholder', 'Specify the audit item or area (e.g., Financial Statements, IT Security Controls, Quality Management System)')}
            />
            {errors.audit_item && <p className="mt-1 text-sm text-red-600">{errors.audit_item.message}</p>}
          </div>

          {/* Period Information - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.period_from.label', 'Period From')} *
              </label>
              <input
                type="date"
                {...register('period_from', { required: t('audits.form.period_from.required', 'Start date is required') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.period_from && <p className="mt-1 text-sm text-red-600">{errors.period_from.message}</p>}
            </div>

            {/* Period To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.period_to.label', 'Period To')} *
              </label>
              <input
                type="date"
                {...register('period_to', { required: t('audits.form.period_to.required', 'End date is required') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.period_to && <p className="mt-1 text-sm text-red-600">{errors.period_to.message}</p>}
            </div>
          </div>

          {/* Scope and Objectives - Side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.scope.label', 'Scope')} *
              </label>
              <textarea
                {...register('scope', { required: t('audits.form.scope.required', 'Scope is required') })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('audits.form.scope.placeholder', 'Describe the audit scope')}
              />
              {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>}
            </div>

            {/* Objectives - Rich Text Editor */}
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('audits.form.objectives.label', 'Objectives')} *
            </label>
            <Controller
              name="objectives"
              control={control}
              rules={{ required: t('audits.form.objectives.required', 'Objectives are required') }}
              render={({ field }) => (
                <div className="border border-gray-300 rounded-md dark:border-gray-600">
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={t('audits.form.objectives.placeholder', 'Describe the audit objectives...')}
                    className="dark:text-white"
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>
              )}
            />
            {errors.objectives && <p className="mt-1 text-sm text-red-600">{errors.objectives.message}</p>}
            </div>
          </div>

          {/* Assign Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('audits.form.assign_users.label', 'Assign Users')}
            </label>
            
            {/* Search Input with Autocomplete */}
            <div className="relative mb-4">
              <input
                type="text"
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                onFocus={() => setShowUserDropdown(true)}
                placeholder={t('audits.form.assign_users.search_placeholder', 'Search users by name, email, or username...')}
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
                  {t('audits.form.assign_users.selected_label', 'Selected Users')} ({selectedUsers.length})
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
                        aria-label={t('audits.form.assign_users.remove_user', 'Remove user')}
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
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('audits.form.creating', 'Creating...') : t('audits.actions.create', 'Create Audit')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
} 