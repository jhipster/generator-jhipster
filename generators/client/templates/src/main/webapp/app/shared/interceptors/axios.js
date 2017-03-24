import axios from 'axios';
import { logError } from '../util/log-util';

const TIMEOUT = 10000;
const setupAxiosInterceptors = (onUnauthenticated, clearAuthToken) => {
  const onRequestSuccess = (config) => {
    <%_ if (authenticationType === 'oauth2') { _%>
    const token = localStorage.getItem('jhi-authenticationToken') || sessionStorage.getItem('jhi-authenticationToken');
    if (token && token.expires_at && token.expires_at > new Date().getTime()) {
      config.headers.Authorization = `Bearer ${token.access_token}`;
    }
    <%_ } else if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    const token = localStorage.getItem('jhi-authenticationToken') || sessionStorage.getItem('jhi-authenticationToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    <%_ } _%>
    config.timeout = TIMEOUT;
    return config;
  };
  const onResponseSuccess = response => response;
  const onResponseError = (err) => {
    logError(err);
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
