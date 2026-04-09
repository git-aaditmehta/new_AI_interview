import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/interviews/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  createInterview: async (payload) => {
    const { data } = await api.post('/interviews/', payload);
    return data;
  },

  getResults: async (id) => {
    const { data } = await api.get(`/interviews/${id}`);
    return data;
  },

  getWSUrl: (id) => `ws://127.0.0.1:8000/ws/interview/${id}`,
};
