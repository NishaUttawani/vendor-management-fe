import React from 'react';
import './App.css';
import NavBar from './components/NabBar';
import { Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Workers from './pages/Workers';
import Login from './pages/Login';
import Contracts from './pages/Contracts';
import { AuthProvider } from './shared/authContext';
import WorkerContracts from './pages/WorkerContracts';
import { PrivateRoute } from './shared/privateRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <>
      <ErrorBoundary>
        <AuthProvider>
          <NavBar></NavBar>
          <Container className='container'>
            <Row>
              <Routes>
                <Route path="/" element={<PrivateRoute><WorkerContracts /></PrivateRoute>}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>}></Route>
                <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>}></Route>
                <Route path="*" element={<span>Page Not Found</span>}></Route>
              </Routes>
            </Row>
          </Container>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
