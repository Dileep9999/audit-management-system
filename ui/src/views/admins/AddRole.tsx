import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import * as rolesApi from '../../utils/roles_api';
import toast from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';

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
  const { t, isRTL } = useTranslation();
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
      toast.success(t('roles.messages.create_success', 'Role created successfully!'));
      navigate('/admins/roles-permissions');
    } catch (err: any) {
      let errorMessage = t('roles.messages.create_error', 'Failed to create role');
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('roles.form.create_title', 'Create New Role')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('roles.form.create_description', 'Add a new role and assign permissions to manage access control.')}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Role Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('roles.form.info_section', 'Role Information')}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('roles.form.name.label', 'Role Name')}
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newRole.name}
                      onChange={handleAddChange}
                      placeholder={t('roles.form.name.placeholder', 'Enter role name')}
                      className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('roles.form.description.label', 'Description')}
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <textarea
                      id="description"
                      name="description"
                      value={newRole.description}
                      onChange={handleAddChange}
                      placeholder={t('roles.form.description.placeholder', 'Enter role description')}
                      rows={3}
                      className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('roles.form.status.label', 'Status')}
                  </label>
                  <select
                    name="status"
                    value={newRole.status}
                    onChange={handleAddChange}
                    className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                  >
                    <option value="Active">{t('roles.status.active', 'Active')}</option>
                    <option value="Inactive">{t('roles.status.inactive', 'Inactive')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('roles.permissions.title', 'Permissions')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAllCategories}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
                  >
                    {allCollapsed ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        {t('roles.actions.expand_all', 'Expand All')}
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        {t('roles.actions.collapse_all', 'Collapse All')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={toggleAllPermissions}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
                  >
                    {allPermissionsSelected ? (
                      t('roles.actions.uncheck_all', 'Uncheck All')
                    ) : (
                      t('roles.actions.check_all', 'Check All')
                    )}
                  </button>
                </div>
              </div>

              {/* Permissions List */}
              {permLoading ? (
                <div className="text-center py-4">
                  {t('roles.permissions.loading', 'Loading permissions...')}
                </div>
              ) : (
                <div className="space-y-4">
                  {permissionCategories.map((category) => (
                    <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex justify-between items-center">
                        <button
                          onClick={() => toggleCategory(category.category)}
                          className="flex items-center gap-2 text-gray-900 dark:text-white font-medium"
                        >
                          {collapsedCategories.has(category.category) ? (
                            <ChevronRight className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                          {t(`roles.permissions.categories.${category.category.toLowerCase()}`, category.category)}
                        </button>
                        <button
                          onClick={() => toggleCategoryPermissions(category)}
                          className={getToggleButtonProps(category).className}
                        >
                          {t(
                            getToggleButtonProps(category).text === 'Uncheck all'
                              ? 'roles.actions.uncheck_all'
                              : 'roles.actions.check_all',
                            getToggleButtonProps(category).text
                          )}
                        </button>
                      </div>
                      {!collapsedCategories.has(category.category) && (
                        <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                          {category.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  checked={(newRole.permission_ids || []).includes(permission.id)}
                                  onChange={(e) => handleAddPermissionChange(permission.id, e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ms-3 text-sm">
                                <label className="font-medium text-gray-700 dark:text-gray-300">
                                  {permission.name}
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">{permission.description}</p>
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
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admins/roles-permissions')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {t('roles.actions.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  isFormValid()
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {t('roles.actions.create', 'Create Role')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRole; 