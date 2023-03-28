import React from 'react';
import { render, screen, fireEvent, waitFor, act, userEvent } from '@testing-library/react';
import Register from '../../pages/Register';
import { setUserSession, removeUserSession } from '../../shared/common';
import { _addWorker } from '../../shared/api/workerApi';
import { _register } from '../../shared/api/authApi';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: jest.fn(({ children, to }) => <a href={to}>{children}</a>),
}));

jest.mock('../../shared/api/workerApi', () => ({
  _addWorker: jest.fn(),
}));

jest.mock('../../shared/api/authApi', () => ({
  _register: jest.fn(),
}));

jest.mock('../../shared/common', () => ({
  setUserSession: jest.fn(),
  removeUserSession: jest.fn(),
}));

describe('Register', () => {
  beforeEach(() => {
    render(<Register />);
  });

  it('should render registration form', async () => {
    expect(screen.getByText('User Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('should submit registration form successfully', async () => {
    const response = {
      data: {
        jwt: 'sometoken'
      }
    }

    _register.mockResolvedValue(response);
    _addWorker.mockResolvedValue({data: null});

    act(() => {
      const firstName = screen.getByLabelText('First Name');
      const lastName = screen.getByLabelText('Last Name');
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('Email address');
      const password = screen.getByLabelText('Password');
      const registerButtton = screen.getByText('Register');

      fireEvent.change(firstName, { target: { value: 'John' } });
      fireEvent.change(lastName, { target: { value: 'Doe' } });
      fireEvent.change(username, { target: { value: 'johndoes' } });
      fireEvent.change(email, { target: { value: 'johndoe@example.com' } });
      fireEvent.change(password, { target: { value: 'password' } });
      fireEvent.click(registerButtton);
    });

    await waitFor(() => {
      expect(_register).toHaveBeenCalledWith({
        username: 'johndoes',
        email: 'johndoe@example.com',
        password: 'password',
      });
      expect(setUserSession).toHaveBeenCalledWith('sometoken');
      expect(_addWorker).toHaveBeenCalledWith({
        data: {
          username: 'johndoe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          employeeId: expect.any(String),
          role: 'ADMIN',
        },
      });
      expect(removeUserSession).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show error message on invalid registration form submission | 400', async () => {
    const errorResponse = {
      response: {
        status: 400,
      },
    };
    _register.mockRejectedValue(errorResponse);

    act(() => {
      const firstName = screen.getByLabelText('First Name');
      const lastName = screen.getByLabelText('Last Name');
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('Email address');
      const password = screen.getByLabelText('Password');
      const registerButtton = screen.getByText('Register');

      fireEvent.change(firstName, { target: { value: 'John' } });
      fireEvent.change(lastName, { target: { value: 'Doe' } });
      fireEvent.change(username, { target: { value: 'johndoes' } });
      fireEvent.change(email, { target: { value: 'johndoe@example.com' } });
      fireEvent.change(password, { target: { value: 'password' } });
      fireEvent.click(registerButtton);
    });

    await waitFor(() => {
      expect(_register).toHaveBeenCalledWith({
        username: 'johndoes',
        email: 'johndoe@example.com',
        password: 'password',
      });
      expect(setUserSession).not.toHaveBeenCalled();
      expect(_addWorker).not.toHaveBeenCalled();
      expect(removeUserSession).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      expect(screen.getByText('Email or Username are already taken')).toBeInTheDocument();
    });
  });

  it('should show error message on invalid registration form submission | 500', async () => {
    const errorResponse = {
      response: {
        status: 500,
      },
    };
    _register.mockRejectedValue(errorResponse);

    act(() => {
      const firstName = screen.getByLabelText('First Name');
      const lastName = screen.getByLabelText('Last Name');
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('Email address');
      const password = screen.getByLabelText('Password');
      const registerButtton = screen.getByText('Register');

      fireEvent.change(firstName, { target: { value: 'John' } });
      fireEvent.change(lastName, { target: { value: 'Doe' } });
      fireEvent.change(username, { target: { value: 'johndoes' } });
      fireEvent.change(email, { target: { value: 'johndoe@example.com' } });
      fireEvent.change(password, { target: { value: 'password' } });
      fireEvent.click(registerButtton);
    });

    await waitFor(() => {
      expect(_register).toHaveBeenCalledWith({
        username: 'johndoes',
        email: 'johndoe@example.com',
        password: 'password',
      });
      expect(setUserSession).not.toHaveBeenCalled();
      expect(_addWorker).not.toHaveBeenCalled();
      expect(removeUserSession).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      expect(screen.getByText('Something went wrong!! Please try again.')).toBeInTheDocument();
    });
  });
});