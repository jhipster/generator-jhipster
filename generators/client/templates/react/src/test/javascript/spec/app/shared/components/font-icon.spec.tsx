import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import FontIcon from '../../../../../../main/webapp/app/shared/ui-components/font-icon/font-icon';

describe('FontIcon', () => {
  let mountedWrapper;
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = mount(
        <FontIcon icon="test"/>
      );
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('renders a span with class font-icon', () => {
    const span = wrapper().find('span.font-icon');
    expect(span.length).to.equal(1);
  });
  it('renders element <i> with correct font and class', () => {
    const span = wrapper().find('i.material-icons');
    expect(span.length).to.equal(1);
    expect(span.html()).to.equal('<i class="material-icons">test</i>');
  });
  it('adds given class to the span', () => {
    wrapper().setProps({ className: 'new-class' });
    const span = wrapper().find('span.font-icon');
    expect(span.length).to.equal(1);
    expect(span).to.have.className('new-class');
  });
});
