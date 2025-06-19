import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { User, CheckSquare, Rocket, X, BookOpen, Users, CheckCircle, FileText } from 'lucide-react';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-lg ${
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    } ${className}`}
  >
    {label}
  </button>
);

const AuditDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeSideTab, setActiveSideTab] = useState('overview');
  const [activeOverviewTab, setActiveOverviewTab] = useState('content');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if sidebar should be opened from URL parameter
    if (searchParams.get('sidebar') === 'open') {
      setIsRightSidebarOpen(true);
    }
  }, [searchParams]);

  // Mock data - replace with actual data fetching
  const auditData = {
    id: parseInt(id || '0'),
    assignedTo: 'John Doe',
    checklist: [
      { id: 1, task: 'Initial Assessment', completed: true },
      { id: 2, task: 'Document Review', completed: false },
      { id: 3, task: 'Stakeholder Interviews', completed: false },
    ]
  };

  const sideTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignTo', label: 'Assign To' },
    { id: 'checklist', label: 'Checklist' },
  ];

  const overviewTabs = [
    { id: 'content', label: 'Content' },
    { id: 'reports', label: 'Reports' },
    { id: 'modelAudit', label: 'Model Audit' },
    { id: 'controlSelection', label: 'Control Selection' },
    { id: 'settings', label: 'Settings' },
  ];

  const renderOverviewTabContent = () => {
    switch (activeOverviewTab) {
      case 'content':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Content Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Reports</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Generated Reports</h4>
                <p className="text-gray-600 dark:text-gray-400">No reports generated yet</p>
              </div>
            </div>
          </div>
        );
      case 'modelAudit':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Model Audit</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Audit Models</h4>
                <p className="text-gray-600 dark:text-gray-400">Select a model to begin audit</p>
              </div>
            </div>
          </div>
        );
      case 'controlSelection':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Control Selection</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Available Controls</h4>
                <p className="text-gray-600 dark:text-gray-400">No controls selected</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Audit Settings</h4>
                <p className="text-gray-600 dark:text-gray-400">Configure audit parameters</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeSideTab) {
      case 'overview':
        return (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Overview Tabs */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                  {overviewTabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      label={tab.label}
                      isActive={activeOverviewTab === tab.id}
                      onClick={() => setActiveOverviewTab(tab.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {renderOverviewTabContent()}
            </div>
          </div>
        );
      case 'assignTo':
        return (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Assignment Details</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <User className="size-5" />
                  <span className="text-lg">{auditData.assignedTo}</span>
                </div>
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                    Change Assignment
                </button>
                  <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    View Assignment History
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Activities</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Assigned to John Doe - 2 days ago</p>
                    <p>• Updated by Admin - 3 days ago</p>
                    <p>• Created by System - 1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'checklist':
        return (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Audit Checklist</h2>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2">
                  <span className="text-xl">+</span> Add Task
                </button>
              </div>
              <div className="space-y-4">
                {auditData.checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <CheckSquare 
                      className={`size-5 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} 
                    />
                    <span className="flex-1">{item.task}</span>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-primary-500 hover:text-primary-600">
                        {item.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isRightSidebarOpen ? 'mr-80' : ''}`}>
        <div className="mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar with Tabs */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {/* Side Tabs */}
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    {sideTabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        label={tab.label}
                        isActive={activeSideTab === tab.id}
                        onClick={() => setActiveSideTab(tab.id)}
                        className="w-full justify-start"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            {renderContent()}
          </div>
        </div>

        {/* QuickStart Button */}
        <button
          onClick={() => setIsRightSidebarOpen(true)}
          className={`fixed bottom-8 right-8 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 z-50 ${
            isRightSidebarOpen ? 'hidden' : ''
          }`}
        >
          <Rocket className="h-5 w-5" />
          <span>QuickStart</span>
        </button>
      </div>

      {/* Right sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary-500" />
              Quick Start Guide
            </h2>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Follow these steps to get started with your audit
          </p>
        </div>

        {/* Guide Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-10rem)]">
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="transform transition-all duration-200 hover:scale-102">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. Overview</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review basic audit information and set initial status</p>
                    <button className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="transform transition-all duration-200 hover:scale-102">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Assign Team</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add team members and define their roles</p>
                    <button className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      Manage Team →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="transform transition-all duration-200 hover:scale-102">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Checklist</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set up audit tasks and track progress</p>
                    <button className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      View Checklist →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="transform transition-all duration-200 hover:scale-102">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4. Documentation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upload and organize audit documents</p>
                    <button className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      Manage Docs →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
            <h4 className="font-medium text-primary-900 dark:text-primary-300 mb-2">Need Help?</h4>
            <p className="text-sm text-primary-700 dark:text-primary-400">
              Check our documentation or contact support for assistance with your audit process.
            </p>
          </div>
        </div>

        {/* Bottom Close Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5" />
            Dismiss QuickStart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails; 