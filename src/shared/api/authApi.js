import axios from 'axios';
import { getBaseUrl } from '../common';

const endPoint = '/auth/local';

export function _login(payload) {
  return axios.post(`${getBaseUrl()}${endPoint}`, payload)
}

export function _register(payload) {
  return axios.post(`${getBaseUrl()}${endPoint}/register`, payload)
}