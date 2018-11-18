import { shallowMount, createLocalVue } from '@vue/test-utils';

import * as config from '../../../shared/config';
import MetricsModal from '@/components/admin/metrics/MetricsModal.vue';

const localVue = createLocalVue();

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);

jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('Metrics Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(MetricsModal, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('init', () => {
        it('should count the numbers of each thread type', () => {
            wrapper.setProps({ threadDump: [
                { name: 'test1', threadState: 'RUNNABLE' },
                { name: 'test2', threadState: 'WAITING' },
                { name: 'test3', threadState: 'TIMED_WAITING' },
                { name: 'test4', threadState: 'BLOCKED' },
                { name: 'test5', threadState: 'BLOCKED' },
                { name: 'test5', threadState: 'NONE' }
            ] });

            expect(comp.threadDumpData.threadDumpRunnable).toBe(1);
            expect(comp.threadDumpData.threadDumpWaiting).toBe(1);
            expect(comp.threadDumpData.threadDumpTimedWaiting).toBe(1);
            expect(comp.threadDumpData.threadDumpBlocked).toBe(2);
            expect(comp.threadDumpData.threadDumpAll).toBe(5);
        });
    });

    describe('getBadgeClass', () => {
        it('should return badge-success for RUNNABLE', () => {
            expect(comp.getBadgeClass('RUNNABLE')).toBe('badge-success');
        });

        it('should return badge-info for WAITING', () => {
            expect(comp.getBadgeClass('WAITING')).toBe('badge-info');
        });

        it('should return badge-warning for TIMED_WAITING', () => {
            expect(comp.getBadgeClass('TIMED_WAITING')).toBe('badge-warning');
        });

        it('should return badge-danger for BLOCKED', () => {
            expect(comp.getBadgeClass('BLOCKED')).toBe('badge-danger');
        });

        it('should return undefined for anything else', () => {
            expect(comp.getBadgeClass('')).toBe(undefined);
        });
    });

});
