import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear it
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);

// Items
export const getItems = (params) => api.get('/items', { params });
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (formData) => api.post('/items', formData);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const toggleItemAvailability = (id) => api.patch(`/items/${id}/toggle`);
export const getCategories = () => api.get('/items/categories/all');

// Reservations
export const getMyReservations = () => api.get('/reservations/my');
export const createReservation = (data) => api.post('/reservations', data);
export const approveReservation = (id, notes) =>
  api.patch(`/reservations/${id}/approve`, { lender_notes: notes });
export const rejectReservation = (id, notes) =>
  api.patch(`/reservations/${id}/reject`, { lender_notes: notes });

// Stats
export const getStats = () => api.get('/items/stats/all');
