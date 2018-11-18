import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';

import * as config from '../../../shared/config';
import ChangePassword from './ChangePassword.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);

jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn()
}));
jest.mock('../../../constants.ts', () => ({
    SERVER_API_URL: ''
}));

describe('ChangePassword Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedAxios.get.mockReturnValue(Promise.resolve({}));
        mockedAxios.post.mockReset();

        wrapper = shallowMount(ChangePassword, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should show error if passwords do not match', () => {
        // GIVEN
        comp.resetPassword = { newPassword: 'password1', confirmPassword: 'password2' };
        // WHEN
        comp.changePassword();
        // THEN
        expect(comp.doNotMatch).toBe('ERROR');
        expect(comp.error).toBeNull();
        expect(comp.success).toBeNull();
    });

    it('should call Auth.changePassword when passwords match and  set success to OK upon success', async () => {
        // GIVEN
        comp.resetPassword = { currentPassword: 'password1', newPassword: 'password1', confirmPassword: 'password1' };
        mockedAxios.post.mockReturnValue(Promise.resolve({}));

        // WHEN
        comp.changePassword();
        await comp.$nextTick();

        // THEN
        expect(mockedAxios.post).toHaveBeenCalledWith('api/account/change-password', { currentPassword: 'password1', newPassword: 'password1' });

        expect(comp.doNotMatch).toBeNull();
        expect(comp.error).toBeNull();
        expect(comp.success).toBe('OK');
    });

    it('should notify of error if change password fails', async () => {
        // GIVEN
        comp.resetPassword = { currentPassword: 'password1', newPassword: 'password1', confirmPassword: 'password1' };
        mockedAxios.post.mockReturnValue(Promise.reject({}));

        // WHEN
        comp.changePassword();
        await comp.$nextTick();

        // THEN
        expect(comp.doNotMatch).toBeNull();
        expect(comp.success).toBeNull();
        expect(comp.error).toBe('ERROR');
    });

});
