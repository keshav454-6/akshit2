import axios from 'axios';
import {
  DashboardAnalytics,
  Transaction,
  Alert,
  Investigation,
  ModelMetrics,
  User,
  AlertUpdate,
  InvestigationCreate,
  InvestigationUpdate,
} from '../types';

const getApiBaseUrl = () => {
  // If running in Vercel or Node runtime with injected service binding
  const processEnv = (globalThis as any)?.process?.env;
  if (processEnv?.BACKEND_URL) {
    return `${processEnv.BACKEND_URL}/api/v1`;
  }
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    // If accessing on a public domain (Vercel, ngrok, custom domain)
    if (window.location.hostname.includes('.') && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return '/api/v1';
    }
    // If accessing via LAN IP
    if (window.location.hostname && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000/api/v1`;
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fraudguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    register: async (userData: { email: string; password: string; full_name: string; role?: string }) => {
      const res = await apiClient.post('/auth/register', userData);
      return res.data;
    },
    me: async (): Promise<User> => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
  },

  // Dashboard
  dashboard: {
    getAnalytics: async (): Promise<DashboardAnalytics> => {
      const res = await apiClient.get('/dashboard/analytics');
      return res.data;
    },
  },

  // Transactions
  transactions: {
    list: async (params?: { skip?: number; limit?: number; risk_category?: string; search?: string }): Promise<Transaction[]> => {
      const res = await apiClient.get('/transactions', { params });
      return res.data;
    },
    getById: async (id: string): Promise<Transaction> => {
      const res = await apiClient.get(`/transactions/${id}`);
      return res.data;
    },
    analyze: async (txnData: any) => {
      const res = await apiClient.post('/transactions/analyze', txnData);
      return res.data;
    },
    bulkUpload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/transactions/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  },

  // Alerts
  alerts: {
    list: async (params?: { skip?: number; limit?: number; status?: string; priority?: string }): Promise<Alert[]> => {
      const res = await apiClient.get('/alerts', { params });
      return res.data;
    },
    getById: async (id: string): Promise<Alert> => {
      const res = await apiClient.get(`/alerts/${id}`);
      return res.data;
    },
    update: async (id: string, data: AlertUpdate): Promise<Alert> => {
      const res = await apiClient.patch(`/alerts/${id}`, data);
      return res.data;
    },
  },

  // Investigations
  investigations: {
    list: async (params?: { skip?: number; limit?: number; status?: string }): Promise<Investigation[]> => {
      const res = await apiClient.get('/investigations', { params });
      return res.data;
    },
    getById: async (id: string): Promise<Investigation> => {
      const res = await apiClient.get(`/investigations/${id}`);
      return res.data;
    },
    create: async (data: InvestigationCreate): Promise<Investigation> => {
      const res = await apiClient.post('/investigations', data);
      return res.data;
    },
    update: async (id: string, data: InvestigationUpdate): Promise<Investigation> => {
      const res = await apiClient.patch(`/investigations/${id}`, data);
      return res.data;
    },
  },

  // Live Simulator
  simulator: {
    start: async (interval: number = 2.0) => {
      const res = await apiClient.post('/simulator/start', null, { params: { interval } });
      return res.data;
    },
    stop: async () => {
      const res = await apiClient.post('/simulator/stop');
      return res.data;
    },
    getStatus: async () => {
      const res = await apiClient.get('/simulator/status');
      return res.data;
    },
  },

  // AI Model
  model: {
    getMetrics: async (): Promise<ModelMetrics> => {
      const res = await apiClient.get('/model/metrics');
      return res.data;
    },
  },

  // Health
  health: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Android Mobile Downloads
  download: {
    getInfo: async () => {
      const res = await apiClient.get('/download/info');
      return res.data;
    },
    getApkUrl: () => `${API_BASE_URL}/download/android-build`,
    getSourceUrl: () => `${API_BASE_URL}/download/android-source`,
  },
};

