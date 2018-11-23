import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import UserManagementComponent from '@/components/admin/user-management/UserManagement.vue';
import UserManagementService from '@/components/admin/user-management/UserManagementService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(UserManagementService);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('router-link', {});
localVue.component('b-modal', {});

jest.mock('axios', () => ({
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('UserManagement Component', () => {
    let wrapper;
    let comp;
    let account = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@jhipster.org'
    };

    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedAxios.get.mockReturnValue(Promise.resolve({}));

        store.commit('authenticated', account);
        wrapper = shallowMount(UserManagementComponent, { store, i18n, localVue, stubs: {
                bPagination: true, jhiItemCount: true
            } });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('OnInit', () => {
        it('Should call load all on init', async() => {
            // GIVEN
            mockedAxios.get.mockReturnValue(Promise.resolve({}));

            // WHEN
            comp.loadAll();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith(`api/users?sort=id,desc&page=0&size=20`);
        });
    });

    describe('setActive', () => {
        it('Should update user and call load all', async() => {
            // GIVEN
            mockedAxios.put.mockReturnValue(Promise.resolve({}));
            mockedAxios.get.mockReturnValue(Promise.resolve({}));

            // WHEN
            comp.setActive({id:'test'}, true);
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.put).toHaveBeenCalledWith(`api/users`, {id:'test', activated: true});
            expect(mockedAxios.get).toHaveBeenCalledWith(`api/users?sort=id,desc&page=0&size=20`);
        });
    });

    describe('confirmDelete', () => {
        it('Should call delete service on confirmDelete', async() => {
            // GIVEN
            mockedAxios.delete.mockReturnValue(Promise.resolve({}));
            mockedAxios.get.mockReturnValue(Promise.resolve({}));

            // WHEN
            comp.prepareRemove({login:'test'});
            comp.deleteUser();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.delete).toHaveBeenCalledWith(`api/users/test`);
            expect(mockedAxios.get).toHaveBeenCalledWith(`api/users?sort=id,desc&page=0&size=20`);
        });
    });
});
