import * as React from 'react';
import { Route } from 'react-router-dom';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { PrivateRouteComponent, hasAnyAuthority } from 'app/shared/auth/private-route';

const TestComp = () => <div>Test</div>;

describe('private-route component', () => {
  // All tests will go here
  it('Should throw error when no component is provided', () => {
    expect(() => shallow(<PrivateRouteComponent component={null} isAuthenticated isAuthorized />)).to.throw(Error);
  });

  it('Should render an error message when the user has no authorities', () => {
    const route = shallow(<PrivateRouteComponent component={TestComp} isAuthenticated isAuthorized={false} path="/" />);
    const renderedRoute = route.find(Route);
    const renderFn: Function = renderedRoute.props().render;
    const comp = shallow(
      renderFn({
        location: '/'
      })
    );
    expect(comp.length).to.equal(1);
    const error = comp.find('div.insufficient-authority');
    expect(error.length).to.equal(1);
    expect(error.find('.alert-danger').html()).to.equal(
      '<div class="alert alert-danger">You are not authorized to access this page.</div>'
    );
  });

  it('Should render a route for the component provided when authenticated', () => {
    const route = shallow(<PrivateRouteComponent component={TestComp} isAuthenticated isAuthorized path="/" />);
    const renderedRoute = route.find(Route);
    expect(renderedRoute.length).to.equal(1);
    expect(renderedRoute.props().path).to.equal('/');
    // tslint:disable-next-line:no-unused-expression
    expect(renderedRoute.props().render).to.not.be.undefined;
    const renderFn: Function = renderedRoute.props().render;
    const comp = shallow(
      renderFn({
        location: '/'
      })
    );
    expect(comp.length).to.equal(1);
    expect(comp.html()).to.equal('<div>Test</div>');
  });

  it('Should render a redirect to login when not authenticated', () => {
    const route = shallow(<PrivateRouteComponent component={TestComp} isAuthenticated={false} isAuthorized path="/" />);
    const renderedRoute = route.find(Route);
    expect(renderedRoute.length).to.equal(1);
    const renderFn: Function = renderedRoute.props().render;
    // as rendering redirect outside router will throw error
    expect(() =>
      shallow(
        renderFn({
          location: '/'
        })
      )
    ).to.throw(Error);
  });
});

describe('hasAnyAuthority', () => {
  // All tests will go here
  it('Should return false when authorities is invlaid', () => {
    expect(hasAnyAuthority(undefined, undefined)).to.equal(false);
    expect(hasAnyAuthority(null, [])).to.equal(false);
    expect(hasAnyAuthority([], [])).to.equal(false);
    expect(hasAnyAuthority([], ['ROLE_USER'])).to.equal(false);
  });

  it('Should return true when authorities is valid and hasAnyAuthorities is empty', () => {
    expect(hasAnyAuthority(['ROLE_USER'], [])).to.equal(true);
  });

  it('Should return true when authorities is valid and hasAnyAuthorities contains an authority', () => {
    expect(hasAnyAuthority(['ROLE_USER'], ['ROLE_USER'])).to.equal(true);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLE_USER'])).to.equal(true);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLE_USER', 'ROLE_ADMIN'])).to.equal(true);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLE_USER', 'ROLEADMIN'])).to.equal(true);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLE_ADMIN'])).to.equal(true);
  });

  it('Should return false when authorities is valid and hasAnyAuthorities does not contains an authority', () => {
    expect(hasAnyAuthority(['ROLE_USER'], ['ROLE_ADMIN'])).to.equal(false);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLE_USERSS'])).to.equal(false);
    expect(hasAnyAuthority(['ROLE_USER', 'ROLE_ADMIN'], ['ROLEUSER', 'ROLEADMIN'])).to.equal(false);
  });
});
