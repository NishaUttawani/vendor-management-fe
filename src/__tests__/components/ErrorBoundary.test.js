import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error is present', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(getByText('Hello World')).toBeInTheDocument();
  });

  xit('renders an error message when an error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test Error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something Went Wrong !')).toBeInTheDocument();
  });
});
