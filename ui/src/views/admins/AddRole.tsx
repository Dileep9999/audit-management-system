import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import * as rolesApi from '../../utils/roles_api';
import toast from 'react-hot-toast';

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  hierarchy_position: number;
  permissions?: Permission[];
  permission_ids?: number[];
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

const severityOptions = ['Critical', 'High', 'Medium', 'Low'];

const emptyRole: Role = {
  id: 0,
  name: '',
  description: '',
  hierarchy_position: 0,
  permissions: [],
  permission_ids: [],
  status: 'Active',
  created_at: '',
  updated_at: '',
};

const AddRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state ? {
    ...emptyRole,
    ...location.state,
    permission_ids: location.state.permission_ids || [],
    permissions: location.state.permissions || []
  } : emptyRole;
  const [newRole, setNewRole] = useState<Role>(initialRole);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [permLoading, setPermLoading] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [allPermissionsSelected, setAllPermissionsSelected] = useState(false);

  useEffect(() => {
    fetchAllPermissionCategories();
  }, []);

  const fetchAllPermissionCategories = async () => {
    setPermLoading(true);
    try {
      const res = await rolesApi.fetchPermissionCategories();
      setPermissionCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(`Failed to fetch permissions: ${err.response?.data?.detail || err.message}`);
      setPermissionCategories([]);
    } finally {
      setPermLoading(false);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewRole({ ...newRole, [e.target.name]: e.target.value });
  };

  const handleAddPermissionChange = (permissionId: number, checked: boolean) => {
    const updated = checked
      ? [...(newRole.permission_ids || []), permissionId]
      : (newRole.permission_ids || []).filter(id => id !== permissionId);
    setNewRole({ ...newRole, permission_ids: updated });
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const toggleCategoryPermissions = (category: PermissionCategory) => {
    const allCategoryPermissionIds = category.permissions.map(p => p.id);
    const currentPermissionIds = newRole.permission_ids || [];
    const allSelected = allCategoryPermissionIds.every(id => currentPermissionIds.includes(id));
    
    if (allSelected) {
      setNewRole({
        ...newRole,
        permission_ids: currentPermissionIds.filter(id => !allCategoryPermissionIds.includes(id))
      });
    } else {
      setNewRole({
        ...newRole,
        permission_ids: Array.from(new Set([...currentPermissionIds, ...allCategoryPermissionIds]))
      });
    }
  };

  const getToggleButtonProps = (category: PermissionCategory) => {
    const allCategoryPermissionIds = category.permissions.map(p => p.id);
    const currentPermissionIds = newRole.permission_ids || [];
    const allSelected = allCategoryPermissionIds.every(id => currentPermissionIds.includes(id));
    
    return {
      text: allSelected ? 'Uncheck all' : 'Check all',
      className: allSelected
        ? 'text-xs bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 px-3 py-1 rounded-md font-medium transition-colors duration-200'
        : 'text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 px-3 py-1 rounded-md font-medium transition-colors duration-200'
    };
  };

  const isFormValid = () => {
    return newRole.name.trim() !== '' && 
           newRole.description.trim() !== '' && 
           (newRole.permission_ids && newRole.permission_ids.length > 0);
  };

  const handleSubmit = async () => {
    try {
      await rolesApi.createRole({
        name: newRole.name,
        description: newRole.description,
        status: newRole.status,
        permission_ids: newRole.permission_ids
      });
      toast.success('Role created successfully!');
      navigate('/admins/roles-permissions');
    } catch (err: any) {
      // Extract the actual error message from the API response
      let errorMessage = 'Failed to create role';
      if (err.response?.data) {
        // Handle different error response formats
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          // Handle validation errors that might be field-specific
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          errorMessage = errors || errorMessage;
        }
      }
      toast.error(errorMessage);
    }
  };

  const toggleAllCategories = () => {
    if (allCollapsed) {
      setCollapsedCategories(new Set());
    } else {
      setCollapsedCategories(new Set(permissionCategories.map(cat => cat.category)));
    }
    setAllCollapsed(!allCollapsed);
  };

  const toggleAllPermissions = () => {
    const newSelected = !allPermissionsSelected;
    setAllPermissionsSelected(newSelected);
    
    if (newSelected) {
      const allPermissionIds = permissionCategories.flatMap(category => 
        category.permissions.map(permission => permission.id)
      );
      setNewRole({ ...newRole, permission_ids: allPermissionIds });
    } else {
      setNewRole({ ...newRole, permission_ids: [] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className=" mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Role</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Add a new role and assign permissions to manage access control.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Role Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Role Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newRole.name}
                      onChange={handleAddChange}
                      placeholder="Enter role name"
                      className="block w-full rounded-md border-0 py-2.5 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <textarea
                      id="description"
                      name="description"
                      value={newRole.description}
                      onChange={handleAddChange}
                      placeholder="Enter role description"
                      rows={3}
                      className="block w-full rounded-md border-0 py-2.5 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddChange({
                      target: {
                        name: 'status',
                        value: newRole.status === 'Active' ? 'Inactive' : 'Active'
                      }
                    } as any)}
                    className={`relative inline-flex h-10 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      newRole.status === 'Active' ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Toggle status</span>
                    <span
                      className={`pointer-events-none relative inline-block h-9 w-9 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        newRole.status === 'Active' ? 'translate-x-10' : 'translate-x-0'
                      }`}
                    >
                      <span
                        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                          newRole.status === 'Active' ? 'opacity-0' : 'opacity-100'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-400">Off</span>
                      </span>
                      <span
                        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                          newRole.status === 'Active' ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <span className="text-sm font-medium text-primary-500">On</span>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Permissions</h2>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={toggleAllCategories}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {allCollapsed ? (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1.5" />
                        Expand All
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1.5" />
                        Collapse All
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleAllPermissions}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {allPermissionsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
              {permLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading permissions...</p>
                </div>
              ) : (
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {permissionCategories.map((category, categoryIndex) => (
                    <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.category)}
                          className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          {collapsedCategories.has(category.category) ? (
                            <ChevronRight className="w-4 h-4 mr-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mr-2" />
                          )}
                          {category.category}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategoryPermissions(category)}
                          className={getToggleButtonProps(category).className}
                        >
                          {getToggleButtonProps(category).text}
                        </button>
                      </div>
                      {!collapsedCategories.has(category.category) && (
                        <div className="p-4 space-y-2 bg-white dark:bg-gray-900">
                          {category.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-start hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-150">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  checked={newRole.permission_ids?.includes(permission.id) || false}
                                  onChange={(e) => handleAddPermissionChange(permission.id, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{permission.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/admins/roles-permissions')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isFormValid()
                  ? 'text-white bg-primary-600 hover:bg-primary-700'
                  : 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
              }`}
            >
              Create Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRole; 