import axios from 'axios';
import { getBaseUrl, getToken } from '../common';

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});


axiosClient.interceptors.request.use(
  (config) => {
    // Get the token from storage
    const token = getToken();
    if (token) {
      // Update the headers with the new token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;