import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Copy,
  Share2,
  Download,
  Lock,
  Unlock,
  Settings,
  Calendar,
  User,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Eye,
  FileText,
  Upload as UploadIcon,
  Layers,
  Grid,
  List,
  Zap,
  Heart,
  BookOpen,
  Activity,
  TrendingUp,
  Shield,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import { 
  getChecklistTemplate,
  freezeChecklistTemplate,
  unfreezeChecklistTemplate,
  exportChecklist,
  duplicateChecklistTemplate,
  createChecklist
} from '../../utils/api_service';

interface ChecklistTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_frozen: boolean;
  created_by: {
    id: number;
    username: string;
    full_name: string;
  };
  frozen_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  frozen_at?: string;
  usage_count: number;
  fields_count: number;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
}

interface TemplateField {
  id: string;
  field_type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  validation_rules: any;
  help_text?: string;
  width: 'full' | 'half' | 'third';
  order: number;
}

interface TemplatePreviewProps {
  template: ChecklistTemplate;
  onBack: () => void;
  onEdit: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onBack, onEdit }) => {
  const { t, isRTL } = useTranslation();
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'form' | 'fields'>('form');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTemplateFields();
  }, [template.id]);

  const loadTemplateFields = async () => {
    try {
      setLoading(true);
      const templateData = await getChecklistTemplate(template.id);
      setFields(templateData.fields || []);
    } catch (error) {
      console.error('Error loading template fields:', error);
      toast.error(t('templates.messages.load_error'));
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const getFieldWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'md:col-span-6';
      case 'third': return 'md:col-span-4';
      case 'full':
      default: return 'md:col-span-12';
    }
  };

  const renderFieldPreview = (field: TemplateField) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white";
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={field.field_type}
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className={baseClasses}
            disabled
          />
        );
      case 'datetime':
        return (
          <input
            type="datetime-local"
            className={baseClasses}
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={3}
            className={baseClasses}
            disabled
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" disabled className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{field.placeholder || t('templates.field_types.checkbox.placeholder')}</span>
          </div>
        );
      case 'select':
        return (
          <select className={baseClasses} disabled>
            <option value="">{field.placeholder || t('templates.field_types.select.placeholder')}</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multi_select':
        return (
          <select className={baseClasses} multiple disabled size={Math.min(field.options.length, 4)}>
            {field.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="radio" name={`preview-${field.id}`} disabled className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <UploadIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('templates.field_types.file.upload_text')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('templates.field_types.file.allowed_types')}</p>
          </div>
        );
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
            ))}
          </div>
        );
      case 'section':
        return (
          <div className="border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{field.label}</h3>
            {field.help_text && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{field.help_text}</p>
            )}
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
          />
        );
    }
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'email': return '📧';
      case 'url': return '🔗';
      case 'date': return '📅';
      case 'datetime': return '⏰';
      case 'textarea': return '📄';
      case 'checkbox': return '☑️';
      case 'select': return '📋';
      case 'multi_select': return '📝';
      case 'radio': return '🔘';
      case 'file': return '📁';
      case 'rating': return '⭐';
      case 'section': return '📋';
      default: return '❓';
    }
  };

  const handleToggleFreeze = async () => {
    if (!template.can_edit) {
      toast.error('You do not have permission to freeze/unfreeze this template');
      return;
    }

    try {
      setIsProcessing(true);
      if (template.is_frozen) {
        await unfreezeChecklistTemplate(template.id);
        toast.success(t('templates.messages.unfreeze_success'));
      } else {
        await freezeChecklistTemplate(template.id);
        toast.success(t('templates.messages.freeze_success'));
      }
      // Refresh template data
      await loadTemplateFields();
    } catch (error) {
      console.error('Error toggling template freeze status:', error);
      toast.error(template.is_frozen ? t('templates.messages.unfreeze_error') : t('templates.messages.freeze_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async () => {
    if (!template.can_edit) {
      toast.error('You do not have permission to modify this template');
      return;
    }

    try {
      setIsProcessing(true);
      // Note: This functionality might need to be implemented in the backend
      toast.success('Template active status toggle functionality will be available soon');
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Failed to update template status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsProcessing(true);
      await duplicateChecklistTemplate(template.id);
      toast.success(t('templates.messages.duplicate_success'));
      // Refresh template data
      await loadTemplateFields();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error(t('templates.messages.duplicate_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const exportData = await exportChecklist(template.id);
      // Handle export data (e.g., download file)
      toast.success(t('templates.messages.export_success'));
    } catch (error) {
      console.error('Error exporting template:', error);
      toast.error(t('templates.messages.export_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateChecklist = async () => {
    try {
      setIsProcessing(true);
      await createChecklist(template.id);
      toast.success(t('templates.messages.create_checklist_success'));
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast.error(t('templates.messages.create_checklist_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{template.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {template.can_edit && (
                <button
                  onClick={onEdit}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t('templates.actions.edit')}
                </button>
              )}
              <button
                onClick={handleDuplicate}
                disabled={isProcessing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {t('templates.actions.duplicate')}
              </button>
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('templates.actions.export')}
              </button>
              <button
                onClick={handleToggleFreeze}
                disabled={isProcessing}
                className="btn btn-secondary flex items-center gap-2"
              >
                {template.is_frozen ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    {t('templates.actions.unfreeze')}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {t('templates.actions.freeze')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Template Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('templates.list.created_by')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.created_by.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('templates.list.created_at')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(template.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('templates.list.usage')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.usage_count} {t('templates.list.usage_times')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreviewMode('form')}
                  className={`btn ${previewMode === 'form' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Eye className="w-4 h-4" />
                  {t('templates.preview.form_view')}
                </button>
                <button
                  onClick={() => setPreviewMode('fields')}
                  className={`btn ${previewMode === 'fields' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <List className="w-4 h-4" />
                  {t('templates.preview.field_view')}
                </button>
              </div>
              <button
                onClick={handleCreateChecklist}
                disabled={isProcessing}
                className="btn btn-primary flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t('templates.actions.create_checklist')}
              </button>
            </div>

            {/* Fields Preview */}
            {previewMode === 'form' ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-12 gap-6">
                  {fields.map((field) => (
                    <div key={field.id} className={`col-span-12 ${getFieldWidthClass(field.width)}`}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ms-1">*</span>}
                      </label>
                      {field.help_text && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{field.help_text}</p>
                      )}
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getFieldTypeIcon(field.field_type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{field.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`templates.field_types.${field.field_type}.label`)}
                        </p>
                      </div>
                    </div>
                    {field.help_text && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{field.help_text}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {field.required && (
                        <span className="badge badge-red">{t('templates.field_form.is_required.label')}</span>
                      )}
                      {field.width !== 'full' && (
                        <span className="badge badge-blue">
                          {t(`templates.field_form.width.${field.width}`)}
                        </span>
                      )}
                      {(field.field_type === 'select' || field.field_type === 'multi_select' || field.field_type === 'radio') && (
                        <span className="badge badge-green">
                          {field.options.length} {t('templates.field_form.options.count')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview; 