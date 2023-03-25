import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { setUserSession } from '../shared/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../shared/authContext';
import { _getWorkers } from '../shared/api/workerApi';
import { _login } from '../shared/api/authApi';

export default function Login() {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [errorCode, setErrorCode] = useState();
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.path || '/';

  const auth = useAuth();

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await _login({
        identifier: username,
        password
      });
      setUserSession(response.data.jwt);
      getOwnerDetails();
    } catch(err) {
      console.log('logi failed!!');
      setErrorCode(err.response.status);
      setPassword('');

    }
  }

  const getOwnerDetails = async () => {
    try {
      const response = await _getWorkers(`filters[username]=${username}`);
      const user = {
        id: response.data.data[0].id,
        ...response.data.data[0].attributes
      }
      auth.login(user);
      navigate(redirectPath);
    } catch(err) {
      console.log({
        message: 'get owner details failed!!',
        err
      })
    }
  }

  const checkValidity = (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(false);
      e.preventDefault();
      e.stopPropagation();
    } else {
      setValidated(true);
    }
  }


  return (
    <>
      <h3>User Login</h3>
      <Form noValidate validated={validated} onSubmit={login} onChange={checkValidity}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            required
            type="email"
            placeholder="Enter email"
            value={username}
            onChange={(e) => setUserName(e.target.value)} />
          <Form.Text className="text-muted">
            We will never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button className="" variant="dark" disabled={!validated} type="submit">
          Submit
        </Button>
      </Form>
      {errorCode && errorCode === 400 &&
        <p className='error'>Invalid email or password. Please try again with correct details</p>
      }
      {errorCode && errorCode !== 400 &&
        <p className='error'>Something went wrong!!. Please try again. </p>
      }
    </>
  );
}
