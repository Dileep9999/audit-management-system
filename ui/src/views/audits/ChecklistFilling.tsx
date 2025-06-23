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
          ? { ...r, value: newValue || {} }
          : r
      ));
    };

    const markAsChanged = () => {
      // Just mark that this field has been changed, don't save immediately
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
            onChange={(e) => {
              updateValue({ text: e.target.value });
              markAsChanged();
            }}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={response.value?.text || ''}
            onChange={(e) => {
              updateValue({ text: e.target.value });
              markAsChanged();
            }}
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
            onChange={(e) => {
              updateValue({ number: parseFloat(e.target.value) || 0 });
              markAsChanged();
            }}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={response.value?.email || ''}
            onChange={(e) => {
              updateValue({ email: e.target.value });
              markAsChanged();
            }}
            className={baseInputClasses}
            placeholder={field.help_text || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={response.value?.date || ''}
            onChange={(e) => {
              updateValue({ date: e.target.value });
              markAsChanged();
            }}
            className={baseInputClasses}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={response.value?.datetime || ''}
            onChange={(e) => {
              updateValue({ datetime: e.target.value });
              markAsChanged();
            }}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={response.value?.selected || ''}
            onChange={(e) => {
              updateValue({ selected: e.target.value });
              markAsChanged();
            }}
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
                  updateValue({ file: file.name, file_size: file.size });
                  markAsChanged();
                }
              }}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
            />
            {response.value?.file && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uploaded: {response.value.file}
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
            onChange={(e) => {
              updateValue({ text: e.target.value });
              markAsChanged();
            }}
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Task Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested audit task could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/audits/${task.audit_id}?tab=tasks`)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.task_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill out the checklist form and track your progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving || unsavedChanges === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : `Save All${unsavedChanges > 0 ? ` (${unsavedChanges})` : ''}`}
          </button>
          <button
            onClick={handleSubmitChecklist}
            disabled={submitting || task.checklist.status === 'completed'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {submitting ? 'Submitting...' : task.checklist.status === 'completed' ? 'Completed' : 'Submit Checklist'}
          </button>
        </div>
      </div>

      {/* Task Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Task Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {task.assigned_to_name || 'Unassigned'}
              </p>
            </div>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(task.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Control Area</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {task.control_area || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(task.risk_level)}`}>
                {task.risk_level.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Template</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {task.checklist.template.name}
              </p>
            </div>
          </div>
        </div>

        {task.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
            <p className="text-gray-900 dark:text-white">{task.description}</p>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progress
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>~{task.checklist.template.estimated_duration} min</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Completed Fields</span>
            <span className="font-semibold">{completedFields}/{totalFields}</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Checklist Form
        </h2>

        <div className="space-y-8">
          {responses.map((response, index) => (
            <div key={response.id} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {response.field.label}
                      {response.field.is_required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      {response.hasChanges && (
                        <span className="text-orange-500 ml-2 text-sm font-normal">• Unsaved changes</span>
                      )}
                      {recentlySavedFields.has(response.field.id) && (
                        <span className="text-green-500 ml-2 text-sm font-normal">✓ Saved</span>
                      )}
                    </h3>
                  </div>
                  
                  {response.field.help_text && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 mb-4">
                      {response.field.help_text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {response.hasChanges && (
                    <button
                      onClick={async () => {
                        if (savingFields.has(response.field.id)) return; // Prevent multiple clicks
                        
                        setSavingFields(prev => new Set(prev).add(response.field.id));
                        
                        try {
                          const currentResponse = responses.find(r => r.field.id === response.field.id);
                          const valueToSave = currentResponse?.value || response.value || {};
                          const commentsToSave = currentResponse?.comments || response.comments || '';
                          const completedStatus = currentResponse?.is_completed || response.is_completed || false;
                          
                          await handleFieldResponse(response.field.id, valueToSave, completedStatus, commentsToSave, false);
                          
                          // Remove hasChanges flag and show success state
                          setResponses(prev => prev.map(r => 
                            r.id === response.id 
                              ? { ...r, hasChanges: false }
                              : r
                          ));
                          
                          // Show brief success state
                          setRecentlySavedFields(prev => new Set(prev).add(response.field.id));
                          setTimeout(() => {
                            setRecentlySavedFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(response.field.id);
                              return newSet;
                            });
                          }, 2000); // Show success state for 2 seconds
                        } finally {
                          setSavingFields(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(response.field.id);
                            return newSet;
                          });
                        }
                      }}
                      disabled={savingFields.has(response.field.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save changes"
                    >
                      {savingFields.has(response.field.id) ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {savingFields.has(response.field.id) ? 'Saving...' : 'Save'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const newCompleted = !response.is_completed;
                      setResponses(prev => prev.map(r => 
                        r.id === response.id 
                          ? { ...r, is_completed: newCompleted }
                          : r
                      ));
                      handleFieldResponse(response.field.id, response.value, newCompleted, response.comments);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      response.is_completed
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                    }`}
                    title={response.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="ml-11 space-y-4">
                {/* Field Input */}
                <div>
                  {renderFieldInput(response)}
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={response.comments || ''}
                    onChange={(e) => {
                      setResponses(prev => prev.map(r => 
                        r.id === response.id 
                          ? { ...r, comments: e.target.value, hasChanges: true }
                          : r
                      ));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="Add any additional notes or comments..."
                  />
                </div>

                {/* Evidence Upload Section */}
                <EvidenceUploadSection fieldId={response.field.id} />

                {/* Response Metadata */}
                {response.responded_at && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(response.responded_at).toLocaleString()}
                    {response.responded_by && (
                      <span className="ml-2">
                        by {response.responded_by.full_name || response.responded_by.username}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Fields Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This checklist doesn't have any fields to fill out.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {responses.length > 0 && (
        <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{completedFields}</span> of{' '}
            <span className="font-medium">{totalFields}</span> fields completed
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving || unsavedChanges === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : `Save All${unsavedChanges > 0 ? ` (${unsavedChanges})` : ''}`}
            </button>
            
            <button
              onClick={handleSubmitChecklist}
              disabled={submitting || task.checklist.status === 'completed'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {submitting ? 'Submitting...' : task.checklist.status === 'completed' ? 'Completed' : 'Submit Checklist'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistFilling; 