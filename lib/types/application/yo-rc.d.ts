/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../command/types.js';

export type ApplicationConfiguration = Simplify<
  {
    jhipsterVersion: string;
    baseName: string;
  } & ExportStoragePropertiesFromCommand<typeof import('../../../generators/client/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-boot/command.js').default>
>;
