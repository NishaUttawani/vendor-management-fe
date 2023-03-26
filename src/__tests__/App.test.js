import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App component', () => {
  it('renders login page by default', async () => {
    // render(
    //   <MemoryRouter initialEntries={['/login']}>
    //     <App />
    //   </MemoryRouter>
    // );

    // await waitFor(() => {
    //   expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    //   expect(screen.getByLabelText('Password')).toBeInTheDocument();
    // });
  });
  //add more test cases for all routes
});
