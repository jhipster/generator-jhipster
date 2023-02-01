import _ from 'lodash';
import type Storage from 'yeoman-generator/lib/util/storage.js';

import BaseGenerator from '../base/index.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.mjs';
import { getEntitiesFromDir } from './support/index.mjs';

const { upperFirst } = _;

// Temporary Generator with Typescript implementations
export default class BaseApplicationTsGenerator extends BaseGenerator {
  /**
   * Get all the generator configuration from the .yo-rc.json file
   * @param entityName - Name of the entity to load.
   * @param create - Create storage if doesn't exists.
   */
  getEntityConfig(entityName: string, create = false): Storage | undefined {
    const entityPath = this.destinationPath(JHIPSTER_CONFIG_DIR, `${upperFirst(entityName)}.json`);
    if (!create && !this.fs.exists(entityPath)) return undefined;
    return this.createStorage(entityPath, { sorted: true } as any);
  }

  /**
   * get sorted list of entitiy names according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntityNames(): string[] {
    return this.getExistingEntities().map(entity => entity.name);
  }

  /**
   * get sorted list of entities according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntities(): { name: string; definition: Record<string, any> }[] {
    function isBefore(e1, e2) {
      return e1.definition.changelogDate - e2.definition.changelogDate;
    }

    const configDir = this.destinationPath(JHIPSTER_CONFIG_DIR);

    const entities: { name: string; definition: Record<string, any> }[] = [];
    for (const entityName of [...new Set(((this.jhipsterConfig.entities as string[]) || []).concat(getEntitiesFromDir(configDir)))]) {
      const definition = this.getEntityConfig(entityName)?.getAll();
      if (definition) {
        entities.push({ name: entityName, definition });
      }
    }
    entities.sort(isBefore);
    this.jhipsterConfig.entities = entities.map(({ name }) => name);
    return entities;
  }
}
