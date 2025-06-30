import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Move,
  Settings,
  FileText,
  Target,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getChecklistTemplate, updateChecklistTemplate } from '../../utils/api_service';

interface TemplateField {
  id?: number;
  label: string;
  field_type: string;
  is_required: boolean;
  help_text?: string;
  options?: any;
  order: number;
}

interface ChecklistTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_frozen: boolean;
  fields: TemplateField[];
  estimated_duration?: number;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'rating', label: 'Rating', icon: '⭐' }
];

const EditTemplate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    is_active: true,
    estimated_duration: 30
  });
  const [fields, setFields] = useState<TemplateField[]>([]);

  // Get return URL from query parameters
  const urlParams = new URLSearchParams(location.search);
  const returnTo = urlParams.get('return_to');

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    // Detect changes
    if (template) {
      const hasFormChanges = 
        formData.name !== template.name ||
        formData.description !== template.description ||
        formData.category !== template.category ||
        formData.is_active !== template.is_active ||
        formData.estimated_duration !== (template.estimated_duration || 30);
      
      const hasFieldChanges = JSON.stringify(fields) !== JSON.stringify(template.fields);
      setHasChanges(hasFormChanges || hasFieldChanges);
    }
  }, [formData, fields, template]);

  const loadTemplate = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const templateData = await getChecklistTemplate(parseInt(id));
      setTemplate(templateData);
      setFormData({
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category || '',
        is_active: templateData.is_active,
        estimated_duration: templateData.estimated_duration || 30
      });
      setFields(templateData.fields || []);
    } catch (error) {
      console.error('Error loading template:', error);
      setError('Failed to load template');
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(`/templates/${id}`);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        fields: fields
      };
      
      await updateChecklistTemplate(template.id, updateData);
      toast.success('Template updated successfully');
      setHasChanges(false);
      
      // Navigate back or to view page
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(`/templates/${id}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField: TemplateField = {
      label: `Field ${fields.length + 1}`,
      field_type: 'text',
      is_required: false,
      help_text: '',
      order: fields.length
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    // Reorder remaining fields
    updatedFields.forEach((field, i) => {
      field.order = i;
    });
    setFields(updatedFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order values
    newFields.forEach((field, i) => {
      field.order = i;
    });
    
    setFields(newFields);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Template Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'The requested template could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (template.is_frozen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-500 mb-4">
            <Settings className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Template is Frozen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This template cannot be edited because it has been frozen.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Template
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{template.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Template Information
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter template name..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the purpose of this template..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Security, Compliance..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 30 })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Template is active and available for use
                  </label>
                </div>
              </div>
            </div>

            {/* Template Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Template Fields
                    </h2>
                  </div>
                  <button
                    onClick={addField}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {fields.length > 0 ? (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Field Label
                                </label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Field Type
                                </label>
                                <select
                                  value={field.field_type}
                                  onChange={(e) => updateField(index, { field_type: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                >
                                  {fieldTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.icon} {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Help Text
                              </label>
                              <input
                                type="text"
                                value={field.help_text || ''}
                                onChange={(e) => updateField(index, { help_text: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Optional help text for users..."
                              />
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`required-${index}`}
                                checked={field.is_required}
                                onChange={(e) => updateField(index, { is_required: e.target.checked })}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Required field
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => moveField(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Move className="w-4 h-4 rotate-90" />
                            </button>
                            <button
                              onClick={() => moveField(index, 'down')}
                              disabled={index === fields.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Move className="w-4 h-4 -rotate-90" />
                            </button>
                            <button
                              onClick={() => removeField(index)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Target className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Fields Added
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add fields to define what information users will need to provide.
                    </p>
                    <button
                      onClick={addField}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Add Your First Field
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Save Status
              </h3>
              
              <div className="space-y-3">
                {hasChanges ? (
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Unsaved Changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">All Changes Saved</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Field Types Guide
              </h3>
              
              <div className="space-y-2 text-sm">
                <div><strong>Text Input:</strong> Single line text</div>
                <div><strong>Long Text:</strong> Multi-line text area</div>
                <div><strong>Number:</strong> Numeric input only</div>
                <div><strong>Date:</strong> Date picker</div>
                <div><strong>Checkbox:</strong> Yes/No options</div>
                <div><strong>Radio:</strong> Choose one option</div>
                <div><strong>Dropdown:</strong> Select from list</div>
                <div><strong>File Upload:</strong> Attach documents</div>
                <div><strong>Rating:</strong> Star rating system</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate; 