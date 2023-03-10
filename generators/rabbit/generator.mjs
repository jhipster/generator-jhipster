/* eslint-disable prettier/prettier */
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_RABBITMQ, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import cleanupRabbitMQFilesTask from './cleanup.mjs';
import writeRabbitMQFilesTask from './files.mjs';

/**
 * @typedef {import('../server/types.mjs').SpringBootApplication} SpringBootApplication
 */
/**
 * @class
 * @extends {BaseApplicationGenerator<SpringBootApplication>}
 */
export default class RabbitMQGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_RABBITMQ);
    }
  }

  get writing() {
    return {
      cleanupRabbitMQFilesTask,
      writeRabbitMQFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
