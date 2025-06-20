import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckSquare, User, X, Rocket, ChevronUp, ChevronDown, Plus, Trash2, Check, Search, UserPlus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

// Quill editor modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background',
  'link'
];

interface User {
  id: number;
  name: string;
  department: string;
  email: string;
  canRead: boolean;
  canWrite: boolean;
}

interface ChecklistItem {
  id: number;
  title: string;
  content: string;
  completed: boolean;
  assignedUsers: number[];
  isExpanded: boolean;
  searchQuery: string;
  status: 'Pending' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
}

const statusOptions = [
  { value: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  { value: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'On Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  { value: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
];

const AuditDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeSideTab, setActiveSideTab] = useState('overview');
  const [activeOverviewTab, setActiveOverviewTab] = useState('content');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', department: 'Finance', email: 'john@example.com', canRead: true, canWrite: true },
    { id: 2, name: 'Jane Smith', department: 'Compliance', email: 'jane@example.com', canRead: true, canWrite: false },
    { id: 3, name: 'Mike Johnson', department: 'IT', email: 'mike@example.com', canRead: true, canWrite: false },
    { id: 4, name: 'Sarah Wilson', department: 'Risk Management', email: 'sarah@example.com', canRead: false, canWrite: false },
  ]);

  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: 'Review Documentation',
      content: '',
      completed: false,
      assignedUsers: [1],
      isExpanded: false,
      searchQuery: '',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Check Compliance',
      content: '',
      completed: false,
      assignedUsers: [2],
      isExpanded: false,
      searchQuery: '',
      status: 'Pending'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
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

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Saving draft:', editorContent);
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log('Publishing:', editorContent);
  };

  const handlePermissionChange = (userId: number, permission: 'read' | 'write', value: boolean) => {
    console.warn('Permission changes are not currently supported');
  };

  const handleChecklistContentChange = (id: number, content: string) => {
    setChecklists(checklists.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const handleChecklistComplete = (id: number) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleChecklistExpand = (id: number) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleAddChecklist = () => {
    const newId = Math.max(...checklists.map(item => item.id), 0) + 1;
    setChecklists([...checklists, {
      id: newId,
      title: 'New Checklist Item',
      content: '',
      completed: false,
      assignedUsers: [],
      isExpanded: true,
      searchQuery: '',
      status: 'Pending'
    }]);
  };

  const handleAssignUser = (checklistId: number, userId: number) => {
    console.log('Before update - Checklist ID:', checklistId, 'User ID:', userId);
    
    setChecklists((prevChecklists: ChecklistItem[]) => {
      // Deep clone the previous state to avoid any reference issues
      const newChecklists = JSON.parse(JSON.stringify(prevChecklists)) as ChecklistItem[];
      
      // Find the checklist to update
      const checklistIndex = newChecklists.findIndex((item: ChecklistItem) => item.id === checklistId);
      if (checklistIndex === -1) {
        console.error('Checklist not found:', checklistId);
        return prevChecklists;
      }

      // Get the current assigned users
      const currentAssignedUsers = [...newChecklists[checklistIndex].assignedUsers];
      console.log('Current assigned users:', currentAssignedUsers);

      // Update the assigned users array
      let updatedAssignedUsers;
      if (currentAssignedUsers.includes(userId)) {
        updatedAssignedUsers = currentAssignedUsers.filter(id => id !== userId);
        console.log('Removing user:', userId);
      } else {
        updatedAssignedUsers = [...currentAssignedUsers, userId];
        console.log('Adding user:', userId);
      }

      console.log('Updated assigned users:', updatedAssignedUsers);

      // Update the checklist with the new assigned users
      newChecklists[checklistIndex] = {
        ...newChecklists[checklistIndex],
        assignedUsers: updatedAssignedUsers
      };

      console.log('Final checklist state:', newChecklists[checklistIndex]);
      return newChecklists;
    });
  };

  const handleTitleChange = (id: number, title: string) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, title } : item
    ));
  };

  const handleDeleteChecklist = (id: number) => {
    if (window.confirm('Are you sure you want to delete this checklist item?')) {
      setChecklists(checklists.filter(item => item.id !== id));
    }
  };

  const handleBulkAssign = () => {
    const updatedChecklists = checklists.map(checklist => ({
      ...checklist,
      assignedUsers: [...new Set([...checklist.assignedUsers, ...selectedUsers])]
    }));
    setChecklists(updatedChecklists);
    setSelectedUsers([]);
    setIsAssignModalOpen(false);
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSearchQueryChange = (id: number, query: string) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, searchQuery: query } : item
    ));
  };

  const handleStatusChange = (id: number, newStatus: ChecklistItem['status']) => {
    setChecklists(checklists.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const renderOverviewTabContent = () => {
    switch (activeOverviewTab) {
      case 'content':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Content Information</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="dark:bg-gray-800">
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    className="bg-white dark:bg-gray-800 [&_.ql-toolbar]:bg-gray-50 dark:[&_.ql-toolbar]:bg-gray-700 [&_.ql-toolbar]:border-gray-200 dark:[&_.ql-toolbar]:border-gray-600 [&_.ql-container]:border-gray-200 dark:[&_.ql-container]:border-gray-600 [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-gray-900 dark:[&_.ql-editor]:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  Publish
                </button>
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

  const renderChecklistContent = () => {
    return (
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Audit Checklist</h2>
              <button
                onClick={handleAddChecklist}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Checklist
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-6">
              {checklists.map((item) => (
                <div 
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => handleChecklistComplete(item.id)}
                          className={`p-1 rounded-md transition-colors ${
                            item.completed 
                              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTitleChange(item.id, e.target.value)}
                          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Status Dropdown */}
                        <div className="relative status-dropdown">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusDropdownId(statusDropdownId === item.id ? null : item.id);
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              statusOptions.find(option => option.value === item.status)?.color
                            }`}
                          >
                            {item.status}
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </button>
                          {statusDropdownId === item.id && (
                            <div className="fixed z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-[9999]">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                {statusOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(item.id, option.value as ChecklistItem['status']);
                                      setStatusDropdownId(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${option.color} hover:bg-opacity-80`}
                                    role="menuitem"
                                  >
                                    {option.value}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {item.assignedUsers.map(userId => {
                              const user = users.find(u => u.id === userId);
                              return user ? (
                                <div 
                                  key={user.id}
                                  className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center border-2 border-white dark:border-gray-800"
                                  title={user.name}
                                >
                                  <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <button
                            onClick={() => handleChecklistExpand(item.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                          >
                            {item.isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this checklist item?')) {
                              setChecklists(checklists.filter(c => c.id !== item.id));
                            }
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {item.isExpanded && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                          <ReactQuill
                            theme="snow"
                            value={item.content}
                            onChange={(content) => handleChecklistContentChange(item.id, content)}
                            modules={modules}
                            formats={formats}
                            className="bg-white dark:bg-gray-800 [&_.ql-toolbar]:bg-gray-50 dark:[&_.ql-toolbar]:bg-gray-700 [&_.ql-toolbar]:border-gray-200 dark:[&_.ql-toolbar]:border-gray-600 [&_.ql-container]:border-gray-200 dark:[&_.ql-container]:border-gray-600 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-gray-900 dark:[&_.ql-editor]:text-gray-100"
                          />
                          
                          <div className="mt-4 relative">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">Assigned Users</h4>
                              <div className="relative w-72">
                                <input
                                  type="text"
                                  placeholder="Search users..."
                                  value={item.searchQuery}
                                  onChange={(e) => handleSearchQueryChange(item.id, e.target.value)}
                                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <Search className="fixed right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z[9999]" />
                                
                                {/* Search Results Dropdown */}
                                {item.searchQuery && (
                                  <div 
                                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto"
                                  >
                                    {users
                                      .filter(user => 
                                        (user.name.toLowerCase().includes(item.searchQuery.toLowerCase()) ||
                                        user.department.toLowerCase().includes(item.searchQuery.toLowerCase())) &&
                                        !item.assignedUsers.includes(user.id)
                                      )
                                      .map(user => (
                                        <div
                                          key={user.id}
                                          onClick={() => {
                                            console.log('Clicking user:', user.id, 'for checklist:', item.id);
                                            handleAssignUser(item.id, user.id);
                                            handleSearchQueryChange(item.id, '');
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer"
                                        >
                                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">
                                              {user.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.department}</div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSideTab) {
      case 'overview':
        return (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
              {renderOverviewTabContent()}
            </div>
          </div>
        );
      case 'assignTo':
        return (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Assignment Details</h2>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-2">
                  <span className="text-xl">+</span> Add User
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <span className="text-primary-700 dark:text-primary-300 font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {user.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={user.canRead}
                                onChange={(e) => handlePermissionChange(user.id, 'read', e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                              />
                              <span>Read</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={user.canWrite}
                                onChange={(e) => handlePermissionChange(user.id, 'write', e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                              />
                              <span>Write</span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Activities</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Jane Smith granted read access - 2 days ago</p>
                  <p>• Mike Johnson granted read access - 3 days ago</p>
                  <p>• John Doe granted write access - 1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'checklist':
        return renderChecklistContent();
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
      {isRightSidebarOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-40">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Start Guide
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Follow these steps to complete your audit
            </p>
          </div>

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
                      <User className="h-5 w-5 text-green-600 dark:text-green-300" />
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
                      <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-300" />
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
                      <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-300" />
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
      )}
    </div>
  );
};

export default AuditDetails; 