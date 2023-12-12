export type SpringCacheSourceType = {
  addEntryToCache?(entry: { entry: string }): void;
  addEntityToCache?(entry: { entityAbsoluteClass: string; relationships?: { propertyName: string; collection: boolean }[] }): void;
};
