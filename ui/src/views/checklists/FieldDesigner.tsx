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
import useTranslation from '../../hooks/useTranslation';

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
  const { t, isRTL } = useTranslation();
  const [showFieldTypes, setShowFieldTypes] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addField = (fieldType: string) => {
    const fieldTypeInfo = fieldTypes.find(ft => ft.value === fieldType)!;
    const newField: ChecklistField = {
      label: t(`templates.field_types.${fieldType}.label`),
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

  const updateField = (index: number | null, updates: Partial<ChecklistField>) => {
    if (index === null) return;
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    if (confirm(t('templates.field_form.confirm_delete'))) {
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
      label: `${fieldToDuplicate.label} (${t('common.copy')})`,
      order: fields.length + 1
    };
    setFields([...fields, duplicatedField]);
    setSelectedFieldIndex(fields.length);
  };

  const selectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Template Info & Field Types */}
      <div className={`w-80 bg-white dark:bg-gray-800 border-${isRTL ? 'l' : 'r'} border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? t('templates.form.edit_title') : t('templates.form.create_title')}
            </h2>
          </div>

          {/* Template Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('templates.form.name.label')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('templates.form.name.placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('templates.form.description.label')}
              </label>
              <textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('templates.form.description.placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('templates.form.category.label')}
              </label>
              <input
                type="text"
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('templates.form.category.placeholder')}
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
                {t('templates.form.status.label')}
              </label>
            </div>
          </div>
        </div>

        {/* Field Types */}
        <div className="flex-1 overflow-auto p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            {t('templates.field_types.title')}
          </h3>
          <div className="space-y-2">
            {fieldTypes.map((fieldType) => (
              <button
                key={fieldType.value}
                onClick={() => addField(fieldType.value)}
                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <fieldType.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{t(`templates.field_types.${fieldType.value}.label`)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t(`templates.field_types.${fieldType.value}.description`)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Field List */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('templates.form.fields.no_fields')}</p>
              <button
                onClick={() => setShowFieldTypes(true)}
                className="btn btn-primary"
              >
                {t('templates.form.fields.add_field')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                    selectedFieldIndex === index
                      ? 'border-primary-500 dark:border-primary-400'
                      : 'border-gray-200 dark:border-gray-700'
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedFieldIndex(index)}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== index) {
                      moveField(draggedIndex, index);
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {field.label}
                          </h3>
                          {field.is_required && (
                            <span className="text-red-500">*</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`templates.field_types.${field.field_type}.label`)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateField(index);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(index);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Field Properties */}
      {selectedField && (
        <div className={`w-80 bg-white dark:bg-gray-800 border-${isRTL ? 'r' : 'l'} border-gray-200 dark:border-gray-700 flex flex-col`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('templates.field_form.title')}
            </h2>
            {/* Field properties form */}
            <div className="space-y-4">
              {/* ... field properties form fields ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDesigner; 