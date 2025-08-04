import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from '../base-simple-application/types.d.ts';

import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type Config = BaseSimpleApplicationConfig & Command['Config'];

export type Options = BaseSimpleApplicationOptions & Command['Options'];

export type DockerComposeService = {
  serviceName: string;
  serviceFile?: string;
  condition?: string;
  additionalConfig?: any;
  extendedServiceName?: string;
};

export type Application = BaseSimpleApplicationApplication &
  Command['Application'] & {
    dockerContainers?: Record<string, string>;
    dockerServicesDir?: string;
    dockerServices?: string[];
    keycloakSecrets?: string[];
  };

export type Source = BaseSimpleApplicationSource & {
  addDockerExtendedServiceToApplicationAndServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToApplication?(...services: DockerComposeService[]): void;
  addDockerDependencyToApplication?(...services: DockerComposeService[]): void;
};
