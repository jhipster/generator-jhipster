import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';

import * as config from '@/shared/config';
import Settings from '@/components/account/Settings.vue';

const localVue = createLocalVue();

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);

jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn()
}));
jest.mock('@/constants.js', () =>({
    SERVER_API_URL: ''
}));

describe('Settings Component', () => {
    let wrapper;
    let comp;
    let account = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@jhipster.org'
    };

    beforeEach(() => {
        axios.get.mockReset();
        axios.get.mockReturnValue(Promise.resolve({}));
        axios.post.mockReset();

        store.commit('authenticated', account);
        wrapper = shallowMount(Settings, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should send the current identity upon save', async () => {
        // GIVEN
        axios.post.mockReturnValue(Promise.resolve({}));

        //WHEN
        comp.save();
        await comp.$nextTick();

        //THEN
        expect(axios.post).toHaveBeenCalledWith('api/account', account);
    });

    it('should notify of success upon successful save', async () => {
        // GIVEN
        axios.post.mockReturnValue(Promise.resolve(account));

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(comp.error).toBeNull();
        expect(comp.success).toBe('OK');
    });

    it('should notify of error upon failed save', async () => {
        // GIVEN
        axios.post.mockReturnValue(Promise.reject({}));

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(comp.error).toEqual('ERROR');
        expect(comp.success).toBeNull();
    });

});
