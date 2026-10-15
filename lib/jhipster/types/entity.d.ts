import type angularCommand from '../../../generators/angular/command.ts';
import type clientCommand from '../../../generators/client/command.ts';
import type commonCommand from '../../../generators/common/command.ts';
import type javaDomainCommand from '../../../generators/java/generators/domain/command.ts';
import type springBootCommand from '../../../generators/spring-boot/command.ts';
import type springDataRelationalCommand from '../../../generators/spring-boot/generators/data-relational/command.ts';
import type { ExportEntityConfigFromCommand } from '../../command/types.ts';

import type { Field } from './field.ts';
import type { Relationship } from './relationship.ts';

type MicroserviceEntity = {
  // Required to define the entity id type.
  databaseType?: string;
  // Some features require backend reactive information like some cypress adjustments related to incompatible implementations.
  reactive?: boolean;
  // Some databases have different behavior in cypress tests.
  prodDatabaseType?: string;
  // Workaround different paths?
  clientFramework?: string;
};

/** The entity options the generators declare, as the entity files hold them. */
type EntityOptions = ExportEntityConfigFromCommand<typeof commonCommand> &
  ExportEntityConfigFromCommand<typeof clientCommand> &
  ExportEntityConfigFromCommand<typeof angularCommand> &
  ExportEntityConfigFromCommand<typeof javaDomainCommand> &
  ExportEntityConfigFromCommand<typeof springBootCommand> &
  ExportEntityConfigFromCommand<typeof springDataRelationalCommand>;

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = MicroserviceEntity &
  EntityOptions & {
    name: string;
    changelogDate?: string;
    /** The changelog date of an entity created in incremental mode, given instead of changelogDate. */
    incrementalChangelogDate?: string;
    entitySuffix?: string;
    documentation?: string;
    entityPackage?: string;

    fields?: F[];
    relationships?: R[];
    annotations?: Record<string, string | boolean>;

    skipFakeData?: boolean;
  };
