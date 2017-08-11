import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { Tooltip } from 'reactstrap';

import IconButton from '../../../../../../main/webapp/app/shared/ui-components/icon-button/icon-button';

describe('IconButton', () => {
  let mountedWrapper;
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = mount(
        <IconButton icon="test"/>
      );
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('renders a span with class icon-button', () => {
    const span = wrapper().find('span.icon-button');
    expect(span.length).to.equal(1);
    const tooltip = wrapper().find(Tooltip);
    expect(tooltip.length).to.equal(0);
  });
  it('renders a button with icon inside the wrapper by deafult', () => {
    const btn = wrapper().find('button.btn');
    expect(btn.length).to.equal(1);
    const icon = btn.find('i.material-icons');
    expect(icon.length).to.equal(1);
    expect(icon.html()).to.equal('<i class="material-icons">test</i>');
  });
  it('adds tooltip when given', () => {
    const wrapperInstance = mount(
      <IconButton icon="test" tooltip="content" tooltipPlacement="right"/>
    );
    const tooltip: Tooltip = wrapperInstance.find(Tooltip);
    expect(tooltip.length).to.equal(1);
    expect(tooltip.props().placement).to.equal('right');
    expect(tooltip.props().children).to.equal('content');
  });
});
