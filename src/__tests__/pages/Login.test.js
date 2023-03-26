import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { setUserSession } from '../../shared/common';
import { _getWorkers } from '../../shared/api/workerApi';
import { _login } from '../../shared/api/authApi';
import Login from '../../pages/Login';

const mockNavigate = jest.fn();
const mockLocation = jest.fn();
const mockLogin = jest.fn();

jest.mock('../../shared/authContext', () => ({
  useAuth: () => ({
    user: 'user',
    login: mockLogin,
  }),
}));

jest.mock('../../shared/common', () => ({
  setUserSession: jest.fn(),
}));

jest.mock('../../shared/api/workerApi', () => ({
  _getWorkers: jest.fn(),
}));

jest.mock('../../shared/api/authApi', () => ({
  _login: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

describe('Login component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with email and password fields', () => {
    render(<Login />);

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('disables the submit button initially', () => {
    render(<Login />);

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button after both email and password fields are filled', () => {
    render(<Login />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('calls _login and setUserSession when the form is submitted with valid credentials', async () => {
    const response = {
      data: {
        jwt: 'token',
      },
    };

    const getWorkersResponse = {
      data: {
        data: [
          {
            id: '1',
            attributes: {
              firstName: 'John Doe',
              username: 'test@test.com',
            },
          },
        ],
      },
    };

    _login.mockResolvedValue(response);
    _getWorkers.mockResolvedValue(getWorkersResponse);

    render(<Login />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(_login).toHaveBeenCalledWith({
        identifier: 'test@test.com',
        password: 'password',
      });
      expect(_getWorkers).toHaveBeenCalledWith('filters[username]=test@test.com');
      expect(setUserSession).toHaveBeenCalledWith('token');
    });
  });

  it('displays an error message when the form is submitted with invalid credentials', async () => {

    const errorResponse = {
      response: {
        status: 400,
      },
    };
    _login.mockRejectedValue(errorResponse);

    render(<Login />);
  
    await act(async () => {
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Submit');
  
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(_login).toHaveBeenCalledWith({
        identifier: 'test@test.com',
        password: 'password',
      });
      expect(_getWorkers).not.toHaveBeenCalled();
      expect(setUserSession).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid email or password. Please try again with correct details')).toBeInTheDocument();
    });
  });

  it('displays an error message when the logins fails', async () => {

    const errorResponse = {
      response: {
        status: 500,
      },
    };
    _login.mockRejectedValue(errorResponse);

    render(<Login />);
  
    await act(async () => {
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Submit');
  
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(_login).toHaveBeenCalledWith({
        identifier: 'test@test.com',
        password: 'password',
      });
      expect(_getWorkers).not.toHaveBeenCalled();
      expect(setUserSession).not.toHaveBeenCalled();
      expect(screen.getByText('Something went wrong!!. Please try again.')).toBeInTheDocument();
    });
  });

});