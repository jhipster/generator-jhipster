import type { CommandTypeMap } from '../../lib/command/types.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from '../base-simple-application/types.d.ts';

import type { DockerAddedApplicationLoadingProperties, DockerAddedApplicationPreparingProperties } from './application.ts';
import type command from './command.ts';

export type { Features } from '../base-simple-application/types.d.ts';

type Command = CommandTypeMap<typeof command>;

export type Config = BaseSimpleApplicationConfig & Command['Config'];

export type Options = BaseSimpleApplicationOptions & Command['Options'];

export type DockerComposeService = {
  serviceName: string;
  serviceFile?: string;
  condition?: string;
  additionalConfig?: any;
  extendedServiceName?: string;
};

/** A service of a docker compose file. */
export type DockerComposeServiceConfig = {
  image?: string;
  build?: { context: string; dockerfile: string };
  container_name?: string;
  command?: string;
  environment?: string[];
  ports?: string[];
  volumes?: string[];
  depends_on?: Record<string, { condition: string }>;
  healthcheck?: Record<string, unknown>;
  labels?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * A docker compose file of an application: its template, with its static parts, by its name in the templates of the docker
 * generator, and the data the application merges into it, like its project name, its images and its variables.
 */
export type DockerComposeFile = {
  source: string;
  data: { name?: string; services?: Record<string, DockerComposeServiceConfig> };
  /**
   * The services of the file as a deployment uses them, by the name the deployment gives them: its template merged with
   * its data, the services the application depends on and the hosts of its variables named alike.
   */
  deploymentServices?: Record<string, DockerComposeServiceConfig>;
};

export type Application = BaseSimpleApplicationApplication &
  DockerAddedApplicationLoadingProperties &
  DockerAddedApplicationPreparingProperties;

export type Source = BaseSimpleApplicationSource & {
  addDockerExtendedServiceToApplicationAndServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToApplication?(...services: DockerComposeService[]): void;
  addDockerDependencyToApplication?(...services: DockerComposeService[]): void;
};
