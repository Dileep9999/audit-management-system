import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getAudit, updateAudit, getUsers, getWorkflows, getAvailableTransitions, transitionAuditStatus } from '../../utils/api_service';
import { X, ArrowRight } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

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

// Import audit types from API service
import { AUDIT_TYPES } from '../../utils/api_service';

// Convert API audit types to component format
const AUDIT_TYPE_CONFIGS: AuditTypeConfig[] = AUDIT_TYPES.map(type => ({
  id: type.id,
  display: type.name
}));

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
  const { t } = useTranslation();

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
        const transitions = await getAvailableTransitions(parseInt(id));
        setAvailableTransitions(Array.isArray(transitions) ? transitions : []);
      } catch (error) {
        console.error('Error loading transitions:', error);
        setAvailableTransitions([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(t('audits.errors.load_failed', 'Failed to load audit data'));
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
      console.log(t('audits.logs.updating_data', 'Updating audit data:'), {
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
      toast.success(t('audits.messages.update_success', 'Audit updated successfully'));
      navigate('/audits');
    } catch (error: any) {
      console.error('Error updating audit:', error);
      
      let errorMessage = t('audits.errors.update_failed', 'Failed to update audit');
      if (error?.response?.data?.detail) {
        errorMessage = t('audits.errors.server_detail', error.response.data.detail);
      } else if (error?.response?.data?.message) {
        errorMessage = t('audits.errors.server_message', error.response.data.message);
      } else if (error?.message) {
        errorMessage = t('audits.errors.general', error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">{t('audits.errors.not_found', 'Audit not found')}</div>
      </div>
    );
  }

  const statusStyling = getStatusStyling(auditData.status);

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
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('audits.edit.title', 'Edit Audit')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('audits.edit.reference', 'Reference')}: {auditData.id} | {t('audits.edit.workflow', 'Workflow')}: {auditData.workflow_name || t('audits.edit.no_workflow', 'No Workflow')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">

        {/* Current Status and Transitions */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('audits.edit.current_status', 'Current Status')}</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusStyling.bgColor} ${statusStyling.textColor}`}>
                {t(`audits.status.${auditData.status.toLowerCase()}`, auditData.status)}
              </span>
            </div>
            {availableTransitions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('audits.edit.available_transitions', 'Available Transitions')}</h3>
                <div className="flex gap-2">
                  {availableTransitions.map((transition) => (
                    <button
                      key={transition}
                      onClick={() => handleStatusTransition(transition)}
                      disabled={isTransitioning}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      {t(`audits.transitions.${transition.toLowerCase()}`, transition)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
                {workflows.filter(w => w.status === 'active').map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} {t('audits.form.workflow.active', '✓')}
                  </option>
                ))}
              </select>
              {errors.workflow && <p className="mt-1 text-sm text-red-600">{errors.workflow.message}</p>}
            </div>
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

          {/* Content Areas Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.scope.label', 'Audit Scope')} *
              </label>
              <textarea
                {...register('scope', { required: t('audits.form.scope.required', 'Scope is required') })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder={t('audits.form.scope.placeholder', 'Define the scope and boundaries of this audit. Include areas, processes, systems, or departments to be covered...')}
              />
              {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>}
            </div>

            {/* Objectives - Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('audits.form.objectives.label', 'Audit Objectives')} *
              </label>
              <Controller
                name="objectives"
                control={control}
                rules={{ required: t('audits.form.objectives.required', 'Objectives are required') }}
                render={({ field }) => (
                  <div className="min-h-[156px] border border-gray-300 rounded-md dark:border-gray-600">
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder={t('audits.form.objectives.placeholder', 'Describe the main objectives and expected outcomes of this audit...')}
                      className="h-[126px] dark:text-white"
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
              {isLoading ? t('audits.form.updating', 'Updating...') : t('audits.actions.update', 'Update Audit')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
} 