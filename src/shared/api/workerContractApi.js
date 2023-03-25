import axiosClient from './apiClient.js';

const endPoint = '/worker-service-contracts';

export function _getWorkerContracts(populate, filter) {
  const _populate = populate ? '?populate=*' : '';
  let _filter = filter ? filter: '';
  if(populate && filter) {
    _filter = '&' + _filter;
  } else if(filter){
    _filter = '?' + _filter;
  }
  
  return axiosClient.get(endPoint + _populate + _filter )
}

export function _addWorkerContract(payload) {
  return axiosClient.post(endPoint, payload)
}

export function _deleteWorkerContract(id) {
  return axiosClient.delete(endPoint + '/' + id)
}

export function _updateWorkerContract(id, payload) {
  return axiosClient.put(endPoint + '/' + id, payload)
}