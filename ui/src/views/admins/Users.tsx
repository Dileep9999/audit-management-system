import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, UserX } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import { Admin } from '../../models/Admin';
import Popup from '../../components/shared/Popup';
import Confirm from '../../components/shared/Confirm';
import useTranslation from '../../hooks/useTranslation';

const dummyUsers: Admin[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', group: 'HR', status: 'Active', lastActive: '05-01-2024 14:23' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', group: 'Finance', status: 'Inactive', lastActive: '04-28-2024 09:10' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', group: 'Finance', status: 'Active', lastActive: '05-02-2024 08:45' },
  { id: 4, name: 'David Kim', email: 'david@example.com', group: 'Finance', status: 'Inactive', lastActive: '04-30-2024 16:00' },
  { id: 5, name: 'Eva Green', email: 'eva@example.com', group: 'Moderator', status: 'Active', lastActive: '05-01-2024 12:30' },
  { id: 6, name: 'Frank Moore', email: 'frank@example.com', group: 'Admin', status: 'Active', lastActive: '05-02-2024 10:15' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', group: 'Finance', status: 'Inactive', lastActive: '04-29-2024 11:05' },
  { id: 8, name: 'Henry Ford', email: 'henry@example.com', group: 'IT', status: 'Active', lastActive: '05-02-2024 09:50' },
];

const emptyUser: Admin = {
  id: 0,
  name: '',
  email: '',
  group: '',
  status: 'Active',
  lastActive: '',
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Users = () => {
  const { t, isRTL } = useTranslation();
  const [users, setUsers] = useState<Admin[]>(dummyUsers);
  const [editUser, setEditUser] = useState<Admin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Admin>(emptyUser);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Validation functions
  const isFormValid = (user: Admin) => {
    return user.name.trim() !== '' && 
           user.email.trim() !== '' && 
           user.group.trim() !== '' &&
           user.email.includes('@'); // Basic email validation
  };

  const isAddFormValid = isFormValid(newUser);
  const isEditFormValid = editUser ? isFormValid(editUser) : false;

  // Helper functions for date format conversion
  const convertToInputFormat = (displayDate: string): string => {
    if (!displayDate) return '';
    // Convert from "MM-DD-YYYY HH:mm" to "YYYY-MM-DDTHH:mm"
    const [datePart, timePart] = displayDate.split(' ');
    const [month, day, year] = datePart.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
  };

  const convertToDisplayFormat = (inputDate: string): string => {
    if (!inputDate) return '';
    // Convert from "YYYY-MM-DDTHH:mm" to "MM-DD-YYYY HH:mm"
    const [datePart, timePart] = inputDate.split('T');
    const [year, month, day] = datePart.split('-');
    return `${month}-${day}-${year} ${timePart}`;
  };

  // Filtered users
  const filteredUsers = users.filter(a =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.email.toLowerCase().includes(filter.toLowerCase()) ||
    a.group.toLowerCase().includes(filter.toLowerCase()) ||
    a.status.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination
  const pageCount = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + paginatedUsers.length;

  const handleEdit = (user: Admin) => {
    setEditUser({
      ...user,
      lastActive: convertToInputFormat(user.lastActive)
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (!editUser) return;
    const updatedUser = {
      ...editUser,
      lastActive: convertToDisplayFormat(editUser.lastActive)
    };
    setUsers(users.map(a => (a.id === editUser.id ? updatedUser : a)));
    setShowEditModal(false);
    setEditUser(null);
  };

  const handleDelete = (id: number) => {
    setDeleteUserId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteUserId !== null) {
      setUsers(users.filter(a => a.id !== deleteUserId));
    }
    setShowDeleteDialog(false);
    setDeleteUserId(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteUserId(null);
  };

  // Add User Handlers
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const nextId = users.length > 0 ? Math.max(...users.map(a => a.id)) + 1 : 1;
    const newUserWithFormattedDate = {
      ...newUser,
      id: nextId,
      lastActive: convertToDisplayFormat(newUser.lastActive)
    };
    setUsers([newUserWithFormattedDate, ...users]); // Add to top
    setShowAddModal(false);
    setNewUser(emptyUser);
    setPage(1); // Go to first page to show new user
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setNewUser(emptyUser);
  };

  // Filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1);
  };

  // Page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Pagination
  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(pageCount, p + 1));
  const handlePageChange = (p: number) => setPage(p);

  // Get user name for delete dialog
  const userToDelete = users.find(a => a.id === deleteUserId);

  return (
    <div className="p-4 relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('users.title', 'Users')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <input
            type="text"
            placeholder={t('users.filter_placeholder', 'Filter by name, email, group, status...')}
            value={filter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded px-3 py-2 w-64"
          />
          <button
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowAddModal(true)}
          >
            {t('users.add_user', 'Add User')}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.name', 'Name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.email', 'Email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.group', 'Group')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.status', 'Status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.last_active', 'Last Active')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="w-10 h-10 mb-2 text-gray-300" />
                      <span className="text-lg font-semibold text-gray-400">{t('users.no_users', 'No users found')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{t(`users.groups.${user.group.toLowerCase()}`, user.group)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{t(`users.status.${user.status.toLowerCase()}`, user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{user.lastActive}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('users.actions.edit', 'Edit User')}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('users.actions.delete', 'Delete User')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('users.actions.more', 'More')}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editUser && (
        <Popup
          isOpen={showEditModal}
          title={t('users.actions.edit', 'Edit User')}
          onClose={() => {
            setShowEditModal(false);
            setEditUser(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.name.label', 'Name')}
              </label>
              <input
                type="text"
                name="name"
                value={editUser.name}
                onChange={handleEditChange}
                placeholder={t('users.form.name.placeholder', 'Enter user name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.email.label', 'Email')}
              </label>
              <input
                type="email"
                name="email"
                value={editUser.email}
                onChange={handleEditChange}
                placeholder={t('users.form.email.placeholder', 'Enter email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.group.label', 'Group')}
              </label>
              <select
                name="group"
                value={editUser.group}
                onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{t('users.form.group.placeholder', 'Select group')}</option>
                <option value="HR">{t('users.groups.hr', 'HR')}</option>
                <option value="Finance">{t('users.groups.finance', 'Finance')}</option>
                <option value="Moderator">{t('users.groups.moderator', 'Moderator')}</option>
                <option value="Admin">{t('users.groups.admin', 'Admin')}</option>
                <option value="IT">{t('users.groups.it', 'IT')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.status.label', 'Status')}
              </label>
              <select
                name="status"
                value={editUser.status}
                onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Active">{t('users.status.active', 'Active')}</option>
                <option value="Inactive">{t('users.status.inactive', 'Inactive')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.last_active.label', 'Last Active')}
              </label>
              <input
                type="datetime-local"
                name="lastActive"
                value={editUser.lastActive}
                onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditUser(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('users.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleUpdate}
              disabled={!isEditFormValid}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('users.actions.save', 'Save')}
            </button>
          </div>
        </Popup>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && userToDelete && (
        <Confirm
          isOpen={showDeleteDialog}
          title={t('users.actions.delete', 'Delete User')}
          message={t('users.actions.confirm_delete', 'Are you sure you want to delete this user?')}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <Popup
          isOpen={showAddModal}
          title={t('users.add_user', 'Add User')}
          onClose={handleAddCancel}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.name.label', 'Name')}
              </label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleAddChange}
                placeholder={t('users.form.name.placeholder', 'Enter user name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.email.label', 'Email')}
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleAddChange}
                placeholder={t('users.form.email.placeholder', 'Enter email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.group.label', 'Group')}
              </label>
              <select
                name="group"
                value={newUser.group}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{t('users.form.group.placeholder', 'Select group')}</option>
                <option value="HR">{t('users.groups.hr', 'HR')}</option>
                <option value="Finance">{t('users.groups.finance', 'Finance')}</option>
                <option value="Moderator">{t('users.groups.moderator', 'Moderator')}</option>
                <option value="Admin">{t('users.groups.admin', 'Admin')}</option>
                <option value="IT">{t('users.groups.it', 'IT')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.status.label', 'Status')}
              </label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Active">{t('users.status.active', 'Active')}</option>
                <option value="Inactive">{t('users.status.inactive', 'Inactive')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('users.form.last_active.label', 'Last Active')}
              </label>
              <input
                type="datetime-local"
                name="lastActive"
                value={newUser.lastActive}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleAddCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('users.actions.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleAdd}
              disabled={!isAddFormValid}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('users.actions.save', 'Save')}
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default Users; 