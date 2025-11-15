import type Environment from 'yeoman-environment';

import type EnvironmentBuilder from './environment-builder.ts';

/**
 * @param args - positional arguments, a variadic argument is an array at last position.
 */
type CliCommand = (
  args: any,
  options: Record<string, any>,
  env: Environment,
  envBuilder: EnvironmentBuilder,
  createEnvBuilder: (options: any) => Promise<EnvironmentBuilder>,
) => any;

export default CliCommand;
