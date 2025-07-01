import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Settings,
  Save,
  X,
  GripVertical,
  Type,
  Hash,
  Mail,
  Calendar,
  CheckSquare,
  List,
  Upload,
  Star,
  MoreHorizontal,
  ArrowLeft,
  Download,
  Share2,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import FieldDesigner from './FieldDesigner';
import TemplatePreview from '../../views/checklists/TemplatePreview';
import useTranslation from '../../hooks/useTranslation';
import {
  getChecklistTemplates,
  getChecklistTemplate,
  createChecklistTemplate,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  duplicateChecklistTemplate,
  freezeChecklistTemplate,
  unfreezeChecklistTemplate
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

interface ChecklistField {
  label: string;
  field_type: string;
  help_text: string;
  placeholder: string;
  is_required: boolean;
  is_readonly: boolean;
  default_value: string;
  options: string[];
  order: number;
  css_class: string;
  conditional_logic: any;
}

interface FieldType {
  value: string;
  label: string;
  icon: React.ComponentType;
  description: string;
}

const FIELD_TYPES: FieldType[] = [
  { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email address validation' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Boolean yes/no checkbox' },
  { value: 'select', label: 'Select', icon: List, description: 'Single selection dropdown' },
  { value: 'file', label: 'File Upload', icon: Upload, description: 'File attachment' },
  { value: 'rating', label: 'Rating', icon: Star, description: 'Rating scale (1-5)' }
];

const TemplateManager: React.FC = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    is_active: true
  });
  
  // Field designer state
  const [fields, setFields] = useState<ChecklistField[]>([]);
  const [draggedField, setDraggedField] = useState<ChecklistField | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  
  // UI state
  const [showFieldTypes, setShowFieldTypes] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templatesData = await getChecklistTemplates();
      setTemplates(templatesData);
    } catch (error) {
      toast.error(t('templates.messages.load_error'));
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateFields = async (templateId: number) => {
    try {
      const templateData = await getChecklistTemplate(templateId);
      if (templateData.fields) {
        setFields(templateData.fields);
      }
    } catch (error) {
      toast.error(t('templates.messages.load_error'));
      console.error('Error loading template fields:', error);
    }
  };

  const handleCreateTemplate = () => {
    navigate('/templates/create?return_to=/templates');
  };

  const handleEditTemplate = (template: ChecklistTemplate) => {
    if (!template.can_edit) {
      toast.error(t('templates.messages.cannot_edit'));
      return;
    }
    
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      is_active: template.is_active
    });
    
    // Load real template fields
    loadTemplateFields(template.id);
    setView('edit');
  };

  const handlePreviewTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setView('preview');
  };

  const handleDuplicateTemplate = async (template: ChecklistTemplate) => {
    try {
      await duplicateChecklistTemplate(template.id);
      await loadTemplates(); // Reload templates to get the updated list
      toast.success(t('templates.messages.duplicate_success'));
    } catch (error) {
      toast.error(t('templates.messages.duplicate_error'));
      console.error('Error duplicating template:', error);
    }
  };

  const handleDeleteTemplate = async (template: ChecklistTemplate) => {
    if (!confirm(t('templates.actions.confirm_delete'))) return;
    
    try {
      await deleteChecklistTemplate(template.id);
      await loadTemplates(); // Reload templates to get the updated list
      toast.success(t('templates.messages.delete_success'));
    } catch (error) {
      toast.error(t('templates.messages.delete_error'));
      console.error('Error deleting template:', error);
    }
  };

  const handleToggleFreeze = async (template: ChecklistTemplate) => {
    try {
      if (template.is_frozen) {
        await unfreezeChecklistTemplate(template.id);
        toast.success(t('templates.messages.unfreeze_success'));
      } else {
        await freezeChecklistTemplate(template.id);
        toast.success(t('templates.messages.freeze_success'));
      }
      await loadTemplates(); // Reload templates to get the updated list
    } catch (error) {
      toast.error(template.is_frozen ? t('templates.messages.unfreeze_error') : t('templates.messages.freeze_error'));
      console.error('Error updating template freeze status:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast.error(t('templates.form.name.required'));
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        ...templateForm,
        fields: fields.map((field, index) => ({ ...field, order: index + 1 }))
      };

      if (view === 'create') {
        await createChecklistTemplate(templateData);
        toast.success(t('templates.messages.create_success'));
      } else if (view === 'edit' && selectedTemplate) {
        await updateChecklistTemplate(selectedTemplate.id, templateData);
        toast.success(t('templates.messages.update_success'));
      }

      await loadTemplates(); // Reload templates to get the updated list
      setView('list');
    } catch (error) {
      toast.error(view === 'create' ? t('templates.messages.create_error') : t('templates.messages.update_error'));
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const addField = (fieldType: string) => {
    const fieldTypeInfo = FIELD_TYPES.find(ft => ft.value === fieldType)!;
    const newField: ChecklistField = {
      label: fieldTypeInfo.label,
      field_type: fieldType,
      help_text: '',
      placeholder: '',
      is_required: false,
      is_readonly: false,
      default_value: '',
      options: fieldType === 'select' || fieldType === 'multi_select' || fieldType === 'radio' ? ['Option 1', 'Option 2'] : [],
      order: fields.length + 1,
      css_class: '',
      conditional_logic: {}
    };
    
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length);
    setShowFieldTypes(false);
  };

  const updateField = (index: number, updates: Partial<ChecklistField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setFields(newFields);
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index];
    const duplicatedField = { ...fieldToDuplicate, order: fields.length + 1 };
    setFields([...fields, duplicatedField]);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('templates.loading')}</p>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('templates.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('templates.description')}
              </p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('templates.create')}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('templates.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors min-w-[140px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('templates.filter_by_category') : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    {template.is_frozen && (
                      <Lock className="w-4 h-4 text-orange-500" />
                    )}
                    {!template.is_active && (
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {t('templates.status.inactive')}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {template.description}
                  </p>
                </div>
                
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Template metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  {t('templates.list.fields')}: {template.fields_count}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {t('templates.list.usage')}: {template.usage_count}
                </span>
              </div>

              {/* Category badge */}
              {template.category && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('templates.actions.preview')}
                </button>
                
                {template.can_edit && (
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {t('templates.actions.edit')}
                  </button>
                )}
                
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={t('templates.actions.duplicate')}
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                {template.can_edit && (
                  <button
                    onClick={() => handleToggleFreeze(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={template.is_frozen ? t('templates.actions.unfreeze') : t('templates.actions.freeze')}
                  >
                    {template.is_frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteTemplate(template)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={t('templates.actions.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 mb-6">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('templates.no_templates')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {templates.length === 0 
                ? t('templates.empty_state.description')
                : t('templates.no_results.description')
              }
            </p>
            {templates.length === 0 && (
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                {t('templates.create_first')}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <FieldDesigner
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        fields={fields}
        setFields={setFields}
        selectedFieldIndex={selectedFieldIndex}
        setSelectedFieldIndex={setSelectedFieldIndex}
        onSave={handleSaveTemplate}
        onCancel={() => setView('list')}
        saving={saving}
        isEditing={view === 'edit'}
        fieldTypes={FIELD_TYPES}
      />
    );
  }

  if (view === 'preview' && selectedTemplate) {
    return (
      <TemplatePreview
        template={selectedTemplate}
        onBack={() => setView('list')}
        onEdit={() => handleEditTemplate(selectedTemplate)}
      />
    );
  }

  return null;
};

export default TemplateManager; 