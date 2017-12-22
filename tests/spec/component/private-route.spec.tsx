import * as React from 'react';
import { Route } from 'react-router-dom';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { PrivateRouteComponent } from '../../../react-jhipster';

const TestComp = () => <div>Test</div>;

describe('private-route component', () => {

  // All tests will go here
  it('Should throw error when no component is provided', () => {
    expect(() => shallow(<PrivateRouteComponent component={null} isAuthenticated />)).to.throw(Error);
  });

  it('Should render a route for the component provided when authenticated', () => {
    const route = shallow(<PrivateRouteComponent component={TestComp} isAuthenticated path="/" />);
    const renderedRoute = route.find(Route);
    expect(renderedRoute.length).to.equal(1);
    expect(renderedRoute.props().path).to.equal('/');
    // tslint:disable-next-line:no-unused-expression
    expect(renderedRoute.props().render).to.not.be.undefined;
    const renderFn = renderedRoute.props().render;
    const comp = shallow(renderFn({
      location: '/'
    }));
    expect(comp.length).to.equal(1);
    expect(comp.html()).to.equal('<div>Test</div>');
  });

  it('Should render a redirect to login when not authenticated', () => {
    const route = shallow(<PrivateRouteComponent component={TestComp} isAuthenticated={false} path="/" />);
    const renderedRoute = route.find(Route);
    expect(renderedRoute.length).to.equal(1);
    const renderFn = renderedRoute.props().render;
    // as rendering redirect outside router will throw error
    expect(() => shallow(renderFn({
      location: '/'
    }))).to.throw(Error);
  });
});
