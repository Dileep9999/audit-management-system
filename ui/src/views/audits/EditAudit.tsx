import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getAudit, updateAudit } from '../../utils/api_service';

type AuditStatusType = 'planned' | 'in_progress' | 'completed' | 'closed';

interface AuditStatusConfig {
  color: string;
  display: string;
}

type AuditType = 'internal' | 'external' | 'compliance' | 'financial' | 'operational' | 'it' | 'performance';

interface AuditTypeConfig {
  id: AuditType;
  display: string;
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

// Static data for audit statuses
const AUDIT_STATUSES: Record<AuditStatusType, AuditStatusConfig> = {
  planned: { color: 'blue', display: 'Planned' },
  in_progress: { color: 'orange', display: 'In Progress' },
  completed: { color: 'green', display: 'Completed' },
  closed: { color: 'gray', display: 'Closed' }
};

interface FormData {
  title: string;
  audit_type: AuditType;
  scope: string;
  objectives: string;
  status: AuditStatusType;
  period_from: string;
  period_to: string;
}

export default function EditAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>();

  useEffect(() => {
    if (id) {
      loadAuditData();
    }
  }, [id]);

  const loadAuditData = async () => {
    if (!id) return;
    
    setIsLoadingData(true);
    try {
      const auditData = await getAudit(parseInt(id));
      
      // Reset form with loaded data
      reset({
        title: auditData.title,
        audit_type: auditData.audit_type,
        scope: auditData.scope,
        objectives: auditData.objectives,
        status: auditData.status,
        period_from: auditData.period_from,
        period_to: auditData.period_to
      });
    } catch (error: any) {
      console.error('Error loading audit data:', error);
      toast.error('Failed to load audit data');
      navigate('/audits');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      console.log('Updating audit data:', data);
      
      const result = await updateAudit(parseInt(id), {
        ...data,
        custom_audit_type: null // We're only using system audit types
      });
      
      console.log('Audit updated successfully:', result);
      toast.success('Audit updated successfully');
      navigate('/audits');
    } catch (error: any) {
      console.error('Error updating audit:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
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
      <div className="p-4 relative min-h-screen">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Audit</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center py-8">Loading audit data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Audit</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Audit Title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter audit title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Audit Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Audit Type
                </label>
                <select
                  {...register('audit_type', { required: 'Audit type is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Select an audit type</option>
                  {AUDIT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.display}
                    </option>
                  ))}
                </select>
                {errors.audit_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.audit_type.message}
                  </p>
                )}
              </div>

              {/* Audit Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {Object.entries(AUDIT_STATUSES).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.display}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Audit Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period From
                </label>
                <input
                  type="date"
                  {...register('period_from', { required: 'Start date is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.period_from && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.period_from.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period To
                </label>
                <input
                  type="date"
                  {...register('period_to', { required: 'End date is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.period_to && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.period_to.message}
                  </p>
                )}
              </div>

              {/* Audit Scope */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scope
                </label>
                <textarea
                  {...register('scope', { required: 'Scope is required' })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Define the scope of the audit"
                />
                {errors.scope && (
                  <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>
                )}
              </div>

              {/* Audit Objectives */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objectives
                </label>
                <textarea
                  {...register('objectives', { required: 'Objectives are required' })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Define the objectives of the audit"
                />
                {errors.objectives && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.objectives.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/audits')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Audit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 