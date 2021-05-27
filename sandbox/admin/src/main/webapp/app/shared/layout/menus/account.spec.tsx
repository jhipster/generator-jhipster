/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { AccountMenu } from './account';

describe('AccountMenu', () => {
  let mountedWrapper;

  const authenticatedWrapper = () => {
    if (!mountedWrapper) {
      const history = createMemoryHistory();
      const { container } = render(
        <Router history={history}>
          <AccountMenu isAuthenticated />
        </Router>
      );
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };
  const guestWrapper = () => {
    if (!mountedWrapper) {
      const history = createMemoryHistory();
      const { container } = (mountedWrapper = render(
        <Router history={history}>
          <AccountMenu />
        </Router>
      ));
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here

  it('Renders a authenticated AccountMenu component', () => {
    const html = authenticatedWrapper();

    expect(html).not.toContain('/login');
    expect(html).toContain('/logout');
  });

  it('Renders a guest AccountMenu component', () => {
    const html = guestWrapper();

    expect(html).toContain('/login');
    expect(html).not.toContain('/logout');
  });
});
