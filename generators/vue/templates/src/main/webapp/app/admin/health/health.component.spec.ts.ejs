import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import sinon from 'sinon';

import Health from './health.vue';
import HealthService from './health.service';

type HealthComponentType = InstanceType<typeof Health>;

const axiosStub = {
  get: sinon.stub(axios, 'get'),
};

describe('Health Component', () => {
  let health: HealthComponentType;

  beforeEach(() => {
    axiosStub.get.resolves({});
    const wrapper = shallowMount(Health, {
      global: {
        stubs: {
          bModal: true,
          'font-awesome-icon': true,
          'health-modal': true,
        },
        directives: {
          'b-modal': {},
        },
        provide: {
          healthService: new HealthService(),
        },
      },
    });
    health = wrapper.vm;
  });

  describe('baseName and subSystemName', () => {
    it('should return the basename when it has no sub system', () => {
      expect(health.baseName('base')).toBe('base');
    });

    it('should return the basename when it has sub systems', () => {
      expect(health.baseName('base.subsystem.system')).toBe('base');
    });

    it('should return the sub system name', () => {
      expect(health.subSystemName('subsystem')).toBe('');
    });

    it('should return the subsystem when it has multiple keys', () => {
      expect(health.subSystemName('subsystem.subsystem.system')).toBe(' - subsystem.system');
    });
  });

  describe('getBadgeClass', () => {
    it('should get badge class', () => {
      const upBadgeClass = health.getBadgeClass('UP');
      const downBadgeClass = health.getBadgeClass('DOWN');
      expect(upBadgeClass).toEqual('badge-success');
      expect(downBadgeClass).toEqual('badge-danger');
    });
  });

  describe('refresh', () => {
    it('should call refresh on init', async () => {
      // GIVEN
      axiosStub.get.resolves({});

      // WHEN
      health.refresh();
      await health.$nextTick();

      // THEN
      expect(axiosStub.get.calledWith('management/health')).toBeTruthy();
      await health.$nextTick();
      expect(health.updatingHealth).toEqual(false);
    });
    it('should handle a 503 on refreshing health data', async () => {
      // GIVEN
      axiosStub.get.rejects({});

      // WHEN
      health.refresh();
      await health.$nextTick();

      // THEN
      expect(axiosStub.get.calledWith('management/health')).toBeTruthy();
      await health.$nextTick();
      expect(health.updatingHealth).toEqual(false);
    });
  });
});
