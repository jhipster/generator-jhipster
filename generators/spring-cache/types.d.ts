import type { Source as SpringBootSource } from '../spring-boot/index.ts';

export type Source = SpringBootSource & {
  addEntryToCache?(entry: { entry: string }): void;
  addEntityToCache?(entry: { entityAbsoluteClass: string; relationships?: { propertyName: string; collection: boolean }[] }): void;
};
