import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

import { AuthProvider } from './shared/authContext';
import { PrivateRoute } from './shared/privateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';
import { removeUserSession } from './shared/common';
import Register from './pages/Register';

const Login = React.lazy(() => import('./pages/Login'));
const Contracts = React.lazy(() => import('./pages/Contracts'));
const Workers = React.lazy(() => import('./pages/Workers'));
const WorkerContracts = React.lazy(() => import('./pages/WorkerContracts'));

function App() {
  useEffect(() => {
    removeUserSession()
  }, []);

  return (
    <>
      <ErrorBoundary>
        <AuthProvider>
          <NavBar></NavBar>
          <Container className='container'>
            <Row>
              <React.Suspense fallback={<div className='spinner-container'><Spinner animation="grow" /></div>}>
                <Routes>
                  <Route path="/login" element={<Login />}></Route>
                  <Route path="/register" element={<Register />}></Route>
                  <Route path="/wokercontracts" element={<PrivateRoute><WorkerContracts /></PrivateRoute>}></Route>
                  <Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>}></Route>
                  <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>}></Route>
                  <Route path="/" element={<Navigate to="/wokercontracts" />} />
                  <Route path="*" element={<span>Page Not Found</span>}></Route>
                </Routes>
              </React.Suspense>
            </Row>
          </Container>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
