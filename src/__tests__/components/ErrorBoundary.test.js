import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

describe('ErrorBoundary component', () => {
  it('renders children when no error is present', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );
    expect(getByText('Child component')).toBeInTheDocument();
  });

  // it('renders an error message when an error is present', () => {
  //   const { getByText } = render(
  //     <ErrorBoundary>
  //       <ChildComponent />
  //     </ErrorBoundary>
  //   );
  //   const error = new Error('Something went wrong!');
  //   console.error = jest.fn();
  //   jest.spyOn(console, 'error');
  //   const childComponent = getByText('Child component');
  //   childComponent.dispatchEvent(new Event('error', { error }));
  //   expect(console.error).toHaveBeenCalledWith(error);
  //   expect(getByText('Something Went Wrong !')).toBeInTheDocument();
  // });
});

function ChildComponent() {
  return <div>Child component</div>;
}
