import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Edit2, Trash2, MoreVertical, UserX, GripVertical, ChevronDown, ChevronRight, Copy, RefreshCw } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import Popup from '../../components/shared/Popup';
import Confirm from '../../components/shared/Confirm';
import * as rolesApi from '../../utils/roles_api';
import AddToast from '../../components/custom/toast/addToast';
import DeleteToast from '../../components/custom/toast/deleteToast';
import ErrorToast from '../../components/custom/toast/errorToast';
import UpdateToast from '../../components/custom/toast/updateToast';
import { useNavigate } from 'react-router-dom';
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
  severity: string;
  hierarchy_position: number;
  permissions?: Permission[];
  permissions_count?: number;
  permission_ids?: number[];
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

interface RoleResponse {
  data: Role;
}

const severityOptions = ['Critical', 'High', 'Medium', 'Low'];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const emptyRole: Role = {
  id: 0,
  name: '',
  description: '',
  severity: 'Low',
  hierarchy_position: 0,
  permissions: [],
  permission_ids: [],
  status: 'Active',
  created_at: '',
  updated_at: '',
};

const RolesPermissions = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Debug authentication status
  useEffect(() => {
    console.log('Current cookies:', document.cookie);
    const csrfCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('csrftoken='));
    console.log('CSRF token:', csrfCookie ? csrfCookie.split('=')[1] : 'Not found');
  }, []);

  // Fetch roles and permissions on mount
  useEffect(() => {
    fetchAllRoles();
    fetchAllPermissionCategories();
  }, []);

  const fetchAllRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching roles...');
      const res = await rolesApi.fetchRoles({
        page: currentPage,
        page_size: pageSize,
        ordering: '-created_at'
      });
      console.log('Roles API response:', res);
      if (res.data) {
        setRoles(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalCount(res.data.count || 0);
        setCurrentPage(res.data.current_page || 1);
      } else {
        setRoles([]);
        ErrorToast(t('roles.error', 'No roles found'));
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      console.error('Error response:', err.response);
      const errorMessage = getErrorMessage(err, 'Failed to fetch roles');
      setError(errorMessage);
      ErrorToast(errorMessage);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissionCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching permission categories...');
      const res = await rolesApi.fetchPermissionCategories();
      console.log('Permission categories API response:', res);
      setPermissionCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      console.error('Error response:', err.response);
      const errorMessage = getErrorMessage(err, 'Failed to fetch permissions');
      setError(errorMessage);
      ErrorToast(errorMessage);
      setPermissionCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const isFormValid = (role: Role) => {
    return role.name.trim() !== '' && 
           role.description.trim() !== '' && 
           (role.permission_ids && role.permission_ids.length > 0);
  };

  const isAddFormValid = isFormValid(emptyRole);
  const isEditFormValid = roles.find(role => role.id === deleteRoleId) ? isFormValid(roles.find(role => role.id === deleteRoleId)!) : false;

  // Filtered roles - add safety check
  const filteredRoles = Array.isArray(roles) ? roles.filter(role =>
    role.name.toLowerCase().includes(filter.toLowerCase()) ||
    role.description.toLowerCase().includes(filter.toLowerCase()) ||
    role.severity.toLowerCase().includes(filter.toLowerCase()) ||
    role.status.toLowerCase().includes(filter.toLowerCase())
  ) : [];

  // Use backend pagination instead of client-side
  const paginatedRoles = filteredRoles;

  // Drag and Drop handlers
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(paginatedRoles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update hierarchy positions based on new order, maintaining newest first
    const updatedItems = items.map((item, index) => ({
      ...item,
      hierarchy_position: items.length - index // Reverse the position to maintain newest first
    }));
    
    // Update the roles array with the new order
    const newRoles = Array.isArray(roles) ? [...roles] : [];
    updatedItems.forEach((updatedItem) => {
      const originalIndex = newRoles.findIndex(role => role.id === updatedItem.id);
      if (originalIndex !== -1) {
        newRoles[originalIndex] = updatedItem;
      }
    });
    setRoles(newRoles);
    
    try {
      // Send reorder to backend with reversed positions
      await rolesApi.reorderRoles(updatedItems.map(r => ({ 
        role_id: r.id, 
        new_position: r.hierarchy_position
      })));
      UpdateToast(t('roles.actions.reordered', 'Roles reordered successfully'));
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to reorder roles');
      ErrorToast(errorMessage);
      fetchAllRoles(); // This will refresh the list in newest-first order
    }
  };

  // CRUD Handlers
  const handleEdit = (role: Role) => {
    try {
    navigate(`/admins/roles-permissions/edit/${role.id}`);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to open role for editing');
      ErrorToast(errorMessage);
    }
  };

  const handleDelete = (id: number) => {
    try {
    setDeleteRoleId(id);
    setShowDeleteDialog(true);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to open delete dialog');
      ErrorToast(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (deleteRoleId !== null) {
      try {
        await rolesApi.deleteRole(deleteRoleId);
        setRoles(Array.isArray(roles) ? roles.filter(role => role.id !== deleteRoleId) : []);
        DeleteToast(t('roles.actions.deleted', 'Role deleted successfully'));
      } catch (err: any) {
        const errorMessage = getErrorMessage(err, 'Failed to delete role');
        ErrorToast(errorMessage);
      }
    }
    setShowDeleteDialog(false);
    setDeleteRoleId(null);
  };

  // Filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
    setFilter(e.target.value);
    setPage(1);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to apply filter');
      ErrorToast(errorMessage);
    }
  };

  // Get role name for delete dialog
  const roleToDelete = Array.isArray(roles) ? roles.find(role => role.id === deleteRoleId) : undefined;

  // Update roles when page or pageSize changes
  useEffect(() => {
    fetchAllRoles();
  }, [currentPage, pageSize]);

  // Add handleClone function
  const handleClone = async (role: Role) => {
    try {
      const response = await rolesApi.fetchRole(role.id);
      const fullRole = {
        ...response.data,
        permission_ids: response.data.permissions?.map((p: Permission) => p.id) || []
      };
      
      navigate('/admins/roles-permissions/add', {
        state: {
          ...fullRole,
          name: `${fullRole.name} copy`,
          id: undefined,
          created_at: undefined,
          updated_at: undefined
        }
      });
      AddToast(t('roles.actions.cloned', 'Role cloned successfully'));
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to clone role');
      ErrorToast(errorMessage);
    }
  };

  // Update error message handling to use translations
  const getErrorMessage = (err: any, defaultMessage: string) => {
    if (!err.response?.data) return t('roles.error', defaultMessage);
    
    if (typeof err.response.data === 'string') {
      return err.response.data;
    }
    if (err.response.data.detail) {
      return err.response.data.detail;
    }
    if (err.response.data.message) {
      return err.response.data.message;
    }
    if (typeof err.response.data === 'object') {
      const errors = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return errors || t('roles.error', defaultMessage);
    }
    return t('roles.error', defaultMessage);
  };

  return (
    <div className="p-4 relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('roles.title', 'Roles & Permissions')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admins/roles-permissions/add')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('roles.add_role', 'Add Role')}
          </button>
          <button
            onClick={fetchAllRoles}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title={t('roles.actions.refresh', 'Refresh')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t('roles.filter_placeholder', 'Filter by name, description, severity, status...')}
          value={filter}
          onChange={handleFilterChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-4">{t('roles.loading', 'Loading roles...')}</div>
      ) : error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : paginatedRoles.length === 0 ? (
        <div className="text-center py-4">{t('roles.no_roles', 'No roles found')}</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="roles">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="w-10"></th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.name', 'Name')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.description', 'Description')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.severity', 'Severity')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.status', 'Status')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.permissions', 'Permissions')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.created_by', 'Created By')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.created_at', 'Created At')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          {t('roles.table.actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedRoles.map((role, index) => (
                        <Draggable key={role.id} draggableId={String(role.id)} index={index}>
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="w-10 px-2" {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                              <td className="px-6 py-4">{role.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {t(`roles.severity.${role.severity.toLowerCase()}`, role.severity)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {t(`roles.status.${role.status.toLowerCase()}`, role.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {role.permissions_count || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {role.created_by_username}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(role.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(role)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title={t('roles.actions.edit', 'Edit Role')}
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleClone(role)}
                                    className="text-green-600 hover:text-green-900"
                                    title={t('roles.actions.clone', 'Clone Role')}
                                  >
                                    <Copy className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(role.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title={t('roles.actions.delete', 'Delete Role')}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Confirm
          isOpen={showDeleteDialog}
          title={t('roles.actions.delete', 'Delete Role')}
          message={t('roles.actions.confirm_delete', 'Are you sure you want to delete this role?')}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDeleteRoleId(null);
          }}
        />
      )}
    </div>
  );
};

export default RolesPermissions; 