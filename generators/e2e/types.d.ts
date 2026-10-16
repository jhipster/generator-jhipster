import type { Application as ClientApplication, Entity } from '../client/types.ts';

import type { E2eAddedApplicationProperties } from './application.ts';

export type { Config, Entity, Features, Options, Source } from '../client/types.ts';

export type Application<E extends Entity = Entity> = ClientApplication<E> & E2eAddedApplicationProperties;
