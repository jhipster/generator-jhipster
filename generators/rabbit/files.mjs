/* eslint-disable prettier/prettier */
import { SERVER_MAIN_SRC_DIR } from '../generator-constants.mjs';
import { moveToJavaPackageSrcDir } from '../server/support/index.mjs';

/**
 * @type {import('../base/api.mjs').WriteFileSection}
 * The defimport { renameSync } from 'fs';
ault is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */

export const rabbitFiles = {
    config: [
      {
        path: `${SERVER_MAIN_SRC_DIR}package/`,
        renameTo: moveToJavaPackageSrcDir,
        templates: ['config/RabbitMQConfig.java'],
      },
    ],
    domain: [
      {
        path: `${SERVER_MAIN_SRC_DIR}package/`,
        renameTo: moveToJavaPackageSrcDir,
        templates: ['domain/RabbitMessageModel.java'],
      },
    ],
    listener: [
      {
        path: `${SERVER_MAIN_SRC_DIR}package/`,
        renameTo: moveToJavaPackageSrcDir,
        templates: ['listener/RabbitMQConsumer.java'],
      },
    ],
    publisher: [
      {
        path: `${SERVER_MAIN_SRC_DIR}package/`,
        renameTo: moveToJavaPackageSrcDir,
        templates: ['publisher/RabbitMQPublisher.java'],
      },
    ],
  };

export default function writeRabbitMQFilesTask({ application }) {
  return this.writeFiles({
    sections: rabbitFiles,
    context: application,
  });
}
