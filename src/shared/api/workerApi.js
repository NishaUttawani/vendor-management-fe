import axiosClient from './apiClient';

const endPoint = '/app-users';

export function _getWorkers(filter) {
  const _filter = filter ? '?' + filter: '';
  return axiosClient.get(endPoint + _filter)
}

export function _addWorker(payload) {
  return axiosClient.post(endPoint, payload)
}

export function _deleteWorker(id) {
  return axiosClient.delete(endPoint + '/' + id)
}

export function _updateWorker(id, payload) {
  return axiosClient.put(endPoint + '/' + id, payload)
}