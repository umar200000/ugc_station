import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// URL dan user parametrni bir marta o'qib, sessionStorage ga saqlash
function getTokenKey() {
  const urlParams = new URLSearchParams(window.location.search);
  const userFromUrl = urlParams.get('user');
  if (userFromUrl) {
    sessionStorage.setItem('dev_user_key', userFromUrl);
  }
  const userId = userFromUrl || sessionStorage.getItem('dev_user_key') || 'default';
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
