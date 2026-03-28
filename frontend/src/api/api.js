import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  officerDepartmentMembers: () => api.get('/auth/officer/department-members'),
};

export const users = {
  list: (params) => api.get('/users', { params }),
  createOfficer: (data) => api.post('/users/officers', data),
  profile: () => api.get('/users/profile'),
};

export const requests = {
  my: (params) => api.get('/requests/my', { params }),
  all: (params) => api.get('/requests', { params }),
  get: (id) => api.get(`/requests/${id}`),
  addComment: (id, text) => api.post(`/requests/${id}/comments`, { text }),

  createComplaint: (formData) =>
    api.post('/requests/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createDocument: (data) =>
    api.post('/requests/documents', data),

  predictComplaintType: (data) =>
    api.post('/requests/predict/complaint-type', data),

  predictDocumentType: (data) =>
    api.post('/requests/predict/document-type', data),

  departmentTasks: () => api.get('/requests/department/tasks'),

  updateTask: (taskId, data) =>
    api.patch(`/requests/tasks/${taskId}`, data),

  archiveTask: (taskId) =>
    api.patch(`/requests/tasks/${taskId}/archive`),

  unarchiveTask: (taskId) =>
    api.patch(`/requests/tasks/${taskId}/unarchive`),

  updateStage: (id, data) =>
    api.patch(`/requests/${id}/stage`, data),

  generateCertificate: (id) =>
    api.post(`/requests/${id}/generate-certificate`),

  analytics: () => api.get('/requests/analytics'),

  complaintAnalytics: () => api.get('/requests/analytics/complaints'),

  documentAnalytics: () => api.get('/requests/analytics/documents'),

  deleteRequest: (id) =>
    api.delete(`/requests/${id}`),
};

export const departments = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
};

export const certificates = {
  getByRequest: (requestId) =>
    api.get(`/certificates/request/${requestId}`),

  download: async (requestId) => {
    console.log("Download function triggered", requestId);
    const res = await api.get(
      `/requests/${requestId}/download-certificate`,
      {
        responseType: 'blob',
        validateStatus: () => true,
      }
    );
  
    const contentType = res.headers?.['content-type'] || '';
  
    if (
      res.status >= 400 ||
      contentType.includes('application/json') ||
      contentType.includes('text/html')
    ) {
      const text = await res.data.text();
  
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || 'Download failed.');
      } catch {
        throw new Error(text || 'Download failed.');
      }
    }
  
    const blob =
      res.data instanceof Blob
        ? res.data
        : new Blob([res.data], { type: 'application/pdf' });
  
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${requestId}.pdf`;
  
    document.body.appendChild(a);
    a.click();
    a.remove();
  
    window.URL.revokeObjectURL(url);
  },
};

export const config = {
  get: () => api.get('/config'),
};

export default api;