import axios from "axios";
import { TransformPreviewResponse, InsightsRequest, InsightsResponse } from "../types";

const API_BASE_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/upload/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getRevenue = async (rangeDays: number = 30) => {
  const response = await apiClient.get('/stats/revenue', {
    params: { range: rangeDays },
  });
  return response.data;
};

export const getSalesByCategory = async () => {
  const response = await apiClient.get('/stats/by-category');
  return response.data;
};

export const getCustomerStats = async () => {
  const response = await apiClient.get('/stats/customers');
  return response.data;
};

export const getForecast = async (period: number = 30) => {
  const response = await apiClient.get('/stats/forecast', {
    params: { period },
  });
  return response.data;
};

export const getAnomalies = async (rangeDays: number = 90) => {
  const response = await apiClient.get('/stats/anomalies', {
    params: { range_days: rangeDays },
  });
  return response.data;
};

export interface SearchSalesParams {
  category?: string;
  customer_id?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
  offset?: number;
}

export const searchSales = async (params: SearchSalesParams = {}) => {
  const response = await apiClient.get('/sales/search', { params });
  return response.data;
};

export const exportSales = async (params: SearchSalesParams = {}) => {
  const response = await apiClient.get('/sales/export', {
    params,
    responseType: 'blob',
  });
  
  // create a download link and trigger it
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // try to get filename from response headers, fallback to default
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'sales_export.csv';
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true, filename };
};

export const generateInsights = async (request: InsightsRequest): Promise<InsightsResponse> => {
  const response = await apiClient.post('/ai/insights', request);
  return response.data;
};

export const previewTransform = async (
  file: File,
  renameColumns?: Record<string, string>,
  mapCategories?: Record<string, string>,
  computedFields?: Record<string, string>
): Promise<TransformPreviewResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (renameColumns && Object.keys(renameColumns).length > 0) {
    formData.append('rename_columns', JSON.stringify(renameColumns));
  }
  
  if (mapCategories && Object.keys(mapCategories).length > 0) {
    formData.append('map_categories', JSON.stringify(mapCategories));
  }
  
  if (computedFields && Object.keys(computedFields).length > 0) {
    formData.append('computed_fields', JSON.stringify(computedFields));
  }
  
  const response = await apiClient.post('/transform/preview', formData, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
