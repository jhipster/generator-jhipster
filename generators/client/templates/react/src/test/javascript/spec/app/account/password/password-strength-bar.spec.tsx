import * as React from 'react';
import * as Enzyme from 'enzyme';
import * as EnzymeAdapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';

import PasswordStrengthBar from '../../../../../../main/webapp/app/modules/account/password/password-strength-bar';

describe('Component Tests', () => {
  describe('PasswordStrengthBarComponent', () => {
    Enzyme.configure({ adapter: new EnzymeAdapter() });

    const wrapper = Enzyme.shallow(<PasswordStrengthBar password={''}/>);
    let instance;

    beforeEach(() => {
      instance = wrapper.instance();
    });

    describe('PasswordStrengthBarComponents', () => {
      it('should initialize with default values', () => {
        expect(instance.measureStrength('')).to.be.eq(0);
        expect(instance.colors).to.be.eq(instance.colors);
        expect(instance.getColor(0).idx).to.be.eq(1);
        expect(instance.getColor(0).col).to.be.eq(instance.colors[0]);
      });

      it('should increase strength upon password value change', () => {
        expect(instance.measureStrength('')).to.be.eq(0);
        expect(instance.measureStrength('aa')).to.be.not.lessThan(instance.measureStrength(''));
        expect(instance.measureStrength('aa^6')).to.be.not.lessThan(instance.measureStrength('aa'));
        expect(instance.measureStrength('Aa090(**)')).to.be.not.lessThan(instance.measureStrength('aa^6'));
        expect(instance.measureStrength('Aa090(**)+-07365')).to.be.not.lessThan(instance.measureStrength('Aa090(**)'));
      });

      it('should change the color based on strength', () => {
        expect(instance.getColor(0).col).to.be.eq(instance.colors[0]);
        expect(instance.getColor(11).col).to.be.eq(instance.colors[1]);
        expect(instance.getColor(22).col).to.be.eq(instance.colors[2]);
        expect(instance.getColor(33).col).to.be.eq(instance.colors[3]);
        expect(instance.getColor(44).col).to.be.eq(instance.colors[4]);
      });
    });
  });
});
