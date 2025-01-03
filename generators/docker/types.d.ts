export type DockerComposeService = {
  serviceName: string;
  serviceFile?: string;
  condition?: string;
  additionalConfig?: any;
  extendedServiceName?: string;
};

export type DockerApplicationType = {
  keycloakSecrets?: string[];
};

export type DockerSourceType = {
  addDockerExtendedServiceToApplicationAndServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToServices?(...services: DockerComposeService[]): void;
  addDockerExtendedServiceToApplication?(...services: DockerComposeService[]): void;
  addDockerDependencyToApplication?(...services: DockerComposeService[]): void;
};
