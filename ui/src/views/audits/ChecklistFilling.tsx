import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  Target, 
  Shield, 
  FileText,
  AlertCircle,
  Upload,
  X,
  Plus,
  Star,
  Paperclip,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAuditTask, 
  getChecklistResponses, 
  submitFieldResponse, 
  updateChecklistResponses,
  changeChecklistStatus,
  getTaskEvidence,
  addTaskEvidence
} from '../../utils/api_service';

interface AuditTask {
  id: number;
  audit_id: number;
  task_name: string;
  description: string;
  assigned_to_name: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  control_area: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  task_status: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  checklist: {
    id: number;
    name: string;
    description: string;
    status: string;
    total_fields: number;
    completed_fields: number;
    completion_percentage: number;
    template: {
      id: number;
      name: string;
      description: string;
      category: string;
      estimated_duration: number;
    };
  };
}

interface ChecklistField {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  help_text: string;
  order: number;
  options: string[];
  validation_rules: any;
  width: string;
}

interface ChecklistResponse {
  id: number;
  field: ChecklistField;
  value: any;
  is_completed: boolean;
  comments: string;
  responded_at: string | null;
  responded_by: {
    id: number;
    username: string;
    full_name: string;
  } | null;
  hasChanges?: boolean;
}

interface Evidence {
  id: number;
  title: string;
  description: string;
  file: string;
  file_url: string;
  evidence_type: string;
  collected_by_name: string;
  collected_at: string;
  is_verified: boolean;
  verified_by_name: string | null;
  verified_at: string | null;
  checklist_field: number | null;
}

const ChecklistFilling: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<AuditTask | null>(null);
  const [responses, setResponses] = useState<ChecklistResponse[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState<{ [key: number]: boolean }>({});
  const [activeField, setActiveField] = useState<number | null>(null);
  const [lastToastTime, setLastToastTime] = useState<number>(0);
  const [savingFields, setSavingFields] = useState<Set<number>>(new Set());
  const [recentlySavedFields, setRecentlySavedFields] = useState<Set<number>>(new Set());

  // Debounced toast function to prevent spam
  const showToast = (type: 'success' | 'error', message: string) => {
    const now = Date.now();
    if (now - lastToastTime > 1000) { // Only show toast if 1 second has passed
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      setLastToastTime(now);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [taskId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const taskData = await getAuditTask(parseInt(taskId!));
      setTask(taskData);
      
      // Get responses using checklist ID
      const checklistResponses = await getChecklistResponses(taskData.checklist.id);
      
      // Ensure all responses have proper value structure
      const normalizedResponses = checklistResponses.map((response: ChecklistResponse) => ({
        ...response,
        value: response.value || {},
        comments: response.comments || '',
        is_completed: response.is_completed || false
      }));
      
      setResponses(normalizedResponses);
      
      // Load evidence for this task
      const taskEvidence = await getTaskEvidence(taskData.id);
      setEvidence(taskEvidence);
      
    } catch (error) {
      console.error('Error loading checklist data:', error);
      showToast('error', 'Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldResponse = async (fieldId: number, value: any, isCompleted: boolean = false, comments: string = '', showCompletionToast: boolean = true) => {
    if (!task) return;

    try {
      const responseData = {
        value: value || {},
        is_completed: isCompleted,
        comments: comments || ''
      };

      await submitFieldResponse(task.checklist.id, fieldId, responseData);
      
      // Update local state
      setResponses(prev => prev.map(response => 
        response.field.id === fieldId 
          ? { 
              ...response, 
              value: value || {}, 
              is_completed: isCompleted, 
              comments: comments || '',
              responded_at: new Date().toISOString(),
              responded_by: { id: 1, username: 'current_user', full_name: 'Current User' }
            }
          : response
      ));

      // Reload task data to get updated progress
      const updatedTask = await getAuditTask(parseInt(taskId!));
      setTask(updatedTask);

      // Only show toast for completion status changes when explicitly requested
      if (isCompleted && showCompletionToast) {
        showToast('success', 'Field marked as complete');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      showToast('error', 'Failed to save response');
    }
  };

  const handleSaveAll = async () => {
    if (!task) {
      console.error('No task available for saving');
      return;
    }

    console.log('Starting save all process...');
    console.log('Current responses:', responses);

    // Only save responses that have changes
    const responsesToUpdate = responses
      .filter(response => response.hasChanges)
      .map(response => ({
        id: response.id,
        field_id: response.field.id,
        value: response.value || {},
        is_completed: response.is_completed,
        comments: response.comments || ''
      }));

    console.log('Responses to update:', responsesToUpdate);
    console.log('Number of responses with changes:', responsesToUpdate.length);

    if (responsesToUpdate.length === 0) {
      console.log('No changes to save, returning silently');
      return; // Silently return if no changes, don't show toast
    }

    setSaving(true);
    try {
      console.log('Calling updateChecklistResponses API...');
      console.log('Checklist ID:', task.checklist.id);
      console.log('Payload:', responsesToUpdate);

      const result = await updateChecklistResponses(task.checklist.id, responsesToUpdate);
      console.log('Save successful, result:', result);
      
      // Clear hasChanges flags for saved responses
      setResponses(prev => prev.map(r => 
        r.hasChanges ? { ...r, hasChanges: false } : r
      ));
      
      // Reload data
      console.log('Reloading data after save...');
      await loadData();
      
      // Show concise success message
      showToast('success', responsesToUpdate.length === 1 ? 'Changes saved' : `${responsesToUpdate.length} fields saved`);
    } catch (error: any) {
      console.error('Error saving all responses:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save responses';
      showToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitChecklist = async () => {
    if (!task) {
      console.error('No task available for submission');
      return;
    }

    console.log('Starting checklist submission...');
    console.log('Current task:', task);
    console.log('Current responses:', responses);

    // Check if all required fields are completed
    const incompleteRequired = responses.filter(r => r.field.is_required && !r.is_completed);
    console.log('Incomplete required fields:', incompleteRequired);
    
    // Debug: Show all required fields and their completion status
    const requiredFields = responses.filter(r => r.field.is_required);
    console.log('All required fields:', requiredFields.map(r => ({
      id: r.field.id,
      label: r.field.label,
      is_completed: r.is_completed,
      value: r.value
    })));
    
    // Debug: Show checklist completion stats
    console.log('Checklist completion stats:', {
      total_fields: task.checklist.total_fields,
      completed_fields: task.checklist.completed_fields,
      completion_percentage: task.checklist.completion_percentage
    });
    
    if (incompleteRequired.length > 0) {
      console.log(`Blocking submission: ${incompleteRequired.length} required fields incomplete`);
      showToast('error', `Please complete all required fields (${incompleteRequired.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      console.log('Calling changeChecklistStatus API...');
      console.log('Checklist ID:', task.checklist.id);
      console.log('New status: completed');

      const result = await changeChecklistStatus(task.checklist.id, 'completed');
      console.log('Status change successful, result:', result);
      
      // Reload data
      console.log('Reloading data after submission...');
      await loadData();
      
      showToast('success', 'Checklist completed!');
    } catch (error: any) {
      console.error('Error submitting checklist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to submit checklist';
      
      console.log('Final error message to show:', errorMessage);
      showToast('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidenceUpload = async (fieldId: number, file: File, title: string, description: string, evidenceType: string) => {
    if (!task) return;

    setUploadingEvidence(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      console.log('Starting evidence upload:', {
        taskId: task.id,
        fieldId: fieldId,
        fileName: file.name,
        fileSize: file.size,
        title,
        description,
        evidenceType
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('evidence_type', evidenceType);
      formData.append('checklist_field_id', fieldId.toString());

      console.log('FormData contents:', {
        file: file.name,
        title,
        description,
        evidence_type: evidenceType,
        checklist_field_id: fieldId
      });

      const newEvidence = await addTaskEvidence(task.id, formData);
      
      console.log('Evidence upload successful:', newEvidence);
      
      // Update evidence list
      setEvidence(prev => [...prev, newEvidence]);
      
      showToast('success', 'Evidence uploaded successfully');
      
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to upload evidence';
      showToast('error', errorMessage);
    } finally {
      setUploadingEvidence(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    try {
      // Note: We need to implement delete evidence API endpoint
      // For now, just remove from local state
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      showToast('success', 'Evidence removed');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      showToast('error', 'Failed to delete evidence');
    }
  };

  const EvidenceUploadSection: React.FC<{ fieldId: number }> = ({ fieldId }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({
      title: '',
      description: '',
      evidenceType: 'document'
    });

    // Filter evidence specific to this field
    const fieldEvidence = evidence.filter(e => e.checklist_field === fieldId);

    const handleFileUpload = async (file: File) => {
      if (!uploadForm.title.trim()) {
        showToast('error', 'Please enter a title for the evidence');
        return;
      }

      const enhancedTitle = uploadForm.title;
      const enhancedDescription = uploadForm.description;

      await handleEvidenceUpload(fieldId, file, enhancedTitle, enhancedDescription, uploadForm.evidenceType);
      
      // Reset form
      setUploadForm({ title: '', description: '', evidenceType: 'document' });
      setShowUpload(false);
    };

    return (
      <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Evidence ({fieldEvidence.length})
            </span>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showUpload ? 'Cancel' : 'Add Evidence'}
          </button>
        </div>

        {/* Evidence List */}
        {fieldEvidence.length > 0 && (
          <div className="space-y-2 mb-3">
            {fieldEvidence.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.evidence_type} • {new Date(item.collected_at).toLocaleDateString()}
                      {item.is_verified && <span className="ml-2 text-green-600">✓ Verified</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteEvidence(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Form */}
        {showUpload && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence Title *
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                placeholder="Enter evidence title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence Type
              </label>
              <select
                value={uploadForm.evidenceType}
                onChange={(e) => setUploadForm(prev => ({ ...prev, evidenceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
              >
                <option value="document">Document</option>
                <option value="screenshot">Screenshot</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="hidden"
                  id={`file-upload-${fieldId}`}
                  accept="*/*"
                />
                <label
                  htmlFor={`file-upload-${fieldId}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploadingEvidence[fieldId] ? (
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadingEvidence[fieldId] ? 'Uploading...' : 'Click to upload file'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFieldInput = (response: ChecklistResponse) => {
    const field = response.field;
    
    const updateValue = (newValue: any) => {
      setResponses(prev => prev.map(r => 
        r.id === response.id 
          ? { ...r, value: newValue, hasChanges: true }
          : r
      ));
    };

    const markAsChanged = () => {
      setResponses(prev => prev.map(r => 
        r.id === response.id 
          ? { ...r, hasChanges: true }
          : r
      ));
    };

    const baseInputClasses = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors";

    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={response.value?.text || ''}
            onChange={(e) => updateValue({ text: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={response.value?.text || ''}
            onChange={(e) => updateValue({ text: e.target.value })}
            onBlur={() => markAsChanged()}
            rows={4}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={response.value?.number || ''}
            onChange={(e) => updateValue({ number: parseFloat(e.target.value) || 0 })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={response.value?.email || ''}
            onChange={(e) => updateValue({ email: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={response.value?.date || ''}
            onChange={(e) => updateValue({ date: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={response.value?.datetime || ''}
            onChange={(e) => updateValue({ datetime: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={response.value?.selected || ''}
            onChange={(e) => updateValue({ selected: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`radio-${field.id}`}
                  value={option}
                  checked={response.value?.selected === option}
                  onChange={(e) => {
                    updateValue({ selected: e.target.value });
                    markAsChanged();
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        // Handle simple boolean checkbox for fields without options
        if (!field.options || field.options.length === 0) {
          return (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={response.value?.checked || false}
                onChange={(e) => {
                  updateValue({ checked: e.target.checked });
                  markAsChanged();
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
            </label>
          );
        }
        
        // Handle multiple checkboxes with options
        return (
          <div className="space-y-3">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response.value?.selected) && response.value.selected.includes(option)}
                  onChange={(e) => {
                    const currentSelected = Array.isArray(response.value?.selected) ? response.value.selected : [];
                    const newSelected = e.target.checked
                      ? [...currentSelected, option]
                      : currentSelected.filter((item: string) => item !== option);
                    const newValue = { selected: newSelected };
                    updateValue(newValue);
                    markAsChanged();
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response.value?.selected) && response.value.selected.includes(option)}
                  onChange={(e) => {
                    const currentSelected = Array.isArray(response.value?.selected) ? response.value.selected : [];
                    const newSelected = e.target.checked
                      ? [...currentSelected, option]
                      : currentSelected.filter((item: string) => item !== option);
                    const newValue = { selected: newSelected };
                    updateValue(newValue);
                    markAsChanged();
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`boolean-${field.id}`}
                checked={response.value?.boolean === true}
                onChange={() => {
                  updateValue({ boolean: true });
                  markAsChanged();
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`boolean-${field.id}`}
                checked={response.value?.boolean === false}
                onChange={() => {
                  updateValue({ boolean: false });
                  markAsChanged();
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">No</span>
            </label>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateValue({ file_name: file.name, file_size: file.size });
                  markAsChanged();
                }
              }}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
            />
            {response.value?.file_name && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uploaded: {response.value.file_name}
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  const newValue = { rating };
                  updateValue(newValue);
                  markAsChanged();
                }}
                className={`p-1 rounded transition-colors ${
                  (response.value?.rating || 0) >= rating
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {response.value?.rating || 0}/5
            </span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={response.value?.text || ''}
            onChange={(e) => updateValue({ text: e.target.value })}
            onBlur={() => markAsChanged()}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Task not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The audit task you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/audits')}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            Back to Audits
          </button>
        </div>
      </div>
    );
  }

  const completedFields = responses.filter(r => r.is_completed).length;
  const totalFields = responses.length;
  const progressPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const unsavedChanges = responses.filter(r => r.hasChanges).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/audits/${task.audit_id}?tab=tasks`)}
                className="mr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.task_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.checklist.template.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {responses.some(r => r.hasChanges) && (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={handleSubmitChecklist}
                disabled={submitting || task.checklist.status === 'completed'}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Complete Task'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Overview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Task Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {task.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskColor(task.risk_level)}`}>
                    {task.risk_level.charAt(0).toUpperCase() + task.risk_level.slice(1)} Risk
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.checklist.completed_fields} of {task.checklist.total_fields} fields completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.checklist.completion_percentage}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {Math.round(task.checklist.completion_percentage)}%
                  </span>
                </div>
              </div>

              {/* Task Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Target className="h-4 w-4 mr-2" />
                  <span>Control Area: {task.control_area || 'General'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Status: {task.task_status.charAt(0).toUpperCase() + task.task_status.slice(1)}</span>
                </div>
              </div>
            </div>

            {/* Checklist Fields */}
            <div className="space-y-6">
              {responses
                .sort((a, b) => a.field.order - b.field.order)
                .map((response) => (
                  <div
                    key={response.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow border-2 transition-all duration-200 ${
                      response.is_completed 
                        ? 'border-green-200 dark:border-green-800' 
                        : response.hasChanges 
                        ? 'border-yellow-200 dark:border-yellow-800' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="p-6">
                      {/* Field Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => {
                                const newCompleted = !response.is_completed;
                                handleFieldResponse(
                                  response.field.id, 
                                  response.value, 
                                  newCompleted, 
                                  response.comments,
                                  true
                                );
                              }}
                              className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                response.is_completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-400 dark:border-gray-600'
                              }`}
                            >
                              {response.is_completed && <CheckCircle className="h-4 w-4" />}
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {response.field.label}
                              {response.field.is_required && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            {response.hasChanges && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                                Unsaved
                              </span>
                            )}
                          </div>
                          {response.field.help_text && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {response.field.help_text}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Field {response.field.order}
                        </div>
                      </div>

                      {/* Field Input */}
                      <div className="mb-4">
                        {renderFieldInput(response)}
                      </div>

                      {/* Comments */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comments (Optional)
                        </label>
                        <textarea
                          value={response.comments}
                          onChange={(e) => {
                            setResponses(prev => prev.map(r => 
                              r.id === response.id 
                                ? { ...r, comments: e.target.value, hasChanges: true }
                                : r
                            ));
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Add any comments or notes for this field..."
                        />
                      </div>

                      {/* Evidence Upload */}
                      <EvidenceUploadSection fieldId={response.field.id} />

                      {/* Response Metadata */}
                      {response.responded_at && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {new Date(response.responded_at).toLocaleString()}
                            {response.responded_by && ` by ${response.responded_by.full_name || response.responded_by.username}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSaveAll}
                  disabled={saving || !responses.some(r => r.hasChanges)}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Progress
                </button>
                <button
                  onClick={handleSubmitChecklist}
                  disabled={submitting || task.checklist.status === 'completed'}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Task
                </button>
                <button
                  onClick={() => navigate(`/audits/${task.audit_id}`)}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Audit
                </button>
              </div>
            </div>

            {/* Evidence Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evidence</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Files:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{evidence.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Verified:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {evidence.filter(e => e.is_verified).length}
                  </span>
                </div>
                {evidence.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Evidence</h4>
                    <div className="space-y-2">
                      {evidence.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400 truncate">{item.title}</span>
                          {item.is_verified && (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(task.checklist.completion_percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.checklist.completion_percentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {task.checklist.completed_fields} fields
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {task.checklist.total_fields - task.checklist.completed_fields} fields
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistFilling; 