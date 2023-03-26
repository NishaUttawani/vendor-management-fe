import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, errorInfo) {
    console.error(err);
    console.error(errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something Went Wrong !</div>;
    }

    return this.props.children;
  }
}
