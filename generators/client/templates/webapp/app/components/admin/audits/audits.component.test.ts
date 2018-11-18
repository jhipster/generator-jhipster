import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import AuditsComponent from '@/components/admin/audits/Audits.vue';
import AuditsService from '@/components/admin/audits/AuditsService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(AuditsService);
localVue.component('font-awesome-icon', FontAwesomeIcon);

jest.mock('axios', () => ({
    get: jest.fn(),
    put: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('Audits Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(AuditsComponent, { store, i18n, localVue, stubs: {
                bPagination: true, jhiItemCount: true
            } });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('today function ', () => {
        it('should set toDate to current date', () => {
            comp.today();
            expect(comp.toDate).toBe(getDate());
        });
    });

    describe('previousMonth function ', () => {
        it('should set fromDate to current date', () => {
            comp.previousMonth();
            expect(comp.fromDate).toBe(getDate(false));
        });
    });

    describe('By default, on init', () => {
        it('should set all default values correctly', async () => {
            mockedAxios.get.mockReturnValue(Promise.resolve({}));

            comp.init();
            await comp.$nextTick();

            expect(comp.predicate).toBe('timestamp');
            expect(comp.toDate).toBe(getDate());
            expect(comp.fromDate).toBe(getDate(false));
            expect(comp.itemsPerPage).toBe(20);
            expect(comp.page).toBe(1);
            expect(comp.reverse).toBeFalsy();
        });
    });

    describe('OnInit', () => {
        it('Should call load all on init', async () => {
            // GIVEN
            mockedAxios.get.mockReturnValue(Promise.resolve({data:['test']}));
            const today = getDate();
            const fromDate = getDate(false);
            // WHEN
            comp.init();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith(`management/audits?fromDate=${fromDate}&toDate=${today}&sort=auditEventDate,desc&sort=id&page=0&size=20`);
            expect(comp.audits.length).toEqual(1);
        });
    });
});

function build2DigitsDatePart(datePart) {
    return `0${datePart}`.slice(-2);
}

function getDate(isToday = true) {
    let date = new Date();
    if (isToday) {
        // Today + 1 day - needed if the current day must be included
        date.setDate(date.getDate() + 1);
    } else {
        // get last month
        if (date.getMonth() === 0) {
            date = new Date(date.getFullYear() - 1, 11, date.getDate());
        } else {
            date = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        }
    }
    const monthString = build2DigitsDatePart(date.getMonth() + 1);
    const dateString = build2DigitsDatePart(date.getDate());
    return `${date.getFullYear()}-${monthString}-${dateString}`;
}
