import { shallowMount } from '@vue/test-utils';

import MetricsModal from './metrics-modal.vue';

type MetricsModalComponentType = InstanceType<typeof MetricsModal>;

describe('Metrics Component', () => {
  let metricsModal: MetricsModalComponentType;

  beforeEach(() => {
    const wrapper = shallowMount(MetricsModal, {
      propsData: {
        threadDump: [
          { name: 'test1', threadState: 'RUNNABLE' },
          { name: 'test2', threadState: 'WAITING' },
          { name: 'test3', threadState: 'TIMED_WAITING' },
          { name: 'test4', threadState: 'BLOCKED' },
          { name: 'test5', threadState: 'BLOCKED' },
          { name: 'test5', threadState: 'NONE' },
        ],
      },
    });
    metricsModal = wrapper.vm;
  });

  describe('init', () => {
    it('should count the numbers of each thread type', async () => {
      expect(metricsModal.threadDumpData.threadDumpRunnable).toBe(1);
      expect(metricsModal.threadDumpData.threadDumpWaiting).toBe(1);
      expect(metricsModal.threadDumpData.threadDumpTimedWaiting).toBe(1);
      expect(metricsModal.threadDumpData.threadDumpBlocked).toBe(2);
      expect(metricsModal.threadDumpData.threadDumpAll).toBe(5);
    });
  });

  describe('getBadgeClass', () => {
    it('should return badge-success for RUNNABLE', () => {
      expect(metricsModal.getBadgeClass('RUNNABLE')).toBe('badge-success');
    });

    it('should return badge-info for WAITING', () => {
      expect(metricsModal.getBadgeClass('WAITING')).toBe('badge-info');
    });

    it('should return badge-warning for TIMED_WAITING', () => {
      expect(metricsModal.getBadgeClass('TIMED_WAITING')).toBe('badge-warning');
    });

    it('should return badge-danger for BLOCKED', () => {
      expect(metricsModal.getBadgeClass('BLOCKED')).toBe('badge-danger');
    });

    it('should return undefined for anything else', () => {
      expect(metricsModal.getBadgeClass('')).toBe(undefined);
    });
  });
});
