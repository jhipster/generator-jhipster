import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import sinon from 'sinon';

import Metrics from './metrics.vue';
import MetricsService from './metrics.service';

type MetricsComponentType = InstanceType<typeof Metrics>;

const axiosStub = {
  get: sinon.stub(axios, 'get'),
};

describe('Metrics Component', () => {
  let metricsComponent: MetricsComponentType;
  const response = {
    jvm: {
      'PS Eden Space': {
        committed: 5.57842432e8,
        max: 6.49592832e8,
        used: 4.20828184e8,
      },
      'Code Cache': {
        committed: 2.3461888e7,
        max: 2.5165824e8,
        used: 2.2594368e7,
      },
      'Compressed Class Space': {
        committed: 1.2320768e7,
        max: 1.073741824e9,
        used: 1.1514008e7,
      },
      'PS Survivor Space': {
        committed: 1.5204352e7,
        max: 1.5204352e7,
        used: 1.2244376e7,
      },
      'PS Old Gen': {
        committed: 1.10624768e8,
        max: 1.37887744e9,
        used: 4.1390776e7,
      },
      Metaspace: {
        committed: 9.170944e7,
        max: -1.0,
        used: 8.7377552e7,
      },
    },
    databases: {
      min: {
        value: 10.0,
      },
      max: {
        value: 10.0,
      },
      idle: {
        value: 10.0,
      },
      usage: {
        '0.0': 0.0,
        '1.0': 0.0,
        max: 0.0,
        totalTime: 4210.0,
        mean: 701.6666666666666,
        '0.5': 0.0,
        count: 6,
        '0.99': 0.0,
        '0.75': 0.0,
        '0.95': 0.0,
      },
      pending: {
        value: 0.0,
      },
      active: {
        value: 0.0,
      },
      acquire: {
        '0.0': 0.0,
        '1.0': 0.0,
        max: 0.0,
        totalTime: 0.884426,
        mean: 0.14740433333333333,
        '0.5': 0.0,
        count: 6,
        '0.99': 0.0,
        '0.75': 0.0,
        '0.95': 0.0,
      },
      creation: {
        '0.0': 0.0,
        '1.0': 0.0,
        max: 0.0,
        totalTime: 27.0,
        mean: 3.0,
        '0.5': 0.0,
        count: 9,
        '0.99': 0.0,
        '0.75': 0.0,
        '0.95': 0.0,
      },
      connections: {
        value: 10.0,
      },
    },
    'http.server.requests': {
      all: {
        count: 5,
      },
      percode: {
        '200': {
          max: 0.0,
          mean: 298.9012628,
          count: 5,
        },
      },
    },
    cache: {
      usersByEmail: {
        'cache.gets.miss': 0.0,
        'cache.puts': 0.0,
        'cache.gets.hit': 0.0,
        'cache.removals': 0.0,
        'cache.evictions': 0.0,
      },
      usersByLogin: {
        'cache.gets.miss': 1.0,
        'cache.puts': 1.0,
        'cache.gets.hit': 1.0,
        'cache.removals': 0.0,
        'cache.evictions': 0.0,
      },
      'tech.jhipster.domain.Authority': {
        'cache.gets.miss': 0.0,
        'cache.puts': 2.0,
        'cache.gets.hit': 0.0,
        'cache.removals': 0.0,
        'cache.evictions': 0.0,
      },
      'tech.jhipster.domain.User.authorities': {
        'cache.gets.miss': 0.0,
        'cache.puts': 1.0,
        'cache.gets.hit': 0.0,
        'cache.removals': 0.0,
        'cache.evictions': 0.0,
      },
      'tech.jhipster.domain.User': {
        'cache.gets.miss': 0.0,
        'cache.puts': 1.0,
        'cache.gets.hit': 0.0,
        'cache.removals': 0.0,
        'cache.evictions': 0.0,
      },
    },
    garbageCollector: {
      'jvm.gc.max.data.size': 1.37887744e9,
      'jvm.gc.pause': {
        '0.0': 0.0,
        '1.0': 0.0,
        max: 0.0,
        totalTime: 242.0,
        mean: 242.0,
        '0.5': 0.0,
        count: 1,
        '0.99': 0.0,
        '0.75': 0.0,
        '0.95': 0.0,
      },
      'jvm.gc.memory.promoted': 2.992732e7,
      'jvm.gc.memory.allocated': 1.26362872e9,
      classesLoaded: 17393.0,
      'jvm.gc.live.data.size': 3.1554408e7,
      classesUnloaded: 0.0,
    },
    services: {
      '/management/info': {
        GET: {
          max: 0.0,
          mean: 104.952893,
          count: 1,
        },
      },
      '/api/authenticate': {
        POST: {
          max: 0.0,
          mean: 909.53003,
          count: 1,
        },
      },
      '/api/account': {
        GET: {
          max: 0.0,
          mean: 141.209628,
          count: 1,
        },
      },
      '/**': {
        GET: {
          max: 0.0,
          mean: 169.4068815,
          count: 2,
        },
      },
    },
    processMetrics: {
      'system.load.average.1m': 3.63,
      'system.cpu.usage': 0.5724934148485453,
      'system.cpu.count': 4.0,
      'process.start.time': 1.548140811306e12,
      'process.files.open': 205.0,
      'process.cpu.usage': 0.003456347568026252,
      'process.uptime': 88404.0,
      'process.files.max': 1048576.0,
    },
    threads: [{ name: 'test1', threadState: 'RUNNABLE' }],
  };

  beforeEach(() => {
    axiosStub.get.resolves({ data: { timers: [], gauges: [] } });
    const wrapper = shallowMount(Metrics, {
      global: {
        stubs: {
          bModal: true,
          bProgress: true,
          bProgressBar: true,
          'font-awesome-icon': true,
          'metrics-modal': true,
        },
        directives: {
          'b-modal': {},
          'b-progress': {},
          'b-progress-bar': {},
        },
        provide: {
          metricsService: new MetricsService(),
        },
      },
    });
    metricsComponent = wrapper.vm;
  });

  describe('refresh', () => {
    it('should call refresh on init', async () => {
      // GIVEN
      axiosStub.get.resolves({ data: response });

      // WHEN
      await metricsComponent.refresh();
      await metricsComponent.$nextTick();

      // THEN
      expect(axiosStub.get.calledWith('management/jhimetrics')).toBeTruthy();
      expect(axiosStub.get.calledWith('management/threaddump')).toBeTruthy();
      expect(metricsComponent.metrics).toHaveProperty('jvm');
      expect(metricsComponent.metrics).toEqual(response);
      expect(metricsComponent.threadStats).toEqual({
        threadDumpRunnable: 1,
        threadDumpWaiting: 0,
        threadDumpTimedWaiting: 0,
        threadDumpBlocked: 0,
        threadDumpAll: 1,
      });
    });
  });

  describe('isNan', () => {
    it('should return if a variable is NaN', () => {
      expect(metricsComponent.filterNaN(1)).toBe(1);
      expect(metricsComponent.filterNaN('test')).toBe(0);
    });
  });
});
