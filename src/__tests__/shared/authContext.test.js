import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../shared/authContext';

describe('AuthContext', () => {
  const TestComponent = () => {
    const { user, login, logout } = useAuth();

    return (
      <>
        <div data-testid="username">{user?.name || 'Guest'}</div>
        <button data-testid="login" onClick={() => login({ name: 'Test User' })}>
          Login
        </button>
        <button data-testid="logout" onClick={logout}>
          Logout
        </button>
      </>
    );
  };

  it('should render the AuthProvider and useAuth correctly', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('username')).toHaveTextContent('Guest');
    fireEvent.click(getByTestId('login'));
    expect(getByTestId('username')).toHaveTextContent('Test User');
    fireEvent.click(getByTestId('logout'));
    expect(getByTestId('username')).toHaveTextContent('Guest');
  });
});
