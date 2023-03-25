import axiosClient from './apiClient';

const endPoint = '/service-contracts';

export function _getContracts(filter) {
  const _filter = filter ? '?'+filter: '';
  return axiosClient.get(endPoint + _filter)
}

export function _addContract(payload) {
  return axiosClient.post(endPoint, payload)
}

export function _deleteContract(id) {
  return axiosClient.delete(endPoint + '/' + id)
}

export function _updateContract(id, payload) {
  return axiosClient.put(endPoint + '/' + id, payload)
}