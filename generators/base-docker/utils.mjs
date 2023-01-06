/**
 * Creates EditFileCallback that creates a base docker compose yml file if empty.
 *
 * @param {string} name Docker compose v2 project name
 * @returns {import('../../generators/generator-base.js').EditFileCallback}
 */
export const createDockerComposeFile = (
  name = 'jhipster'
) => `# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: ${name}
`;

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
