import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import GatewayComponent from '@/components/admin/gateway/Gateway.vue';
import GatewayService from '@/components/admin/gateway/GatewayService.vue';

const localVue = createLocalVue();

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(GatewayService);
localVue.component('font-awesome-icon', FontAwesomeIcon);

jest.mock('axios', () => ({
    get: jest.fn(),
    put: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('Gateway Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(GatewayComponent, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

});
