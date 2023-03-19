import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../shared/authContext';
import NavBar from '../../components/NavBar';
import { removeUserSession } from '../../shared/common';

jest.mock('../../shared/common', () => ({
  removeUserSession: jest.fn()
}));

describe('NavBar component', () => {
  it('renders the brand name', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthProvider>
    );
    const brandElement = screen.getByText('VendorWise');
    expect(brandElement).toBeInTheDocument();
  });

  // it('should render correctly with logged in user', () => {
  //   const user = { username: 'testuser' };
  //   const logoutMock = jest.fn();
  //   render(
  //     <AuthProvider value={{ user, logout: logoutMock }}>
  //       <MemoryRouter>
  //         <NavBar />
  //       </MemoryRouter>
  //     </AuthProvider>
  //   );

  //   expect(screen.getByText('VendorWise')).toBeInTheDocument();
  //   expect(screen.getByText('Workers')).toBeInTheDocument();
  //   expect(screen.getByText('Contracts')).toBeInTheDocument();
  //   expect(screen.getByText('Logout')).toBeInTheDocument();

  //   fireEvent.click(screen.getByText('Logout'));

  //   expect(logoutMock).toHaveBeenCalledTimes(1);
  // });
});
