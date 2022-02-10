import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';

import ErrorBoundaryRoute from './error-boundary-route';

const ErrorComp = () => {
  throw new Error('test');
};

describe('error-boundary-route component', () => {
  beforeEach(() => {
    // ignore console and jsdom errors
    jest.spyOn((window as any)._virtualConsole, 'emit').mockImplementation(() => false);
    jest.spyOn((window as any).console, 'error').mockImplementation(() => false);
  });

  // All tests will go here
  it('Should throw error when no component is provided', () => {
    expect(() => render(<ErrorBoundaryRoute />)).toThrow(Error);
  });

  it('Should render fallback component when an uncaught error is thrown from component', () => {
    const history = createMemoryHistory();
    const { container } = render(
      <Router history={history}>
        <ErrorBoundaryRoute component={ErrorComp} path="/" />
      </Router>
    );
    expect(container.innerHTML).toEqual('<div><h2 class="error">An unexpected error has occurred.</h2></div>');
  });
});
