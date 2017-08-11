import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';

import Toggle from '../../../../../../main/webapp/app/shared/ui-components/toggle/toggle';

describe('Toggle', () => {
  let mountedWrapper;
  const onToggleSpy = sinon.spy();
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = mount(
        <Toggle label="test" toggled onToggle={onToggleSpy}/>
      );
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('Renders a component with label, input and content', () => {
    const label = wrapper().find('label.switch');
    expect(label.length).to.equal(1);
    expect(label.find('span.switch-label').length).to.equal(1);
    expect(label.find('span.switch-handle').length).to.equal(1);
    const input = label.find('input.switch-input');
    expect(input.length).to.equal(1);
    expect(input).to.be.checked();
    expect(wrapper().contains(<span className="pad-left-10">test</span>)).to.equal(true);
  });
  it('Toggle state changes when property is updated', () => {
    wrapper().setProps({ toggled: false });
    let input = wrapper().find('input.switch-input');
    expect(input.length).to.equal(1);
    expect(input).to.not.be.checked();
    wrapper().setProps({ toggled: true });
    input = wrapper().find('input.switch-input');
    expect(input.length).to.equal(1);
    expect(input).to.be.checked();
  });
  it('Toggle state changes and method is called when clicked', () => {
    wrapper().find('label.switch').simulate('click');
    expect(onToggleSpy.called).to.equal(true);
  });
});
