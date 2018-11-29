import { createLocalVue, shallowMount, Wrapper } from "@vue/test-utils";
import Ribbon from './Ribbon.vue';
import RibbonClass from './Ribbon.component';
import axios from 'axios';

import * as config from '../../shared/config';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);

jest.mock('axios', () => ({
  get: jest.fn(),
  put: jest.fn()
}));

describe('Ribbon', () => {
  let ribbon: RibbonClass;
  let wrapper: Wrapper<RibbonClass>;

  const wrap = async (managementInfo?: any) => {
    mockGet(managementInfo);
    wrapper = shallowMount<RibbonClass>(Ribbon, {
      i18n,
      localVue,
    });
    ribbon = wrapper.vm;
    await ribbon.$nextTick();
  }

  const mockGet = (managementInfo: any = {}) => mockedAxios.get.mockReturnValue(Promise.resolve(managementInfo));

  it('should be a Vue instance', async () => {
    await wrap();
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('should not have ribbonEnv when no data', async () => {
    await wrap();
    expect(ribbon.ribbonEnv).toBeNull();
  });

  it('should not have ribbonEnv when no activeProfiles', async () => {
    await wrap({ data: {} });
    expect(ribbon.ribbonEnv).toBeNull();
  });

  it('should not have ribbonEnv when empty activeProfiles', async () => {
    await wrap({ data: { activeProfiles: [] } });
    expect(ribbon.ribbonEnv).toBeNull();
  });

  it('should not have ribbonEnv when empty activeProfiles', async () => {
    const profile = 'dev';
    await wrap({
      data: {
        'display-ribbon-on-profiles': profile,
        activeProfiles: [profile],
      }
    });

    expect(ribbon.ribbonEnv).toEqual(profile);
  });
});
