import * as React from 'react';
import * as moment from 'moment';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { TextFormat } from '../../../react-jhipster';

describe('text-format component', () => {
  // All tests will go here
  describe('date format', () => {
    it('Should return Invalid date in text when value is invalid', () => {
      const node = mount(<TextFormat value={null} type="date"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql('Invalid date');
    });
    it('Should return blank when value is invalid and blankOnInvalid is true', () => {
      const node = mount(<TextFormat value={null} type="date" blankOnInvalid/>);
      expect(node.length).to.eql(1);
      expect(node.html()).to.eql(null);
    });
    it('Should return default formatted date for valid date', () => {
      const d = new Date();
      const node = mount(<TextFormat value={d} type="date"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql(moment(d).format());
    });
    it('Should return formatted date for valid date and format', () => {
      const d = new Date();
      const node = mount(<TextFormat value={d} type="date" format="DD MM YY"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql(moment(d).format('DD MM YY'));
    });
  });
  describe('number format', () => {
    it('Should return 0 in text when value is invalid', () => {
      const node = mount(<TextFormat value={null} type="number"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql('0');
    });
    it('Should return blank when value is invalid and blankOnInvalid is true', () => {
      const node = mount(<TextFormat value={null} type="number" blankOnInvalid/>);
      expect(node.length).to.eql(1);
      expect(node.html()).to.eql(null);
    });
    it('Should return default formatted number for valid number', () => {
      const n = 100000;
      const node = mount(<TextFormat value={n} type="number"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql('100,000');
    });
    it('Should return formatted number for valid number and format', () => {
      const n = 100000.1234;
      const node = mount(<TextFormat value={n} type="number" format="0,0.00"/>);
      expect(node.length).to.eql(1);
      expect(node.text()).to.eql(moment(n).format('100,000.12'));
    });
  });
});
