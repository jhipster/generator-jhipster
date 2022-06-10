// eslint-disable-next-line import/prefer-default-export
export const createDockerExtendedServices = (...services) => ({
  services: Object.fromEntries(
    services.map(({ serviceName, serviceFile = `./${serviceName}.yml`, extendedServiceName = serviceName, additionalConfig = {} }) => [
      serviceName,
      {
        extends: {
          file: serviceFile,
          service: extendedServiceName,
        },
        ...additionalConfig,
      },
    ])
  ),
});
