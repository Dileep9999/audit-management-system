import React from 'react';
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
  AlertCircle
} from 'lucide-react';

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

interface TemplatePreviewProps {
  template: ChecklistTemplate;
  onBack: () => void;
  onEdit: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onBack, onEdit }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
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
                <p className="text-gray-600 dark:text-gray-400">Template Preview</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
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
                  onClick={onEdit}
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
          {/* Main Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Form Preview
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This is how the form will appear to users when they fill out a checklist based on this template.
                </p>
              </div>
              
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Settings className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Template Preview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Form preview will be displayed here based on the template fields
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Info Sidebar */}
          <div className="space-y-6">
            {/* Template Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Template Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{template.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white">{template.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                  <p className="text-gray-900 dark:text-white">{template.category || 'Uncategorized'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {template.is_active ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-400 text-sm">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Inactive</span>
                      </div>
                    )}
                    {template.is_frozen && (
                      <div className="flex items-center gap-1 ml-3">
                        <Lock className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600 dark:text-orange-400 text-sm">Frozen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Usage Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Fields</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{template.fields_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Times Used</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{template.usage_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created By</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{template.created_by.full_name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {template.frozen_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frozen</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(template.frozen_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
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
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
                
                {template.can_edit && (
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="font-medium">
                        {template.is_frozen ? 'Unfreeze Template' : 'Freeze Template'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {template.is_frozen ? 'Allow modifications' : 'Lock from changes'}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview; 