import type Environment from 'yeoman-environment';
import EnvironmentBuilder from './environment-builder.mjs';

/**
 * @param args - positional arguments, a varidic argument is an array at last position.
 */
type CliCommand = (
  args: any,
  options: Record<string, any>,
  env: Environment,
  envBuilder: EnvironmentBuilder,
  createEnvBuilder: (options: any) => Promise<EnvironmentBuilder>
) => any;

export default CliCommand;
