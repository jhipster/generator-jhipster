import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';

import * as config from '../../../shared/config';
import ConfigurationComponent from '@/components/admin/configuration/Configuration.vue';
import ConfigurationService from '@/components/admin/configuration/ConfigurationService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(ConfigurationService);

jest.mock('axios', () => ({
  get: jest.fn()
}));
jest.mock('@/constants.ts', () => ({
  SERVER_API_URL: ''
}));

describe('Configuration Component', () => {
  let wrapper;
  let comp;

  beforeEach(() => {
    wrapper = shallowMount(ConfigurationComponent, { store, i18n, localVue });
    comp = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('OnRouteEnter', () => {
    it('should set all default values correctly', () => {
      expect(comp.configKeys).toEqual([]);
      expect(comp.filtered).toBe('');
      expect(comp.orderProp).toBe('prefix');
      expect(comp.reverse).toBe(false);
    });
    it('Should call load all on init', async () => {
      // WHEN
      comp.init();
      await comp.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('management/env');
      expect(mockedAxios.get).toHaveBeenCalledWith('management/configprops');
    });
  });
  describe('keys method', () => {
    it('should return the keys of an Object', () => {
      // GIVEN
      const data = {
        key1: 'test',
        key2: 'test2'
      };

      // THEN
      expect(comp.keys(data)).toEqual(['key1', 'key2']);
      expect(comp.keys(undefined)).toEqual([]);
    });
  });
});
