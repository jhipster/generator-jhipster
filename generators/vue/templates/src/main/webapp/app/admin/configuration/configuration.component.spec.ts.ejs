import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import sinon from 'sinon';

import Configuration from './configuration.vue';

type ConfigurationComponentType = InstanceType<typeof Configuration>;

const axiosStub = {
  get: sinon.stub(axios, 'get'),
};

describe('Configuration Component', () => {
  let configuration: ConfigurationComponentType;

  beforeEach(() => {
    axiosStub.get.reset();
    axiosStub.get.resolves({
      data: { contexts: [{ beans: [{ prefix: 'A' }, { prefix: 'B' }] }], propertySources: [{ properties: { key1: { value: 'value' } } }] },
    });
    const wrapper = shallowMount(Configuration);
    configuration = wrapper.vm;
  });

  describe('OnRouteEnter', () => {
    it('should set all default values correctly', () => {
      expect(configuration.configKeys).toEqual([]);
      expect(configuration.filtered).toBe('');
      expect(configuration.orderProp).toBe('prefix');
      expect(configuration.reverse).toBe(false);
    });
    it('Should call load all on init', async () => {
      // WHEN
      configuration.init();
      await configuration.$nextTick();

      // THEN
      expect(axiosStub.get.calledWith('management/env')).toBeTruthy();
      expect(axiosStub.get.calledWith('management/configprops')).toBeTruthy();
    });
  });

  describe('keys method', () => {
    it('should return the keys of an Object', () => {
      // GIVEN
      const data = {
        key1: 'test',
        key2: 'test2',
      };

      // THEN
      expect(configuration.keys(data)).toEqual(['key1', 'key2']);
      expect(configuration.keys(undefined)).toEqual([]);
    });
  });

  describe('changeOrder function', () => {
    it('should change order', () => {
      // GIVEN
      const rev = configuration.reverse;

      // WHEN
      configuration.changeOrder('prefix');

      // THEN
      expect(configuration.orderProp).toBe('prefix');
      expect(configuration.reverse).toBe(!rev);
    });
  });
});
