import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save,
  ArrowLeft,
  Plus,
  X,
  Upload as UploadIcon,
  Star,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import { 
  createChecklistTemplate,
  getFieldTypes 
} from '../../utils/api_service';

interface FieldType {
  value: string;
  label: string;
  icon: string;
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

const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to') || '/templates';
  const { t, isRTL } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'audit',
    is_active: true
  });

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadFieldTypes();
    addField();
  }, []);

  const loadFieldTypes = async () => {
    try {
      const response = await getFieldTypes();
      console.log('Field types response:', response);
      setFieldTypes(response.data || response);
    } catch (error) {
      console.error('Error loading field types:', error);
      // Set default field types if API fails
      setFieldTypes([
        { value: 'text', label: 'Text Input', icon: 'text' },
        { value: 'number', label: 'Number', icon: 'number' },
        { value: 'email', label: 'Email', icon: 'email' },
        { value: 'url', label: 'URL', icon: 'url' },
        { value: 'date', label: 'Date', icon: 'date' },
        { value: 'datetime', label: 'Date & Time', icon: 'datetime' },
        { value: 'textarea', label: 'Long Text', icon: 'textarea' },
        { value: 'checkbox', label: 'Checkbox', icon: 'checkbox' },
        { value: 'select', label: 'Dropdown', icon: 'select' },
        { value: 'multi_select', label: 'Multi Select', icon: 'multi_select' },
        { value: 'radio', label: 'Radio Buttons', icon: 'radio' },
        { value: 'file', label: 'File Upload', icon: 'file' },
        { value: 'rating', label: 'Rating', icon: 'rating' },
        { value: 'section', label: 'Section Header', icon: 'section' }
      ]);
    }
  };

  const addField = () => {
    try {
      if (fields.length >= 50) {
        toast.error('Maximum 50 fields allowed per template');
        return;
      }

      const newField: TemplateField = {
        id: Date.now().toString(),
        field_type: 'text',
        label: `Field ${fields.length + 1}`,
        placeholder: 'Enter value',
        required: false,
        options: [],
        validation_rules: {},
        help_text: '',
        width: 'full',
        order: fields.length
      };
      
      setFields([...fields, newField]);
      toast.success(`Field ${fields.length + 1} added successfully`);
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Failed to add field. Please try again.');
    }
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    try {
      setFields(fields.map(field => {
        if (field.id === fieldId) {
          const updatedField = { ...field, ...updates };
          
          if (updates.width && !['full', 'half', 'third'].includes(updates.width)) {
            toast.error('Invalid field width selected');
            return field;
          }
          
          if (updates.field_type && !['select', 'multi_select', 'radio'].includes(updates.field_type)) {
            updatedField.options = [];
          }
          
          return updatedField;
        }
        return field;
      }));

      if (updates.width) {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
          toast.success(`Field "${field.label}" width changed to ${getFieldWidthLabel(updates.width)}`);
        }
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Failed to update field. Please try again.');
    }
  };

  const removeField = (fieldId: string) => {
    if (fields.length <= 1) {
      toast.error('Template must have at least one field');
      return;
    }
    setFields(fields.filter(field => field.id !== fieldId));
    toast.success('Field removed successfully');
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = fields.findIndex(field => field.id === fieldId);
      if (currentIndex === -1) return;

      if (direction === 'up' && currentIndex === 0) return;
      if (direction === 'down' && currentIndex === fields.length - 1) return;

      const newFields = [...fields];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      [newFields[currentIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[currentIndex]];
      
      const reorderedFields = newFields.map((field, index) => ({
        ...field,
        order: index
      }));

      setFields(reorderedFields);
      toast.success(`Field moved ${direction}`);
    } catch (error) {
      console.error('Error moving field:', error);
      toast.error('Failed to move field. Please try again.');
    }
  };

  const getFieldWidthClass = (width: string) => {
    switch (width) {
      case 'half':
        return 'md:col-span-6';
      case 'third':
        return 'md:col-span-4';
      case 'full':
      default:
        return 'md:col-span-12';
    }
  };

  const getFieldWidthLabel = (width: string) => {
    switch (width) {
      case 'half':
        return 'Half (50%)';
      case 'third':
        return 'Third (33%)';
      case 'full':
      default:
        return 'Full (100%)';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    console.log('handleSubmit called', { e, formData, fields });
    
    if (e) {
      e.preventDefault();
    }
    
    if (!formData.name.trim()) {
      console.log('Validation failed: No template name');
      toast.error('Please provide a template name');
      return;
    }

    if (fields.length === 0) {
      console.log('Validation failed: No fields');
      toast.error('Please add at least one field');
      return;
    }

    for (const field of fields) {
      if (!field.label.trim()) {
        console.log('Validation failed: Field missing label', field);
        toast.error('All fields must have a label');
        return;
      }
      if (['select', 'multi_select', 'radio'].includes(field.field_type) && field.options.length === 0) {
        console.log('Validation failed: Select/radio field missing options', field);
        toast.error(`Field "${field.label}" must have at least one option`);
        return;
      }
    }

    console.log('All validations passed, creating template...');
    setLoading(true);
    try {
      const templateData = {
        ...formData,
        fields: fields.map((field, index) => ({
          field_type: field.field_type,
          label: field.label,
          placeholder: field.placeholder,
          is_required: field.required,
          options: field.options.filter(opt => opt.trim() !== ''),
          help_text: field.help_text,
          order: index
        }))
      };
      
      console.log('Creating template with data:', templateData);
      const result = await createChecklistTemplate(templateData);
      console.log('Template creation result:', result);
      toast.success('Template created successfully!');
      navigate(returnTo);
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(`Failed to create template: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{field.placeholder || 'Check this option'}</span>
          </div>
        );
      case 'select':
        return (
          <select className={baseClasses} disabled>
            <option value="">{field.placeholder || 'Select an option'}</option>
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
              <label key={index} className="flex items-center">
                <input type="radio" name={`preview-${field.id}`} disabled className="mr-2" />
                {option}
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <UploadIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
          </div>
        );
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-gray-300 cursor-pointer hover:text-yellow-400" />
            ))}
          </div>
        );
      case 'section':
        return (
          <div className="border-b border-gray-300 dark:border-gray-600 pb-2">
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

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(returnTo)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create Checklist Template
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Design a reusable checklist template with customizable field sizes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  previewMode
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
            </div>
          </div>
        </div>

        {previewMode ? (
          <div className="space-y-8">
            {/* Template Preview Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {formData.name || 'Untitled Template'}
                </h2>
                {formData.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {formData.description}
                  </p>
                )}
                <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 px-2 py-1 rounded-full">
                    {formData.category}
                  </span>
                  <span>{fields.length} fields</span>
                </div>
              </div>
            </div>

            {/* Preview Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Checklist Fields Preview
              </h3>
              
              {fields.length > 0 ? (
                <div className="grid grid-cols-12 gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className={`space-y-2 ${getFieldWidthClass(field.width)}`}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.help_text && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {field.help_text}
                        </p>
                      )}
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No fields added yet. Switch to Edit Mode to add fields.</p>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(returnTo)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim() || fields.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Template
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Template Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Template Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter template name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="audit">Audit</option>
                    <option value="compliance">Compliance</option>
                    <option value="assessment">Assessment</option>
                    <option value="review">Review</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of this template's purpose"
                />
              </div>
            </div>

            {/* Fields Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Template Fields ({fields.length}/50)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure field properties and adjust field widths
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>• Full width: 100% • Half width: 50% • Third width: 33%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addField}
                  disabled={fields.length >= 50}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Field {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          {getFieldWidthLabel(field.width)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove field"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Field Type
                        </label>
                        <select
                          value={field.field_type}
                          onChange={(e) => updateField(field.id, { 
                            field_type: e.target.value,
                            options: ['select', 'multi_select', 'radio'].includes(e.target.value) ? ['Option 1'] : []
                          })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="text">Text Input</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="url">URL</option>
                          <option value="date">Date</option>
                          <option value="datetime">Date & Time</option>
                          <option value="textarea">Long Text</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="select">Dropdown</option>
                          <option value="multi_select">Multi Select</option>
                          <option value="radio">Radio Buttons</option>
                          <option value="file">File Upload</option>
                          <option value="rating">Rating</option>
                          <option value="section">Section Header</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Field label"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Field Width
                        </label>
                        <select
                          value={field.width}
                          onChange={(e) => updateField(field.id, { width: e.target.value as 'full' | 'half' | 'third' })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="full">Full Width (100%)</option>
                          <option value="half">Half Width (50%)</option>
                          <option value="third">Third Width (33%)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Placeholder text"
                      />
                    </div>

                    {['select', 'multi_select', 'radio'].includes(field.field_type) && (
                      <div className="mt-4 space-y-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Options
                        </label>
                        <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...field.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = field.options.filter((_, index) => index !== optionIndex);
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => updateField(field.id, { options: [...field.options, ''] })}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Required field</span>
                      </label>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No fields added yet. Click "Add Field" to get started.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(returnTo)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Template
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTemplate; 