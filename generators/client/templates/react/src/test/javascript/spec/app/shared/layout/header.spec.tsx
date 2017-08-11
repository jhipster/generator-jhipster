import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';

import {
  Navbar,
  Nav, NavItem
} from 'reactstrap';
import { NavLink } from 'react-router-dom';

import Header from '../../../../../../main/webapp/app/shared/layout/header/header';

describe('Header', () => {
  let mountedWrapper;
  const localeSpy = sinon.spy();
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = shallow(
        <Header currentLocale="en" onLocaleChange={localeSpy} embedded={false}/>
      );
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('Renders a component with LoadingBar, Navbar and Nav', () => {
    const navbar = wrapper().find(Navbar);
    expect(navbar.length).to.equal(1);
    expect(navbar.find('div.navbar-brand').length).to.equal(1);
    expect(navbar.find(NavLink).find('.brand-logo').length).to.equal(1);
    const nav = wrapper().find(Nav);
    expect(nav.length).to.equal(1);
    expect(nav.find(NavItem).length).to.equal(2);
  });
  it('Renders a component with LoadingBar and Nav when embedded', () => {
    wrapper().setProps({ embedded: true });
    const navbar = wrapper().find(Navbar);
    expect(navbar.length).to.equal(0);
    const nav = wrapper().find(Nav);
    expect(nav.length).to.equal(1);
    expect(nav.find(NavItem).length).to.equal(2);
  });
});
