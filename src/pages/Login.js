import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { setUserSession, getBaseUrl, getToken } from '../shared/common';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '../shared/authContext';

export default function Login() {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [errorCode, setErrorCode] = useState();
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.path || '/';

  const auth = useAuth();

  const login = (e) => {
    e.preventDefault();
    axios.post(`${getBaseUrl()}/auth/local`, {
      identifier: username,
      password
    })
      .then(response => {
        setUserSession(response.data.jwt);
        getOwnerDetails();
      })
      .catch(err => {
        setErrorCode(err.response.status);
        setPassword('');
      });
  }

  const getOwnerDetails = () => {
    axios.get(`${getBaseUrl()}/app-users?filters[username]=${username}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(response => {
        const user = {
          id: response.data.data[0].id,
          ...response.data.data[0].attributes
        }
        auth.login(user);
        navigate(redirectPath);
      })
      .catch(err => console.log(err))
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
