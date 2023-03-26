import { getToken, removeUserSession, setUserSession, getBaseUrl } from '../../shared/common';

describe('Session Utils', () => {
  describe('getToken', () => {
    it('should return null if token is not present in session storage', () => {
      sessionStorage.removeItem('token');
      expect(getToken()).toBeNull();
    });

    it('should return the token if it is present in session storage', () => {
      const token = 'myToken';
      sessionStorage.setItem('token', token);
      expect(getToken()).toEqual(token);
    });
  });

  describe('removeUserSession', () => {
    it('should remove the token from session storage', () => {
      const token = 'myToken';
      sessionStorage.setItem('token', token);
      removeUserSession();
      expect(sessionStorage.getItem('token')).toBeNull();
    });
  });

  describe('setUserSession', () => {
    it('should set the token in session storage', () => {
      const token = 'myToken';
      setUserSession(token);
      expect(sessionStorage.getItem('token')).toEqual(token);
    });
  });

  describe('getBaseUrl', () => {
    it('should return the development base URL when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_BASE_URL = 'http://localhost:3000';
      expect(getBaseUrl()).toEqual('http://localhost:3000/api');
    });

    it('should return the production base URL when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_BASE_URL = 'https://myapp.com';
      expect(getBaseUrl()).toEqual('https://myapp.com/api');
    });
  });
});
