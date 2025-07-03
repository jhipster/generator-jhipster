import type { Application as BaseApplicationApplication, Entity as BaseApplicationEntity } from '../base-application/index.js';
import type { Application as SpringBootApplication, Source as SpringBootSource } from '../spring-boot/types.js';

export type { Config, Entity, Field, Options, Relationship } from '../spring-boot/types.js';

export type Application<E extends BaseApplicationEntity = BaseApplicationEntity> = BaseApplicationApplication<E> &
  SpringBootApplication<E> & {
    gatewayRoutes?: { route: string; host: string; serverPort: string }[];
    routes?: string[];
  };

export { SpringBootSource as Source };
