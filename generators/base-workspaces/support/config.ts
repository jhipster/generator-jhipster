import { mutateData, pickFields } from '../../../lib/utils/index.ts';

import { monitoringTypes, serviceDiscoveryTypes } from '../../../lib/jhipster/index.ts';
import type { Deployment } from '../types.js';

const { PROMETHEUS, ELK } = monitoringTypes;
const { NO: NO_SERVICE_DISCOVERY, CONSUL, EUREKA } = serviceDiscoveryTypes;

/**
 * @param {Object} config - config to load config from
 * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
 */
export const loadPlatformConfig = ({ config, application }: { config: any; application: Deployment }) => {
  mutateData(application, pickFields(config, ['serviceDiscoveryType', 'monitoring']));
};

export const loadDerivedServerAndPlatformProperties = ({ application }: { application: any }) => {
  if (!application.serviceDiscoveryType) {
    application.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
  }
  application.serviceDiscoveryAny = application.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
  application.serviceDiscoveryConsul = application.serviceDiscoveryType === CONSUL;
  application.serviceDiscoveryEureka = application.serviceDiscoveryType === EUREKA;
};

export const loadDerivedPlatformConfig = ({ application }: { application: Deployment }) => {
  application.monitoringElk = application.monitoring === ELK;
  application.monitoringPrometheus = application.monitoring === PROMETHEUS;
  loadDerivedServerAndPlatformProperties({ application });
};
