import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface WorkflowFormData {
  name: string;
  status: 'draft' | 'active' | 'archived';
}

interface WorkflowFormProps {
  mode: 'create' | 'edit';
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useTranslation();
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    status: 'draft'
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      // In a real app, fetch workflow data from API
      setFormData({
        name: 'Sample Workflow',
        status: 'draft'
      });
    }
  }, [mode, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save to API
    console.log('Saving workflow:', formData);
    navigate('/admins/workflows');
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admins/workflows')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title={t('workflows.actions.back', 'Back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {t(
            mode === 'create' ? 'workflows.form.title.create' : 'workflows.form.title.edit',
            mode === 'create' ? 'Create Workflow' : 'Edit Workflow'
          )}
        </h1>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('workflows.form.name.label', 'Workflow Name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder={t('workflows.form.name.placeholder', 'Enter workflow name')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('workflows.form.status.label', 'Status')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkflowFormData['status'] })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="draft">{t('workflows.status.draft', 'Draft')}</option>
              <option value="active">{t('workflows.status.active', 'Active')}</option>
              <option value="archived">{t('workflows.status.archived', 'Archived')}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admins/workflows')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('workflows.actions.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Save className="h-4 w-4" />
              <span>{t('workflows.actions.save', 'Save Workflow')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowForm; 