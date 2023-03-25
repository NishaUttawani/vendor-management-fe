import axios from 'axios';
import { getBaseUrl, getToken } from '../common';

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
});

export default axiosClient;