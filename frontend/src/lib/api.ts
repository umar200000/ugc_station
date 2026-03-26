import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

function getTokenKey() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user') || 'default';
  return `token_${userId}`;
}

// Token ni har so'rovga qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(getTokenKey());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
