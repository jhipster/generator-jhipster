import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import MetricsComponent from '@/components/admin/metrics/Metrics.vue';
import MetricsModal from '@/components/admin/metrics/MetricsModal.vue';
import MetricsService from '@/components/admin/metrics/MetricsService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(MetricsService);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('metrics-modal', MetricsModal);
localVue.component('b-modal', {});

jest.mock('axios', () => ({
    get: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('Metrics Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(MetricsComponent, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('refresh', () => {
        it('should call refresh on init', async () => {
            // GIVEN
            const response = {
                timers: {
                    service: 'test',
                    unrelatedKey: 'test'
                },
                gauges: {
                    'jcache.statistics': {
                        value: 2
                    },
                    unrelatedKey: 'test'
                }
            };
            mockedAxios.get.mockReturnValue(Promise.resolve({data: response}));

            // WHEN
            comp.refresh();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith('management/metrics');
            expect(comp.servicesStats).toEqual({ service: 'test' });
            expect(comp.cachesStats).toEqual({ jcache: { name: 17, value: 2 } });
        });
    });

    describe('isNan', () => {
        it('should return if a variable is NaN', () => {
            expect(comp.filterNaN(1)).toBe(1);
            expect(comp.filterNaN('test')).toBe(0);
        });
    });

    describe('Thread dump method', () => {
        it('should return Thread Dump', async () => {
            const dump = [
                {name: 'test1', threadState: 'RUNNABLE'}
            ];
            mockedAxios.get.mockReturnValue(Promise.resolve({data: {threads: dump}}));

            comp.refreshThreadDumpData();
            await comp.$nextTick();

            expect(mockedAxios.get).toHaveBeenCalledWith('management/threaddump');
            expect(comp.threads).toEqual(dump);
        });
    });

});
