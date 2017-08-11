import axios from 'axios';
import { getBasePath } from '../shared/util/url-util';
import Storage from '../shared/util/storage-util';

const TIMEOUT = 1000000; // 10000
const setupAxiosInterceptors = (onUnauthenticated, clearAuthToken) => {
  const onRequestSuccess = config => {
    const token = Storage.local.get('jhi-authenticationToken') || Storage.session.get('jhi-authenticationToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.timeout = TIMEOUT;
    config.url = `${getBasePath().replace(/\/$/, '')}${config.url}`;
    return config;
  };
  const onResponseSuccess = response => response;
  const onResponseError = err => {
    const status = err.status || err.response.status;
    if (status === 403 || status === 401) {
      clearAuthToken();
      onUnauthenticated();
    }
    return Promise.reject(err);
  };
  axios.interceptors.request.use(onRequestSuccess);
  axios.interceptors.response.use(onResponseSuccess, onResponseError);
};

export default setupAxiosInterceptors;
