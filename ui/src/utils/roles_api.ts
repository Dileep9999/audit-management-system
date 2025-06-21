import axios from './axios_api';

// Roles API
export const fetchRoles = (params = {}) =>
  axios.get('/api/roles/roles/', { params });

export const fetchRole = (id: number) =>
  axios.get(`/api/roles/roles/${id}/`);

export const createRole = (data: any) =>
  axios.post('/api/roles/roles/', data);

export const updateRole = (id: number, data: any) =>
  axios.put(`/api/roles/roles/${id}/`, data);

export const deleteRole = (id: number) =>
  axios.delete(`/api/roles/roles/${id}/`);

export const reorderRoles = (orderData: any[]) =>
  axios.post('/api/roles/roles/reorder/', orderData);

export const duplicateRole = (id: number) =>
  axios.post(`/api/roles/roles/${id}/duplicate/`);

export const toggleRoleStatus = (id: number) =>
  axios.post(`/api/roles/roles/${id}/toggle_status/`);

// Permissions API
export const fetchPermissionCategories = () =>
  axios.get('/api/roles/permissions/categories/'); 