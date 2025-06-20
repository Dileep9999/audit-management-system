import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, UserX } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import { Admin } from '../../models/Admin';
import Popup from '../../components/shared/Popup';
import Confirm from '../../components/shared/Confirm';

const dummyAdmins: Admin[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', group: 'Super Admin', status: 'Active', lastActive: '05-01-2024 14:23' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', group: 'Moderator', status: 'Inactive', lastActive: '04-28-2024 09:10' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', group: 'Editor', status: 'Active', lastActive: '05-02-2024 08:45' },
  { id: 4, name: 'David Kim', email: 'david@example.com', group: 'Editor', status: 'Inactive', lastActive: '04-30-2024 16:00' },
  { id: 5, name: 'Eva Green', email: 'eva@example.com', group: 'Moderator', status: 'Active', lastActive: '05-01-2024 12:30' },
  { id: 6, name: 'Frank Moore', email: 'frank@example.com', group: 'Super Admin', status: 'Active', lastActive: '05-02-2024 10:15' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', group: 'Editor', status: 'Inactive', lastActive: '04-29-2024 11:05' },
  { id: 8, name: 'Henry Ford', email: 'henry@example.com', group: 'Moderator', status: 'Active', lastActive: '05-02-2024 09:50' },
];

const emptyAdmin: Admin = {
  id: 0,
  name: '',
  email: '',
  group: '',
  status: 'Active',
  lastActive: '',
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Admins = () => {
  const [admins, setAdmins] = useState<Admin[]>(dummyAdmins);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState<Admin>(emptyAdmin);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Validation functions
  const isFormValid = (admin: Admin) => {
    return admin.name.trim() !== '' && 
           admin.email.trim() !== '' && 
           admin.group.trim() !== '' &&
           admin.email.includes('@'); // Basic email validation
  };

  const isAddFormValid = isFormValid(newAdmin);
  const isEditFormValid = editAdmin ? isFormValid(editAdmin) : false;

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

  // Filtered admins
  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.email.toLowerCase().includes(filter.toLowerCase()) ||
    a.group.toLowerCase().includes(filter.toLowerCase()) ||
    a.status.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination
  const pageCount = Math.ceil(filteredAdmins.length / pageSize);
  const paginatedAdmins = filteredAdmins.slice((page - 1) * pageSize, page * pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + paginatedAdmins.length;

  const handleEdit = (admin: Admin) => {
    setEditAdmin({
      ...admin,
      lastActive: convertToInputFormat(admin.lastActive)
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editAdmin) return;
    setEditAdmin({ ...editAdmin, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (!editAdmin) return;
    const updatedAdmin = {
      ...editAdmin,
      lastActive: convertToDisplayFormat(editAdmin.lastActive)
    };
    setAdmins(admins.map(a => (a.id === editAdmin.id ? updatedAdmin : a)));
    setShowEditModal(false);
    setEditAdmin(null);
  };

  const handleDelete = (id: number) => {
    setDeleteAdminId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteAdminId !== null) {
      setAdmins(admins.filter(a => a.id !== deleteAdminId));
    }
    setShowDeleteDialog(false);
    setDeleteAdminId(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteAdminId(null);
  };

  // Add Admin Handlers
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const nextId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
    const newAdminWithFormattedDate = {
      ...newAdmin,
      id: nextId,
      lastActive: convertToDisplayFormat(newAdmin.lastActive)
    };
    setAdmins([newAdminWithFormattedDate, ...admins]); // Add to top
    setShowAddModal(false);
    setNewAdmin(emptyAdmin);
    setPage(1); // Go to first page to show new admin
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setNewAdmin(emptyAdmin);
  };

  // Filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1);
  };

  // Page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  // Pagination
  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(pageCount, p + 1));
  const handlePageChange = (p: number) => setPage(p);

  // Get admin name for delete dialog
  const adminToDelete = admins.find(a => a.id === deleteAdminId);

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admins</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <input
            type="text"
            placeholder="Filter by name, email, group, status..."
            value={filter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded px-3 py-2 w-64"
          />
          <button
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowAddModal(true)}
          >
            Add Admin
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="w-10 h-10 mb-2 text-gray-300" />
                      <span className="text-lg font-semibold text-gray-400">No admins found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{admin.group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{admin.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{admin.lastActive}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="More"
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
        <Pagination
          currentPage={page}
          totalItems={filteredAdmins.length}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={size => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
      {/* Add Admin Modal */}
      <Popup
        isOpen={showAddModal}
        onClose={handleAddCancel}
        title="Add Admin"
        size="modal-lg"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={handleAddCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                isAddFormValid 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleAdd}
              disabled={!isAddFormValid}
              type="button"
            >
              Add
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={newAdmin.name}
            onChange={handleAddChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={newAdmin.email}
            onChange={handleAddChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Group</label>
          <input
            type="text"
            name="group"
            value={newAdmin.group}
            onChange={handleAddChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={newAdmin.status}
            onChange={handleAddChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Active</label>
          <input
            type="datetime-local"
            name="lastActive"
            value={newAdmin.lastActive}
            onChange={handleAddChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </Popup>
      {/* Edit Modal */}
      <Popup
        isOpen={showEditModal && !!editAdmin}
        onClose={() => { setShowEditModal(false); setEditAdmin(null); }}
        title="Edit Admin"
        size="modal-lg"
        position="modal-center"
        contentClass="space-y-4"
        footer={
          <>
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => { setShowEditModal(false); setEditAdmin(null); }}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                isEditFormValid 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleUpdate}
              disabled={!isEditFormValid}
              type="button"
            >
              Update
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={editAdmin?.name || ''}
            onChange={handleEditChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={editAdmin?.email || ''}
            onChange={handleEditChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Group</label>
          <input
            type="text"
            name="group"
            value={editAdmin?.group || ''}
            onChange={handleEditChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={editAdmin?.status || 'Active'}
            onChange={handleEditChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Active</label>
          <input
            type="datetime-local"
            name="lastActive"
            value={editAdmin?.lastActive || ''}
            onChange={handleEditChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </Popup>
      {/* Delete Confirm Dialog */}
      <Confirm
        isOpen={showDeleteDialog}
        title="Confirm Delete"
        message={<span>Are you sure you want to delete <span className="font-semibold">{adminToDelete?.name}</span>?</span>}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admins; 