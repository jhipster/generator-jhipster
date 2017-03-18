import axios from 'axios';

const TIMEOUT = 1000000; // 10000
const setupAxiosInterceptors = (onUnauthenticated, clearAuthToken) => {
  const onRequestSuccess = (config) => {
    const token = localStorage.getItem('authenticationToken') || sessionStorage.getItem('authenticationToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.timeout = TIMEOUT;
    return config;
  };
  const onResponseSuccess = response => response;
  const onResponseError = (error) => {
    console.log(error); // TODO remove
    if (error.status === 403 || error.status === 401) {
      clearAuthToken();
      onUnauthenticated();
    }
    return Promise.reject(error);
  };
  axios.interceptors.request.use(onRequestSuccess);
  axios.interceptors.response.use(onResponseSuccess, onResponseError);
};

export default setupAxiosInterceptors;
