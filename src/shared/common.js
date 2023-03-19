// return the token from the session storage
export const getToken = () => {
  return sessionStorage.getItem('token') || null;
}

// remove the token and user from the session storage
export const removeUserSession = () => {
  sessionStorage.removeItem('token');
}

// set the token and user from the session storage
export const setUserSession = (token) => {
  sessionStorage.setItem('token', token);
}

// get API baseURL
export const getBaseUrl = () => {
  let url = '';
  if(process.env.NODE_ENV === 'development') {
    url = `${process.env.REACT_APP_BASE_URL}/api`
  } else if(process.env.NODE_ENV === 'production') {
    url = `${process.env.REACT_APP_BASE_URL}/api`
  }
  return url;
}