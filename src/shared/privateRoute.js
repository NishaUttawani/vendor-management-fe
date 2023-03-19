import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

export const PrivateRoute = (props) => {
  const location = useLocation();
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/login" state={{ path: location.pathname }} />;
  }
  return <>{props.children}</>;
};
