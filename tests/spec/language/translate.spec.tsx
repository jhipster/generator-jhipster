import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Translate from '../../../src/language/translate';

describe('FontIcon', () => {
  let mountedWrapper;
  const wrapper = () => {
    if (!mountedWrapper) {
      mountedWrapper = mount(
        <Translate contentKey="test"/>
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
});
