import React from 'react';
import { Route } from 'react-router-dom';
import { shallow, mount } from 'enzyme';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

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
    expect(() => shallow(<ErrorBoundaryRoute />)).toThrow(Error);
  });

  it('Should render fallback component when an uncaught error is thrown from component', () => {
    const route = shallow(<ErrorBoundaryRoute component={ErrorComp} path="/" />);
    const renderedRoute = route.find(Route);
    expect(renderedRoute.length).toEqual(1);
    expect(renderedRoute.props().path).toEqual('/');
    expect(renderedRoute.props().render).toBeDefined();
    const renderFn: Function = renderedRoute.props().render;
    const comp = mount(
      renderFn({
        location: '/'
      })
    );
    expect(comp.length).toEqual(1);
    expect(comp.html()).toEqual('<div><h2 class="error">An unexpected error has occurred.</h2></div>');
  });
});
