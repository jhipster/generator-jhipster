import { vitest } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import HealthModal from './health-modal.vue';

type HealthModalComponentType = InstanceType<typeof HealthModal>;

const healthService = { getBaseName: vitest.fn(), getSubSystemName: vitest.fn() };

describe('Health Modal Component', () => {
  let healthModal: HealthModalComponentType;

  beforeEach(() => {
    const wrapper = shallowMount(HealthModal, {
      propsData: {
        currentHealth: {},
      },
      global: {
        stubs: {
          'font-awesome-icon': true,
        },
        provide: {
          healthService,
        },
      },
    });
    healthModal = wrapper.vm;
  });

  describe('baseName and subSystemName', () => {
    it('should use healthService', () => {
      healthModal.baseName('base');

      expect(healthService.getBaseName).toHaveBeenCalled();
    });

    it('should use healthService', () => {
      healthModal.subSystemName('base');

      expect(healthService.getSubSystemName).toHaveBeenCalled();
    });
  });

  describe('readableValue should transform data', () => {
    it('to string when is an object', () => {
      const result = healthModal.readableValue({ data: 1000 });

      expect(result).toBe('{"data":1000}');
    });

    it('to string when is a string', () => {
      const result = healthModal.readableValue('data');

      expect(result).toBe('data');
    });
  });
});

describe('Health Modal Component for diskSpace', () => {
  let healthModal: HealthModalComponentType;

  beforeEach(() => {
    const wrapper = shallowMount(HealthModal, {
      propsData: {
        currentHealth: { name: 'diskSpace' },
      },
      global: {
        provide: {
          healthService,
        },
      },
    });
    healthModal = wrapper.vm;
  });

  describe('readableValue should transform data', () => {
    it('to GB when needed', () => {
      const result = healthModal.readableValue(2147483648);

      expect(result).toBe('2.00 GB');
    });

    it('to MB when needed', () => {
      const result = healthModal.readableValue(214748);

      expect(result).toBe('0.20 MB');
    });
  });
});
