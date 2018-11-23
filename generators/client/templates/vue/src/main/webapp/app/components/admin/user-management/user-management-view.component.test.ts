import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import UserManagementViewComponent from '@/components/admin/user-management/UserManagementView.vue';
import UserManagementService from '@/components/admin/user-management/UserManagementService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(UserManagementService);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('router-link', {});

jest.mock('axios', () => ({
    get: jest.fn(),
    put: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('UserManagementView Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(UserManagementViewComponent, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('OnInit', () => {
        it('Should call load all on init', async () => {
            // GIVEN
            const userData = {
                id: 1,
                login: 'user',
                firstName: 'first',
                lastName: 'last',
                email: 'first@last.com',
                activated: true,
                langKey: 'en',
                authorities: ['ROLE_USER'],
                createdBy: 'admin',
                createdDate: null,
                lastModifiedBy: null,
                lastModifiedDate: null,
                password: null
            };
            mockedAxios.get.mockReturnValue(Promise.resolve({data: userData}));

            // WHEN
            comp.init(1);
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith(`api/users/1`);
            expect(comp.user).toEqual(userData);
        });
    });
});
