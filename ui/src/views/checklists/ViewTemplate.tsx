import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  FileText,
  Target,
  Users,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getChecklistTemplate, duplicateChecklistTemplate } from '../../utils/api_service';

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
  fields?: any[];
  estimated_duration?: number;
}

const ViewTemplate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get return URL from query parameters
  const urlParams = new URLSearchParams(location.search);
  const returnTo = urlParams.get('return_to');

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const templateData = await getChecklistTemplate(parseInt(id));
      setTemplate(templateData);
    } catch (error) {
      console.error('Error loading template:', error);
      setError('Failed to load template');
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/templates');
    }
  };

  const handleEdit = () => {
    const editUrl = `/templates/${id}/edit`;
    if (returnTo) {
      navigate(`${editUrl}?return_to=${encodeURIComponent(returnTo)}`);
    } else {
      navigate(editUrl);
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;
    
    try {
      await duplicateChecklistTemplate(template.id);
      toast.success('Template duplicated successfully');
      // Refresh or redirect as needed
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
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
            <AlertCircle className="w-16 h-16 mx-auto" />
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {template.name}
                  </h1>
                  {template.is_frozen && (
                    <Lock className="w-4 h-4 text-orange-500" />
                  )}
                  {!template.is_active && (
                    <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      Inactive
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Template Details</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              {template.can_edit && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Template Overview
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {template.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <p className="text-gray-900 dark:text-white mt-1">{template.category || 'Uncategorized'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                    <p className="text-gray-900 dark:text-white mt-1">{template.created_by.full_name || template.created_by.username}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Template Fields
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Preview of all fields in this template
                </p>
              </div>
              
              <div className="p-6">
                {template.fields && template.fields.length > 0 ? (
                  <div className="space-y-4">
                    {template.fields.map((field, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {field.label}
                              {field.is_required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            {field.help_text && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {field.help_text}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                            {field.field_type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FileText className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Fields Defined
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This template doesn't have any fields yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Fields</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.fields_count || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Usage Count</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.usage_count || 0}
                  </span>
                </div>
                
                {template.estimated_duration && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Est. Duration</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.estimated_duration} min
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {template.is_active ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 dark:text-green-400 text-sm font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inactive</span>
                    </>
                  )}
                </div>
                
                {template.is_frozen && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                      Frozen
                    </span>
                  </div>
                )}
                
                {template.frozen_by && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Frozen by {template.frozen_by.full_name || template.frozen_by.username}
                    {template.frozen_at && (
                      <> on {new Date(template.frozen_at).toLocaleDateString()}</>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium">Use Template</div>
                    <div className="text-sm text-gray-500">Create new checklist from this template</div>
                  </div>
                </button>
                
                <button 
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Duplicate Template</div>
                    <div className="text-sm text-gray-500">Create a copy to modify</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Export Template</div>
                    <div className="text-sm text-gray-500">Download as JSON or PDF</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplate; 