import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { setUserSession, removeUserSession } from '../shared/common';
import { _addWorker } from '../shared/api/workerApi';
import { _register } from '../shared/api/authApi';

export default function Register() {
  const initialState = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  };

  const [userData, setUserData] = useState(initialState);
  const [errorCode, setErrorCode] = useState(null);
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();


  const register = async (e) => {
    console.log('called bkagdgaigdagg')
    e.preventDefault();
    const registerPayload = {
      username: userData.username,
      email: userData.email,
      password: userData.password
    }

    const userPayload = {
      data: {
        username: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        employeeId: uuidv4(),
        role: 'ADMIN'
      }
    }

    try {
      const response = await _register(registerPayload);
      setUserSession(response?.data?.jwt);
      await _addWorker(userPayload);
      removeUserSession();
      navigate('/login'); 
      //TODO: add success toast
    }catch(err) {
      setErrorCode(err.response.status);
      console.log({
        message: 'user registration failed!',
        err
      })
    }
  }

  const handleChange = (e) => {
    setUserData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
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
      <h3>User Registration</h3>
      <Form noValidate validated={validated} onSubmit={register} onChange={checkValidity}>
        <Form.Group className="mb-3" controlId="formBasicFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter first name"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter last name"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter username"
            name="username"
            value={userData.username}
            onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            required
            type="email"
            placeholder="Enter email"
            name="email"
            value={userData.email}
            onChange={handleChange} />
          <Form.Text className="text-muted">
            We will never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            required 
            type="password" 
            placeholder="Password" 
            name="password"
            value={userData.password} 
            onChange={handleChange} />
        </Form.Group>
        <Button className="" variant="dark" disabled={!validated} type="submit">
          Register
        </Button>
      </Form>
      {errorCode && errorCode === 400 &&
        <p className='error'>Email or Username are already taken</p>
      }
      {errorCode && errorCode !== 400 &&
        <p className='error'>Something went wrong!! Please try again. </p>
      }
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </>
  );
}
