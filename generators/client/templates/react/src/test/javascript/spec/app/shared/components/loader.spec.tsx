import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Loader from '../../../../../../main/webapp/app/shared/components/loader/loader';

describe('Loader', () => {
  let mountedWrapper;
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = mount(
        <Loader loading={false}><div>test</div></Loader>
      );
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('renders a loader-container-stage with children when loading false', () => {
    const element = wrapper().find('div.loader-container-stage');
    expect(element.length).to.equal(1);
    expect(element.contains(<div>test</div>)).to.equal(true);
  });
  it('renders a loader-container without children when loading true', () => {
    wrapper().setProps({ loading: true });
    const element = wrapper().find('div.loader-container-stage');
    expect(element.length).to.equal(1);
    expect(element.contains((
      <div className="loading-text">
        Loading...
      </div>
    ))).to.equal(true);
    expect(element.find('div.loader-container').length).to.equal(1);
    expect(element.contains(<div>test</div>)).to.equal(false);
  });
  it('renders a loader-container without children when loading true with noText', () => {
    wrapper().setProps({ loading: true, noText: true });
    const element = wrapper().find('div.loader-container-stage');
    expect(element.length).to.equal(1);
    expect(element.contains((
      <div className="loading-text">
        Loading...
      </div>
    ))).to.equal(false);
    expect(element.find('div.loader-container').length).to.equal(1);
    expect(element.contains(<div>test</div>)).to.equal(false);
  });
});
