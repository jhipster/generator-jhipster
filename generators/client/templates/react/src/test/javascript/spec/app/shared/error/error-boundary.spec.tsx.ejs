import React from 'react';
import { shallow, mount } from 'enzyme';

import ErrorBoundary from 'app/shared/error/error-boundary';

const ErrorComp = () => {
  throw new Error('test');
};

describe('error component', () => {

  beforeEach(() => {

    // ignore console and jsdom errors
    jest.spyOn((window as any)._virtualConsole, 'emit').mockImplementation(() => false);
    jest.spyOn((window as any).console, 'error').mockImplementation(() => false);
  });

  it('Should throw an error when componnet is not enclosed in Error Boundary', () => {
    expect(() => shallow(<ErrorComp />)).toThrow(Error);
  });

  it('Should call Error Boundary componentDidCatch method', () => {
    const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    mount(
      <ErrorBoundary>
        <ErrorComp />
      </ErrorBoundary>
    );
    expect(spy).toHaveBeenCalled();
  });
});
