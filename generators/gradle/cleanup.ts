/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { asWritingTask } from '../base-application/support/task-type-inference.js';

/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
<<<<<<< HEAD
export default asWritingTask(function cleanupOldServerFilesTask({ control }) {
  if (control.isJhipsterVersionLessThan('5.0.0')) {
=======
export default function cleanupOldServerFilesTask(this: BaseGenerator<any, any, any, any, any, any, any, any>) {
  if (this.isJhipsterVersionLessThan('5.0.0')) {
>>>>>>> 843e76094b (rework most of the type regressions)
    this.removeFile('gradle/mapstruct.gradle');
  }
  if (control.isJhipsterVersionLessThan('5.2.2')) {
    this.removeFile('gradle/liquibase.gradle');
  }
});
