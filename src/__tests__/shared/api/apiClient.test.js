import axiosClient from '../../../shared/api/apiClient';
import { getBaseUrl, setUserSession } from '../../../shared/common';

describe('apiClient', () => {
  test('baseURL is set correctly', () => {
    expect(axiosClient.defaults.baseURL).toEqual(getBaseUrl());
  });

  test('headers are set correctly', () => {
    console.log(axiosClient.defaults.headers)
    expect(axiosClient.defaults.headers.Accept).toEqual('application/json');
    expect(axiosClient.defaults.headers['Content-Type']).toEqual('application/json');
  });

  test('Authorization header is added when there is a token', async () => {
    const token = 'test-token';
    setUserSession(token); // Set the token in storage
    axiosClient.interceptors.request.use(
      (config) => {
        expect(setUserSession).toHaveBeenCalled();
        expect(config.headers.Authorization).toEqual(`Bearer ${token}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  });
})
