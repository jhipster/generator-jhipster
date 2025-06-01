import chalk from 'chalk';
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { monitoringTypes, serviceDiscoveryTypes } from '../../lib/jhipster/index.js';
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;
const { PROMETHEUS, NO: NO_MONITORING } = monitoringTypes;

const command = {
  arguments: {
    appsFolders: {
      type: Array,
      description: 'Application folders',
    },
  },
  configs: {
    monitoring: {
      prompt: gen => ({
        type: 'list',
        name: 'monitoring',
        message: 'Do you want to setup monitoring for your applications ?',
        when: !(gen.workspaces.existingWorkspaces && !gen.options.askAnswered),
        choices: [
          {
            value: NO_MONITORING,
            name: 'No',
          },
          {
            value: PROMETHEUS,
            name: 'Yes, for metrics only with Prometheus',
          },
        ],
        default: NO_MONITORING,
      }),
      scope: 'storage',
    },
    clusteredDbApps: {
      prompt: gen => ({
        type: 'checkbox',
        name: 'clusteredDbApps',
        message: 'Which applications should use a clustered database?',
        choices: gen.applications.filter(app => app.databaseTypeMongodb || app.databaseTypeCouchbase).map(app => app.appFolder),
        when: () =>
          !(gen.workspaces.existingWorkspaces && !gen.options.askAnswered) &&
          gen.applications.filter(app => app.databaseTypeMongodb || app.databaseTypeCouchbase) !== 0,
      }),
      scope: 'storage',
    },
    serviceDiscoveryType: {
      prompt: gen => ({
        name: 'serviceDiscoveryType',
        message: 'Which Service Discovery registry and Configuration server would you like to use ?',
        type: 'list',
        default: () => {
          const serviceDiscoveryEnabledApps = gen.applications.filter(app => app.serviceDiscoveryAny ?? false);
          if (serviceDiscoveryEnabledApps.length === 0) {
            return NO_SERVICE_DISCOVERY;
          }
          if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryConsul)) {
            gen.log.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
            return CONSUL;
          } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryEureka)) {
            gen.log.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
            return EUREKA;
          }
          gen.log.warn(
            chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'),
          );
          gen.log.verboseInfo('Your service discovery enabled apps:');
          serviceDiscoveryEnabledApps.forEach(app => {
            gen.log.verboseInfo(` -${app.baseName} (${app.serviceDiscoveryType})`);
          });
          return CONSUL;
        },
        when: () => {
          if (!(gen.workspaces.existingWorkspaces && !gen.options.askAnswered)) {
            return false;
          }
          const serviceDiscoveryEnabledApps = gen.applications.filter(app => app.serviceDiscoveryAny);
          if (serviceDiscoveryEnabledApps.length === 0) {
            gen.jhipsterConfig.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
          }
          return serviceDiscoveryEnabledApps.length !== 0;
        },
        choices: [
          {
            value: CONSUL,
            name: 'Consul',
          },
          {
            value: EUREKA,
            name: 'JHipster Registry',
          },
          {
            value: NO_SERVICE_DISCOVERY,
            name: 'No Service Discovery and Configuration',
          },
        ],
      }),
      scope: 'storage',
    },
    adminPassword: {
      prompt: gen => ({
        type: 'input',
        when: () => !gen.workspaces.existingWorkspaces && gen.options.askAnswered && gen.serviceDiscoveryType === EUREKA,
        name: 'adminPassword',
        message: 'Enter the admin password used to secure the JHipster Registry',
        default: 'admin',
        validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
      }),
      scope: 'storage',
    },
    jwtSecretKey: {
      cli: {
        type: String,
        env: 'JHI_JWT_SECRET_KEY',
      },
      scope: 'generator',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
