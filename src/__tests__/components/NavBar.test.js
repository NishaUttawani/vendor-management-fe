import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../../components/NavBar';

jest.mock('../../shared/common', () => ({
  removeUserSession: jest.fn(),
}));
const mockLogout = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../../shared/authContext', () => ({
  useAuth: () => ({
    user: 'user',
    logout: mockLogout,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('NavBar component', () => {
  it('renders the brand name', () => {
    render(<NavBar />);
    const brandElement = screen.getByText('VendorWise');
    expect(brandElement).toBeInTheDocument();
  });

  it('should render correctly with logged in user', () => {

    render(
      <NavBar />
    );

    expect(screen.getByText('VendorWise')).toBeInTheDocument();
    expect(screen.getByText('Workers')).toBeInTheDocument();
    expect(screen.getByText('Contracts')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Logout'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
