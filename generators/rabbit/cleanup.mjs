/* eslint-disable prettier/prettier */
/**
 * @typedef {import('../server/types.mjs').SpringBootApplication} SpringBootApplication
 */
/**
 * @typedef {import('./generator.mjs')} RabbitMQGenerator
 */
/**
 * @typedef {import('../base-application/tasks.mjs').ApplicationTaskParam<SpringBootApplication>} CleanupTaskParam
 */
/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * @this {this} - RabbitMQGenerator
 * @param {CleanupTaskParam} - args
 */
export default function cleanupRabbitMQFilesTask({ application }) {
    if (this.isJhipsterVersionLessThan('7.0.0')) {
      this.removeFile(`${application.javaPackageSrcDir}config/MessagingConfiguration.java`);
      this.removeFile(`${application.javaPackageSrcDir}service/${application.upperFirstCamelCaseBaseName}ConsumerService.java`);
      this.removeFile(`${application.javaPackageSrcDir}service/${application.upperFirstCamelCaseBaseName}ProducerService.java`);
      this.removeFile(`${application.javaPackageSrcDir}web/rest/RabbitMQController.java`);
      this.removeFile(`${application.testDir}web/rest/RabbitMQResourceIT.java`);
    }
    if (this.isJhipsterVersionLessThan('7.1.0')) {
      this.removeFile(`${application.javaPackageSrcDir}config/RabbitMQProperties.java`);
    }
  }
  
