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

// Helper function to extract error message
const getErrorMessage = (err: any, defaultMessage: string) => {
  if (!err.response?.data) return defaultMessage;
  
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
    return errors || defaultMessage;
  }
  return defaultMessage;
};

const RolesPermissions = () => {
  const navigate = useNavigate();
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
        ErrorToast('No roles found');
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
      UpdateToast('Roles reordered successfully');
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
        DeleteToast('Role deleted successfully');
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
      AddToast('Role cloned successfully');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, 'Failed to clone role');
      ErrorToast(errorMessage);
    }
  };

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Roles and Permissions</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllRoles}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Refresh roles"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <input
            type="text"
            placeholder="Filter by name, description, severity, status..."
            value={filter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded px-3 py-2 w-64"
          />
          <button
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => navigate('/admins/roles-permissions/add')}
          >
            New Role
          </button>
        </div>
      </div>
      {loading && <div className="text-center py-8">Loading roles...</div>}
      {error && <div className="text-center text-red-500 py-4">{error}</div>}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <DragDropContext onDragEnd={handleDragEnd}>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <Droppable droppableId="roles-table">
                {(provided) => (
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="divide-y divide-gray-200 dark:divide-gray-600"
                  >
                    {paginatedRoles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <UserX className="w-10 h-10 mb-2 text-gray-300" />
                            <span className="text-lg font-semibold text-gray-400">No roles found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRoles.map((role, index) => (
                        <Draggable key={role.id} draggableId={role.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                snapshot.isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                {role.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                                {role.description}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                  {role.permissions_count ? (
                                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900/20 dark:text-blue-400">
                                      {role.permissions_count} permissions
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-400">
                                      No permissions
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  role.status === 'Active' 
                                    ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20' 
                                    : 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                                }`}>
                                  {role.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleClone(role)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    title="Clone"
                                  >
                                    <Copy className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(role)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(role.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
        />
      </div>
      {/* Delete Confirm Dialog */}
      <Confirm
        isOpen={showDeleteDialog}
        title="Confirm Delete"
        message={<span>Are you sure you want to delete <span className="font-semibold">{roleToDelete?.name}</span>?</span>}
        onCancel={() => { setShowDeleteDialog(false); setDeleteRoleId(null); }}
        onConfirm={confirmDelete}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default RolesPermissions; 