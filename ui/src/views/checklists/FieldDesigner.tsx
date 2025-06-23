import React, { useState } from 'react';
import {
  Plus,
  Save,
  ArrowLeft,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Type,
  Hash,
  Mail,
  Calendar,
  CheckSquare,
  List,
  Upload,
  Star,
  X,
  Copy,
  Move,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChecklistField {
  id?: number;
  label: string;
  field_type: string;
  help_text: string;
  placeholder: string;
  is_required: boolean;
  is_readonly: boolean;
  default_value: string;
  options: string[];
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  order: number;
  css_class: string;
  conditional_logic: any;
}

interface TemplateForm {
  name: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface FieldType {
  value: string;
  label: string;
  icon: any;
  description: string;
}

interface FieldDesignerProps {
  templateForm: TemplateForm;
  setTemplateForm: (form: TemplateForm) => void;
  fields: ChecklistField[];
  setFields: (fields: ChecklistField[]) => void;
  selectedFieldIndex: number | null;
  setSelectedFieldIndex: (index: number | null) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
  fieldTypes: FieldType[];
}

const FieldDesigner: React.FC<FieldDesignerProps> = ({
  templateForm,
  setTemplateForm,
  fields,
  setFields,
  selectedFieldIndex,
  setSelectedFieldIndex,
  onSave,
  onCancel,
  saving,
  isEditing,
  fieldTypes
}) => {
  const [showFieldTypes, setShowFieldTypes] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addField = (fieldType: string) => {
    const fieldTypeInfo = fieldTypes.find(ft => ft.value === fieldType)!;
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
    if (confirm('Are you sure you want to delete this field?')) {
      setFields(fields.filter((_, i) => i !== index));
      if (selectedFieldIndex === index) {
        setSelectedFieldIndex(null);
      } else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
        setSelectedFieldIndex(selectedFieldIndex - 1);
      }
    }
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index];
    const duplicatedField = {
      ...fieldToDuplicate,
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fields.length + 1
    };
    setFields([...fields, duplicatedField]);
    setSelectedFieldIndex(fields.length);
  };

  const selectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Template Info & Field Types */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h2>
          </div>

          {/* Template Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the template purpose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Audit, Compliance, Inspection"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={templateForm.is_active}
                onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                Active template
              </label>
            </div>
          </div>
        </div>

        {/* Field Types */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add Fields</h3>
            <button
              onClick={() => setShowFieldTypes(!showFieldTypes)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map((fieldType) => {
              const IconComponent = fieldType.icon;
              return (
                <button
                  key={fieldType.value}
                  onClick={() => addField(fieldType.value)}
                  className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {fieldType.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {fieldType.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !templateForm.name.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Template
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center - Field List */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Form Fields</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fields.length} field{fields.length !== 1 ? 's' : ''} • Drag to reorder
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {fields.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <Settings className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No fields added yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start building your form by adding fields from the sidebar
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedFieldIndex === index
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => setSelectedFieldIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Type className="w-4 h-4" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {field.label}
                        </span>
                        {field.is_required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                        {field.is_readonly && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            Readonly
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {field.field_type.replace('_', ' ')}
                        {field.help_text && ` • ${field.help_text}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateField(index);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(index);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Field Configuration */}
      {selectedField && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Field Settings</h3>
              <button
                onClick={() => setSelectedFieldIndex(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Type className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedField.field_type.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Basic Properties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedField.label}
                onChange={(e) => updateField(selectedFieldIndex!, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Help Text
              </label>
              <input
                type="text"
                value={selectedField.help_text}
                onChange={(e) => updateField(selectedFieldIndex!, { help_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional guidance for users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={selectedField.placeholder}
                onChange={(e) => updateField(selectedFieldIndex!, { placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Placeholder text"
              />
            </div>

            {/* Validation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Validation</h4>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={selectedField.is_required}
                  onChange={(e) => updateField(selectedFieldIndex!, { is_required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_required" className="text-sm text-gray-700 dark:text-gray-300">
                  Required field
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_readonly"
                  checked={selectedField.is_readonly}
                  onChange={(e) => updateField(selectedFieldIndex!, { is_readonly: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_readonly" className="text-sm text-gray-700 dark:text-gray-300">
                  Read-only field
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDesigner; 